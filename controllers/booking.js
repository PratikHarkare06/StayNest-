const Booking = require("../models/booking");
const Listing = require("../models/listing");

// ── Show Booking Confirmation Page ────────────────────────────────────────────
module.exports.showConfirmPage = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, adults = 1, children = 0 } = req.query;

        if (!checkIn || !checkOut) {
            req.flash("error", "Please select your dates first.");
            return res.redirect(`/listings/${id}`);
        }

        const listing = await Listing.findById(id).populate("owner");
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        const inDate  = new Date(checkIn);
        const outDate = new Date(checkOut);
        const nights  = Math.ceil(Math.abs(outDate - inDate) / 86400000);

        if (nights <= 0) {
            req.flash("error", "Invalid dates.");
            return res.redirect(`/listings/${id}`);
        }

        const guests      = parseInt(adults) + parseInt(children);
        const subtotal    = listing.price * nights;
        const cleaningFee = Math.round(subtotal * 0.05);
        const serviceFee  = Math.round(subtotal * 0.12);
        const taxes       = Math.round(subtotal * 0.18);
        const total       = subtotal + cleaningFee + serviceFee + taxes;

        res.render("listings/booking-confirm.ejs", {
            listing, checkIn, checkOut, nights,
            adults: parseInt(adults), children: parseInt(children), guests,
            subtotal, cleaningFee, serviceFee, taxes, total,
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect(`/listings/${req.params.id}`);
    }
};

// ── Create/Confirm Booking (Stripe Integration) ────────────────────────────────
module.exports.createBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { booking } = req.body;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        const checkIn  = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const nights   = Math.ceil(Math.abs(checkOut - checkIn) / 86400000);

        if (nights <= 0) {
            req.flash("error", "Invalid date range! Check-out must be after Check-in.");
            return res.redirect(`/listings/${id}`);
        }

        // Conflict check
        const conflict = await Booking.findOne({
            listing: id,
            status: { $ne: "Cancelled" },
            $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }]
        });

        if (conflict) {
            req.flash("error", "Those dates are no longer available.");
            return res.redirect(`/listings/${id}`);
        }

        const subtotal    = listing.price * nights;
        const cleaningFee = Math.round(subtotal * 0.05);
        const serviceFee  = Math.round(subtotal * 0.12);
        const taxes       = Math.round(subtotal * 0.18);
        const totalPrice  = subtotal + cleaningFee + serviceFee + taxes;

        // Initialize Stripe
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Stay at ${listing.title}`,
                            description: `${nights} nights · ${checkIn.toDateString()} to ${checkOut.toDateString()}`,
                            images: [listing.image.url],
                        },
                        unit_amount: totalPrice * 100, // Stripe expects amount in paise (x100)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/listings/${id}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/listings/${id}/bookings/confirm?checkIn=${booking.checkIn}&checkOut=${booking.checkOut}&adults=${booking.adults}&children=${booking.children}`,
            metadata: {
                listingId: id,
                userId: req.user._id.toString(),
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                adults: booking.adults,
                children: booking.children,
                totalPrice: totalPrice
            }
        });

        // Redirect to Stripe Checkout page
        res.redirect(303, session.url);

    } catch (e) {
        console.error("Stripe Checkout Error:", e);
        req.flash("error", "Payment service unavailable. Please try again later.");
        res.redirect(`/listings/${req.params.id}`);
    }
};

// ── Booking Success (Stripe Redirect) ──────────────────────────────────────────
module.exports.bookingSuccess = async (req, res) => {
    try {
        const { id } = req.params;
        const { session_id } = req.query;

        if (!session_id) return res.redirect("/");

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const { metadata } = session;
            
            // Re-check for conflicts to prevent double booking during payment window
            const conflict = await Booking.findOne({
                listing: id,
                status: { $ne: "Cancelled" },
                $or: [{ checkIn: { $lt: new Date(metadata.checkOut) }, checkOut: { $gt: new Date(metadata.checkIn) } }]
            });

            if (conflict) {
                 req.flash("error", "Sorry, those dates were booked while you were completing payment.");
                 return res.redirect(`/listings/${id}`);
            }

            // Create booking in DB
            const newBooking = new Booking({
                listing: metadata.listingId,
                user: metadata.userId,
                checkIn: metadata.checkIn,
                checkOut: metadata.checkOut,
                totalPrice: metadata.totalPrice,
                adults: metadata.adults,
                children: metadata.children,
                status: "Confirmed",
                paymentIntentId: session.payment_intent
            });

            await newBooking.save();

            // Notify everyone on listing room (Live update)
            const io = req.app.get('io');
            if (io) {
                io.to(`listing:${id}`).emit("listing_booked", {
                    listingId: id,
                    checkIn: metadata.checkIn,
                    checkOut: metadata.checkOut
                });
            }

            // Email confirmation (non-blocking)
            try {
                const listing = await Listing.findById(id);
                const message = `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6;">
                        <h1 style="color:#FF385C;text-align:center;">Booking Confirmed! 🎉</h1>
                        <p>Hi <strong>${req.user.username}</strong>,</p>
                        <p>Your booking for <strong>${listing.title}</strong> is confirmed.</p>
                        <div style="background:#f7f7f7;padding:20px;border-radius:12px;margin:20px 0;">
                            <b>Check-in:</b> ${new Date(metadata.checkIn).toDateString()}<br>
                            <b>Check-out:</b> ${new Date(metadata.checkOut).toDateString()}<br>
                            <b>Total Price:</b> ₹${parseInt(metadata.totalPrice).toLocaleString("en-IN")}<br>
                        </div>
                        <p>We've processed your payment successfully via Stripe.</p>
                        <div style="text-align:center;margin-top:24px;">
                            <a href="${req.protocol}://${req.get('host')}/dashboard"
                               style="background:#FF385C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                                View My Trips
                            </a>
                        </div>
                    </div>`;
                const sendEmail = require("../utils/email");
                sendEmail({ email: req.user.email, subject: `StayNest Booking Confirmed: ${listing.title}`, html: message })
                    .catch(err => console.error("Email failed:", err));
            } catch (_) {}

            req.flash("success", "🎉 Booking confirmed! Your payment was successful.");
            res.redirect("/dashboard");
        } else {
            req.flash("error", "Payment failed or was cancelled.");
            res.redirect(`/listings/${id}`);
        }

    } catch (e) {
        console.error("Booking fulfillment error:", e);
        req.flash("error", "Something went wrong after payment. Please contact support.");
        res.redirect("/");
    }
};

// ── Cancel Booking ────────────────────────────────────────────────────────────
module.exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate("listing");

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/dashboard");
        }

        if (!booking.user.equals(req.user._id)) {
            req.flash("error", "Not authorised.");
            return res.redirect("/dashboard");
        }

        if (new Date(booking.checkIn) < new Date()) {
            req.flash("error", "Cannot cancel a trip that has already started.");
            return res.redirect("/dashboard");
        }

        booking.status = "Cancelled";
        await booking.save();

        req.flash("success", `Booking for "${booking.listing.title}" cancelled.`);
        res.redirect("/dashboard");

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/dashboard");
    }
};
