const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware.js");
const adminController = require("../controllers/admin.js");

// Protect all admin routes
router.use(isLoggedIn, isAdmin);

router.get("/", adminController.renderDashboard);
router.get("/users", adminController.renderUsers);
router.get("/listings", adminController.renderListings);
router.get("/bookings", adminController.renderBookings);

router.delete("/listings/:id", adminController.deleteListing);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
