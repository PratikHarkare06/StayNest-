# 🏡 StayNest

## 🎥 Application Demo 
https://github.com/PratikHarkare06/Pratik-Portfolio-Material/releases/download/v1.0.0/StayNest.Demo.mp4


**StayNest** is a full-stack, Airbnb-inspired vacation rental platform built with Node.js, Express, MongoDB, EJS, and Firebase Authentication. It supports property listings, real-time messaging, bookings, multi-currency pricing, an admin panel, and a Progressive Web App (PWA) experience.


## 📸 Application Preview
<img width="1470" height="842" alt="Screenshot 2026-07-26 at 6 09 46 PM" src="https://github.com/user-attachments/assets/9c81cc85-705d-4dcc-91ef-6f23b7aa540f" />


> 🌐 **Live App:** [staynest.onrender.com](https://staynest.onrender.com)  
> 📦 **GitHub:** [github.com/PratikHarkare06/StayNest-](https://github.com/PratikHarkare06/StayNest-)

---

## ✨ Features

### 🔐 Authentication
- Firebase-based authentication with **Google Sign-In** and Email/Password
- Persistent login sessions via `express-session` + `connect-mongo`
- Protected routes with `isLoggedIn` middleware

### 🏠 Listings
- Browse **55+ curated property listings** across 11 categories (Trending, Rooms, Iconic Cities, Mountains, Castles, Pools, Camping, Arctic, Farms, Boats, Amazing Views)
- Smart **search + filter** by destination, category, price (low→high, high→low), and date availability
- **Infinite scroll** on the listings page for a seamless browsing experience
- **Wishlist** — logged-in users can save and manage favorite properties
- **Share listing** via native mobile share or link copy
- **Photo gallery** with a 5-grid lightbox view per property
- **Interactive cluster map** powered by Mapbox/Geoapify with real geocoded coordinates
- **Similar listings** suggestions at the bottom of each property page

### 📅 Bookings
- Date-blocked booking calendar — unavailable dates are greyed out
- Booking confirmation page with full price breakdown (subtotal, cleaning fee, service fee, GST)
- Guest dashboard **Trips** tab showing booking history
- **Cancel booking** functionality
- Host gets real-time booking notifications

### 💬 Real-Time Messaging
- Direct messaging between guests and hosts using **Socket.IO**
- Full conversation thread view with timestamps
- Unread message indicators in the navbar

### 👤 User Dashboard
- **Edit Profile** — update display name, bio, and avatar photo (uploaded to Cloudinary)
- **Verify Identity** — upload government ID document for a verification badge
- **My Trips** — view all past and upcoming bookings
- **My Listings** — host's own properties with edit/delete controls
- **Wishlist** tab — saved properties at a glance
- **Analytics** tab — bar + line chart showing monthly earnings and booking trends (Chart.js)
- Orphaned bookings (deleted properties/users) gracefully hydrated with placeholder data

### 🏨 Host Tools
- Dedicated **Host Dashboard** with revenue KPIs, booking counts, and top listing performance
- Create, edit, and delete listings with image upload to Cloudinary
- Live occupancy overview

### 💱 Multi-Currency Support
- Inline currency switcher supporting **INR (₹), USD ($), EUR (€)**
- Prices convert dynamically across all listing cards

### ⚙️ Admin Panel
- Secure admin-only route (`/admin`)
- View all users, listings, and bookings
- Promote/demote users

### 📱 Progressive Web App (PWA)
- Installable on Android and iOS home screens
- Custom app icon and splash screen
- Service Worker for network-first caching strategy
- Android build via **Capacitor**

### 🖼 Cloudinary Image Storage
- All user avatars and listing images stored on **Cloudinary CDN**
- Supports PNG, JPG, JPEG, WebP, HEIC, GIF formats
- Multer middleware with graceful upload error handling

### ⚡ Performance
- **gzip compression** via the `compression` middleware
- **Promise.all** parallel DB queries + `.lean()` for faster responses
- **Lazy-loaded** images across listings index and gallery

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v22) |
| Framework | Express.js v5 |
| Database | MongoDB Atlas + Mongoose |
| Templating | EJS + EJS-Mate |
| Authentication | Firebase Auth (Google + Email) |
| File Storage | Cloudinary + Multer |
| Real-Time | Socket.IO |
| Maps | Mapbox SDK / Geoapify |
| Charts | Chart.js |
| Sessions | express-session + connect-mongo |
| PWA | Capacitor (Android), Service Worker |
| Deployment | Render.com |

---

## 📁 Project Structure

```
StayNest/
├── app.js                  # Main Express server
├── cloudConfig.js          # Cloudinary + Multer storage setup
├── middleware.js           # isLoggedIn, saveReturnTo helpers
├── schema.js               # Joi validation schemas
├── controllers/
│   ├── listing.js          # Listing CRUD + show/search logic
│   ├── user.js             # Dashboard, profile, bookings
│   ├── booking.js          # Booking confirm + create + cancel
│   ├── message.js          # Messaging thread logic
│   ├── review.js           # Review create/delete
│   └── admin.js            # Admin panel
├── models/
│   ├── listing.js          # Listing schema
│   ├── user.js             # User schema
│   ├── booking.js          # Booking schema
│   ├── review.js           # Review schema
│   └── message.js          # Message schema
├── routes/
│   ├── listing.js
│   ├── user.js
│   ├── booking.js
│   ├── message.js
│   ├── review.js
│   └── admin.js
├── views/
│   ├── listings/           # index, show, new, edit, booking-confirm
│   ├── users/              # dashboard, host-dashboard, login, signup
│   ├── admin/              # Admin panel views
│   ├── messages/           # Messaging UI
│   └── boilerplate.ejs     # Shared layout
├── public/
│   ├── css/style.css
│   ├── js/                 # Client-side scripts
│   ├── images/             # Static assets
│   └── manifest.json       # PWA manifest
└── init/                   # Seed scripts for listings
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Firebase project

### 1. Clone the Repository
```bash
git clone https://github.com/PratikHarkare06/StayNest-.git
cd StayNest-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Server
PORT=8080
NODE_ENV=production

# MongoDB
ATLAS_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/staynest

# Session
SECRET=your_session_secret_here

# Cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Maps
MAP_TOKEN=your_geoapify_or_mapbox_token

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 4. Seed the Database
```bash
node init/index.js
```

### 5. Start the Server
```bash
npm start        # Production
npm run dev      # Development with auto-reload
```

---

## 🔑 Admin Access

To grant admin access to a user, run:
```bash
node makeAdmin.js <user_email>
```

Then access the admin panel at `/admin`.

---

## 🌍 Deployment (Render.com)

1. Connect your GitHub repo to a Render **Web Service**
2. Set **Build Command:** `npm install`
3. Set **Start Command:** `npm start`
4. Add all environment variables from `.env` into Render's **Environment** tab
5. Render auto-deploys on every push to `main`

> ⚠️ **Important:** The `CLOUDINARY_URL` and `CLOUDINARY_API_*` keys **must** be added to Render's environment, otherwise photo uploads will fail with a "Something went wrong" error.

---

## 📋 Recent Changelog

| Version | What Changed |
|---|---|
| Latest | Fixed dashboard crash for orphaned bookings/deleted listings/deleted guests |
| Latest | Fixed booking-confirm page crash for orphaned listings |
| Latest | Fixed listing show-page crash when host account is deleted |
| Latest | Expanded Cloudinary accepted formats to include WebP, HEIC, GIF |
| Latest | Added global error stack traces for debugging production crashes |
| Latest | Added application favicon for browser tabs and PWA |
| Latest | Fixed mobile share link URL crashes (ObjectId sanitization) |
| Latest | Implemented user profile editing with Cloudinary avatar upload |
| Latest | Fixed real-time chat Socket.IO payload schema mismatch |
| Latest | Implemented multi-currency switcher (INR/USD/EUR) |
| Latest | Added infinite scroll for listings page |
| Latest | Added PWA Service Worker with network-first caching |
| Latest | Enabled gzip compression for all responses |
| Latest | Seeded 55 listings across 11 curated categories |

---

## 📸 Screenshots

| Listings Page | Property Detail | User Dashboard |
|---|---|---|
| Browse all 55+ listings with filters | Full photo gallery + booking widget | Trips, Wishlist, Analytics, Listings |

---

## 📄 License

This project is for educational and portfolio purposes.  
Built by **Pratik Harkare** — [GitHub](https://github.com/PratikHarkare06)
