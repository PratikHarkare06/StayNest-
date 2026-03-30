const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Create Booking Route
router.post("/", isLoggedIn, bookingController.createBooking);

module.exports = router;
