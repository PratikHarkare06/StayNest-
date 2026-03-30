const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { booking } = req.body;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Calculate nights and total price
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const timeDiff = Math.abs(checkOut - checkIn);
        const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            req.flash("error", "Invalid date range! Check-out must be after Check-in.");
            return res.redirect(`/listings/${id}`);
        }

        const totalPrice = listing.price * nights;

        const newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            totalPrice: totalPrice,
            status: "Confirmed" // Auto-confirm for now
        });

        await newBooking.save();

        // Send Confirmation Email
        // Send Confirmation Email
        const message = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #FF385C; margin: 0;">Booking Confirmed! 🎉</h1>
                    <p style="color: #666; font-size: 16px;">Get ready for your trip to ${listing.title}</p>
                </div>
                
                <p>Hi <strong>${req.user.username}</strong>,</p>
                <p>We're exciting to share that your booking is officially confirmed. Here are your trip details:</p>
                
                <div style="background-color: #f7f7f7; padding: 25px; border-radius: 12px; margin: 25px 0;">
                    <div style="margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">
                        <span style="font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Property</span><br>
                        <strong style="font-size: 18px; color: #333;">${listing.title}</strong><br>
                        <span style="color: #666;">${listing.location}, ${listing.country}</span>
                    </div>
                
                    <div style="display: flex; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <span style="font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Check-in</span><br>
                            <strong style="font-size: 16px;">${checkIn.toDateString()}</strong>
                        </div>
                        <div style="flex: 1;">
                            <span style="font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Check-out</span><br>
                            <strong style="font-size: 16px;">${checkOut.toDateString()}</strong>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 16px; font-weight: bold; color: #333;">Total Paid</span>
                            <span style="font-size: 24px; font-weight: bold; color: #FF385C;">₹${totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>
                
                <p>You can manage your booking or contact your host directly from your dashboard.</p>
                
                <div style="text-align: center; margin-top: 35px; margin-bottom: 35px;">
                    <a href="${req.protocol}://${req.get('host')}/dashboard" 
                       style="background-color: #FF385C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        View Trip Details
                    </a>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                    Questions? Reply to this email or visit our Help Center.<br>
                    Safe travels,<br>The Wanderlust Team
                </p>
            </div>
        `;

        // Send email asynchronously (don't await to avoid blocking response)
        const sendEmail = require("../utils/email");
        sendEmail({
            email: req.user.email,
            subject: `Booking Confirmed: ${listing.title}`,
            html: message
        }).catch(err => console.error("Email sending failed:", err));

        req.flash("success", `Booking confirmed! Total: ₹${totalPrice.toLocaleString("en-IN")}. Confirmation email sent.`);
        res.redirect("/dashboard");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect(`/listings/${req.params.id}`);
    }
};
