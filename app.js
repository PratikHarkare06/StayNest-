if (process.env.NODE_ENV != "production") {
  require("dotenv").config({ override: true });
}

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
// Trust proxy is required for secure cookies behind cloud load balancers (Render/Vercel)
app.set('trust proxy', 1);
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.set('io', io); // Expose io for use in controllers

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const bookingRouter = require("./routes/booking.js");
const adminRouter = require("./routes/admin.js"); // Admin Router
const messageRouter = require("./routes/message.js"); // Message Router
const session = require("express-session");
const MongoStore = require("connect-mongo").MongoStore;
const flash = require("connect-flash");
// Passport and LocalStrategy replaced by Firebase Native Authentication
const User = require("./models/user");
const UserRouter = require("./routes/user.js");

// Define the main function to connect to MongoDB
async function main() {
  const DB_URL = process.env.ATLAS_URL;
  await mongoose.connect(DB_URL);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json()); // Added for API support
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// Use Helmet for security headers, strictly whitelisting required external assets
// const helmet = require("helmet");
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://www.gstatic.com", "https://www.google-analytics.com", "https://apis.google.com", "https://accounts.google.com", "https://*.firebaseapp.com"],
//       scriptSrcAttr: ["'unsafe-inline'"], // Allow the legacy 'onclick' handlers in the navbar search bar
//       connectSrc: ["'self'", "https://api.geoapify.com", "https://staynest-2047f.firebaseapp.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://*.firebaseio.com", "wss://*.firebaseio.com", "https://www.google-analytics.com", "https://accounts.google.com"],
//       imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org", "https://tile.openstreetmap.org", "https://unpkg.com", "https://lh3.googleusercontent.com"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
//       frameSrc: ["'self'", "https://staynest-2047f.firebaseapp.com", "https://accounts.google.com"],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
//   crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
// Create MongoDB session store
const store = MongoStore.create({
  mongoUrl: process.env.ATLAS_URL,
  touchAfter: 24 * 3600, // lazy session update (in seconds)
});

// Handle store errors
store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
  },
};


app.use(session(sessionOptions));
app.use(flash());

// Removing Passport in favor of Firebase + Session
app.use(async (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  
  // Expose Frontend Firebase variables
  res.locals.firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      vapidKey: process.env.FIREBASE_VAPID_KEY // Injected for Push Registration (Feature 3)
  };
  
  // Custom auth middleware: If session has a userId (set by Firebase login route), fetch the user from DB
  if (req.session.userId) {
      try {
          const user = await User.findById(req.session.userId);
          req.user = user; // Expose for backend logic
          res.locals.currUser = user; // Expose globally for EJS Navigation bars
      } catch (err) {
          console.error("Session User Verification Error:", err);
          req.user = null;
          res.locals.currUser = null;
      }
  } else {
      req.user = null;
      res.locals.currUser = null;
  }
  next();
});

app.use("/", UserRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/bookings", bookingRouter);
app.use("/admin", adminRouter);
app.use("/messages", messageRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Toast demo page (for testing)
app.get("/toast-demo", (req, res) => {
  res.render("toast-demo.ejs");
});

// Dynamic Firebase config endpoint for Service Worker (keeps credentials out of static files)
app.get("/firebase-sw-config.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "no-store"); // Never cache — config may change
  res.send(`
self.FIREBASE_CONFIG = {
  apiKey: "${process.env.FIREBASE_API_KEY}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.FIREBASE_APP_ID}",
  measurementId: "${process.env.FIREBASE_MEASUREMENT_ID}"
};
  `.trim());
});




// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;

  // Send JSON for API requests, render error page for browser requests
  if (
    req.get("Content-Type") &&
    req.get("Content-Type").includes("application/json")
  ) {
    res.status(statusCode).json({
      success: false,
      error: message,
      statusCode: statusCode,
    });
  } else {
    res.status(statusCode).render("error.ejs", {
      message: message,
      statusCode: statusCode,
      currUser: req.user || null // Ensure currUser is defined for navbar
    });
  }
});

