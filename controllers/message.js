const Message = require("../models/message");
const User = require("../models/user");
const Listing = require("../models/listing");

module.exports.renderInbox = async (req, res) => {
    // Get all conversations for current user
    const messages = await Message.find({
        $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
    .sort({ createdAt: -1 })
    .populate('sender recipient listingId');

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
        if (!msg.sender || !msg.recipient) return; // Skip if user deleted

        const partner = msg.sender._id.equals(req.user._id) ? msg.recipient : msg.sender;
        if (!partner) return;

        if (!conversations[partner._id]) {
            conversations[partner._id] = {
                user: partner,
                lastMessage: msg,
                unread: (!msg.read && msg.recipient._id && msg.recipient._id.equals(req.user._id))
            };
        } else if (!msg.read && msg.recipient._id && msg.recipient._id.equals(req.user._id)) {
            conversations[partner._id].unread = true;
        }
    });

    res.render("messages/index.ejs", { conversations: Object.values(conversations) });
};

module.exports.renderChat = async (req, res) => {
    const { userId } = req.params;
    const partner = await User.findById(userId);
    if (!partner) {
        req.flash("error", "User not found");
        return res.redirect("/dashboard");
    }

    const messages = await Message.find({
        $or: [
            { sender: req.user._id, recipient: userId },
            { sender: userId, recipient: req.user._id }
        ]
    }).sort({ createdAt: 1 }).populate('listingId');

    // Mark as read
    await Message.updateMany(
        { sender: userId, recipient: req.user._id, read: false }, 
        { $set: { read: true } }
    );

    res.render("messages/show.ejs", { partner, messages });
};

module.exports.sendMessage = async (req, res) => {
    const { recipientId, content, listingId } = req.body;
    const newMessage = new Message({
        sender: req.user._id,
        recipient: recipientId,
        content,
        listingId: listingId || null
    });

    await newMessage.save();

    // Socket.io real-time emit would happen here if we pass io to controller
    // For now we rely on the client emitting via socket.io-client
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json(newMessage);
    }

    res.redirect(`/messages/${recipientId}`);
};
