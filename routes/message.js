const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const messageController = require("../controllers/message.js");

// Inbox Route
router.get("/", isLoggedIn, wrapAsync(messageController.renderInbox));

// Chat UI with specific User
router.get("/:userId", isLoggedIn, wrapAsync(messageController.renderChat));

// Send Message
router.post("/", isLoggedIn, wrapAsync(messageController.sendMessage));

module.exports = router;