// ─── SOCKET.IO REAL-TIME ENGINE ──────────────────────────────────────────────
const Message = require("./models/message");

// Track online users: userId → Set of socketIds (multi-tab support)
const onlineUsers = new Map();

io.on("connection", (socket) => {

  // ── 1. PRESENCE: User comes online ─────────────────────────────────────────
  socket.on("register_user", (userId) => {
    socket.join(userId);
    socket.userId = userId;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status to everyone
    io.emit("user_online", { userId });
  });

  // ── 2. MESSAGING: Send & persist ───────────────────────────────────────────
  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message({
        sender: data.senderId,
        recipient: data.recipientId,
        content: data.content,
        listingId: data.listingId || null
      });
      await newMessage.save();
      await newMessage.populate("sender", "username image");

      // Emit to both recipient and sender rooms
      io.to(data.recipientId).emit("new_message", newMessage);
      io.to(data.senderId).emit("new_message", newMessage);

      // Push notification (Firebase)
      const User = require("./models/user");
      const recipient = await User.findById(data.recipientId).select("fcmTokens");
      if (recipient && recipient.fcmTokens && recipient.fcmTokens.length > 0) {
        // Only send push if recipient is NOT currently online
        if (!onlineUsers.has(data.recipientId) || onlineUsers.get(data.recipientId).size === 0) {
          try {
            const admin = require("./utils/firebase");
            const payload = {
              notification: {
                title: `Message from ${newMessage.sender.username}`,
                body: data.content.length > 60 ? data.content.substring(0, 57) + "..." : data.content
              },
              data: { senderId: data.senderId, type: "CHAT_MESSAGE" },
              tokens: recipient.fcmTokens
            };
            const response = await admin.messaging().sendEachForMulticast(payload);
            // Token hygiene
            if (response.failureCount > 0) {
              const failedTokens = response.responses
                .map((resp, idx) => (!resp.success ? recipient.fcmTokens[idx] : null))
                .filter(Boolean);
              if (failedTokens.length > 0) {
                User.updateOne({ _id: data.recipientId }, { $pull: { fcmTokens: { $in: failedTokens } } }).exec();
              }
            }
          } catch (err) { console.error("FCM Error:", err.message); }
        }
      }

    } catch (err) {
      console.error("Socket Message Error:", err);
    }
  });

  // ── 3. TYPING INDICATORS ───────────────────────────────────────────────────
  socket.on("typing_start", ({ senderId, recipientId }) => {
    io.to(recipientId).emit("typing_start", { senderId });
  });

  socket.on("typing_stop", ({ senderId, recipientId }) => {
    io.to(recipientId).emit("typing_stop", { senderId });
  });

  // ── 4. READ RECEIPTS ────────────────────────────────────────────────────────
  socket.on("mark_read", async ({ senderId, recipientId }) => {
    try {
      await Message.updateMany(
        { sender: senderId, recipient: recipientId, read: false },
        { $set: { read: true } }
      );
      // Notify sender their messages were read
      io.to(senderId).emit("messages_read", { by: recipientId });
    } catch (err) {
      console.error("Mark-read error:", err);
    }
  });

  // ── 5. LIVE BOOKING AVAILABILITY ───────────────────────────────────────────
  // When a booking is confirmed, notify everyone on that listing's "room"
  socket.on("join_listing", (listingId) => {
    socket.join(`listing:${listingId}`);
  });

  socket.on("booking_made", (data) => {
    // Broadcast to every viewer of this listing (except the booker)
    socket.to(`listing:${data.listingId}`).emit("listing_booked", {
      listingId: data.listingId,
      checkIn: data.checkIn,
      checkOut: data.checkOut
    });
  });

  // ── 6. PRESENCE: User goes offline ─────────────────────────────────────────
  socket.on("disconnect", () => {
    if (socket.userId) {
      const sockets = onlineUsers.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit("user_offline", { userId: socket.userId });
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`StayNest is live and listening on port ${PORT} [Production Mode]`);
});
