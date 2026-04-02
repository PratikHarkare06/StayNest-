const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Show booking confirmation/summary page
router.get("/confirm", isLoggedIn, bookingController.showConfirmPage);

// Create (confirm) Booking (Stripe Redirect)
router.post("/", isLoggedIn, bookingController.createBooking);

// Stripe Success Callback
router.get("/success", isLoggedIn, bookingController.bookingSuccess);

// Cancel a booking (guest)
router.delete("/:bookingId/cancel", isLoggedIn, bookingController.cancelBooking);

module.exports = router;
