const express = require("express");
const router = express.Router();
const { saveReturnTo, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/user.js");
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// Unified Route Redirects legacy Signups into new Firebase Auth Engine securely
router.get("/signup", (req, res) => res.redirect("/login"));

router.put("/profile", isLoggedIn, upload.single('image'), userController.updateProfile);

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveReturnTo, userController.firebaseLogin); // Endpoint to catch Firebase ID Token

router.get("/logout", userController.logout);

router.get("/dashboard", isLoggedIn, userController.renderDashboard);
router.post("/users/wishlist/:id", isLoggedIn, userController.toggleWishlist);
router.post("/save-fcm-token", isLoggedIn, userController.saveFcmToken);

// DEMO ONLY: Promote current user to Admin
router.get("/demo/admin", isLoggedIn, async (req, res) => {
    req.user.isAdmin = true;
    await req.user.save();
    req.flash("success", "You are now an Admin!");
    res.redirect("/admin");
});

module.exports = router;