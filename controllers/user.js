const User = require("../models/user");

const admin = require("../utils/firebase");

// We no longer require a separate "Signup" route. Firebase handles unified entry.
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs"); // This EJS will hold the unified Login/SignUp UI
};

module.exports.firebaseLogin = async (req, res) => {
    // Escalate the security check to Google Firebase Admin Servers
    const { idToken } = req.body;
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        // Map Firebase Auth specifically back to local local MongoDB records
        let user = await User.findOne({ email: email });
        
        if (!user) {
            // Guarantee username is totally unique to stop E11000 MongoDB duplication crashes
            let candidateUsername = name || email.split('@')[0];
            let existingUser = await User.findOne({ username: candidateUsername });
            
            let safeUsername = candidateUsername;
            let counter = 1;
            
            // Loop until we find a name that is completely free
            while (existingUser) {
                safeUsername = `${candidateUsername}${counter}`;
                existingUser = await User.findOne({ username: safeUsername });
                counter++;
            }

            // User does not exist, silent auto-registration using Google profile
            user = new User({
                firebaseUid: uid,
                email: email,
                username: safeUsername, 
            });
            
            if (picture) user.image = { url: picture, filename: "google_pfp" };
            await user.save();
            
            // Optionally, we could send the generic Welcome Email here using utils/email.js
        } else if (!user.firebaseUid) {
            // Account mapping: If an old user logged in using legacy email, sync them to Firebase
            user.firebaseUid = uid;
            await user.save();
        }

        // Establish the application-level Session linked to the Mongoose _id
        req.session.userId = user._id;
        
        // Explicitly force the datastore to save before executing the JSON redirect
        // This solves the bug where the browser routes away before Mongo finishes writing!
        req.session.save((err) => {
            if (err) {
                console.error("Express Session Write Error:", err);
                return res.status(500).json({ success: false, message: "System session failure" });
            }
            res.json({ success: true, redirectUrl: req.session.returnTo ? req.session.returnTo : "/listings" });
        });

    } catch (err) {
        console.error("Critical Firebase Verification Error:", err);
        res.status(401).json({ success: false, message: "Invalid or expired authentication token. Please try again." });
    }
};

module.exports.saveFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ success: false });

        const user = await User.findById(req.user._id);
        if (!user.fcmTokens) user.fcmTokens = [];
        
        if (!user.fcmTokens.includes(fcmToken)) {
            user.fcmTokens.push(fcmToken);
            await user.save();
        }
        res.json({ success: true });
    } catch (err) {
        console.error("FCM Token Save Error:", err);
        res.status(500).json({ success: false });
    }
};

module.exports.logout = (req, res) => {
    // Sever the session connection exclusively
    req.session.destroy(err => {
        if(err) console.error("Session termination error:", err);
        res.redirect("/listings");
    });
};

const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.updateProfile = async (req, res) => {
    try {
        const { bio } = req.body;
        const user = await User.findById(req.user._id);

        if (bio) user.bio = bio;

        if (req.file) {
            user.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await user.save();
        req.flash("success", "Profile updated successfully!");
        res.redirect("/dashboard");
    } catch (e) {
        console.error(e);
        req.flash("error", "Could not update profile.");
        res.redirect("/dashboard");
    }
};

module.exports.renderDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        const myListings = await Listing.find({ owner: req.user._id }).populate('reviews');
        const myBookings = await Booking.find({ user: req.user._id }).populate('listing');

        // Host Analytics Logic
        const listingIds = myListings.map(l => l._id);
        console.log(`[DEBUG] Dashboard for ${req.user.username} (${req.user._id})`);
        console.log(`[DEBUG] Owned Listings: ${listingIds.length}`);

        const hostBookings = await Booking.find({
            listing: { $in: listingIds },
            status: { $in: ['Confirmed', 'Pending'] }
        }).populate('user');

        console.log(`[DEBUG] Host Bookings Found: ${hostBookings.length}`);
        if (hostBookings.length > 0) {
            hostBookings.forEach(b => {
                console.log(`   - Booking ID: ${b._id}, Price: ${b.totalPrice}, Status: ${b.status}, Created: ${b.createdAt}`);
            });
        }

        // Rating Calculation
        let totalStars = 0;
        let totalReviews = 0;
        myListings.forEach(listing => {
            if (listing.reviews && listing.reviews.length > 0) {
                listing.reviews.forEach(r => {
                    totalStars += r.rating;
                    totalReviews++;
                });
            }
        });
        const avgRating = totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : "N/A";

        const hostStats = {
            totalEarnings: hostBookings.reduce((acc, curr) => acc + curr.totalPrice, 0),
            totalBookings: hostBookings.length,
            bookingsByMonth: new Array(12).fill(0), // Jan-Dec
            earningsByMonth: new Array(12).fill(0),
            avgRating: avgRating
        };

        const currentYear = new Date().getFullYear();

        hostBookings.forEach(booking => {
            const bookingDate = new Date(booking.createdAt);
            if (bookingDate.getFullYear() === currentYear) {
                const month = bookingDate.getMonth(); // 0-11
                hostStats.bookingsByMonth[month]++;
                hostStats.earningsByMonth[month] += booking.totalPrice;
            }
        });

        res.render("users/dashboard.ejs", { user, myListings, myBookings, hostStats, hostBookings });
    } catch (e) {
        console.error(e);
        req.flash("error", "Could not load dashboard data.");
        res.redirect("/listings");
    }
};

module.exports.toggleWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);

        const listingIndex = user.wishlist.indexOf(id);

        if (listingIndex === -1) {
            // Add to wishlist
            user.wishlist.push(id);
            req.flash("success", "Added to your wishlist!");
        } else {
            // Remove from wishlist
            user.wishlist.splice(listingIndex, 1);
            req.flash("success", "Removed from your wishlist!");
        }

        await user.save();

        // Handle AJAX request
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                success: true,
                action: listingIndex === -1 ? 'added' : 'removed',
                message: listingIndex === -1 ? "Added to your wishlist!" : "Removed from your wishlist!",
                wishlistCount: user.wishlist.length
            });
        }

        req.flash("success", listingIndex === -1 ? "Added to your wishlist!" : "Removed from your wishlist!");
        res.redirect(req.get("Referer") || "/listings");
    } catch (e) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: e.message });
        }
        req.flash("error", e.message);
        res.redirect("/listings");
    }
};
