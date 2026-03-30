const Message = require('../models/message');
const User = require('../models/user');

module.exports.index = async (req, res) => {
    // 1. Fetch all messages involving the current user (sender or receiver)
    // Structured backwards to show most recent activity first.
    const messages = await Message.find({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
    .populate("sender", "username image")
    .populate("receiver", "username image")
    .sort({ createdAt: -1 });

    // 2. Extract unique conversation partners
    const partnersMap = new Map();
    for (let msg of messages) {
        // Determine who the other person is in this specific message
        let partner = msg.sender._id.equals(req.user._id) ? msg.receiver : msg.sender;
        
        // Setup unique conversation threads if this is the first time we see this partner
        if (!partnersMap.has(partner._id.toString())) {
            partnersMap.set(partner._id.toString(), {
                user: partner,
                lastMessage: msg,
                unread: msg.receiver._id.equals(req.user._id) && !msg.isRead
            });
        }
    }
    
    res.render("messages/index.ejs", { conversations: Array.from(partnersMap.values()) });
};

module.exports.chatWithUser = async (req, res) => {
    const { userId } = req.params;
    const partner = await User.findById(userId);
    
    if (!partner) {
        req.flash("error", "User not found or deleted.");
        return res.redirect("/messages");
    }

    // Mark previous incoming messages from this user as Read since the user is opening the chat
    await Message.updateMany(
        { sender: userId, receiver: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );

    // Fetch chronological message history
    const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id }
        ]
    }).sort({ createdAt: 1 }); // Oldest first for a natural top-to-bottom chat flow

    res.render("messages/show.ejs", { partner, messages });
};
