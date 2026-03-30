const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.js");
const { isLoggedIn } = require("../middleware.js");

router.get("/", isLoggedIn, messageController.index);
router.get("/:userId", isLoggedIn, messageController.chatWithUser);

module.exports = router;
