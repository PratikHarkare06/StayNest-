<h1 align="center">
  🏠 StayNest
</h1>

<p align="center">
  <b>A full-stack Airbnb-style property rental platform built with Node.js, Express, MongoDB & Firebase.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-Image_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</p>

---

## 📌 Overview

**StayNest** is a production-ready, full-featured property rental web application inspired by Airbnb. It allows users to list, discover, book, and review properties across India and beyond. The platform is built on a robust MVC architecture and features real-time messaging, Firebase authentication, push notifications, interactive maps, and an admin control panel.

---

## ✨ Features

### 👤 Authentication & User Management
- **Firebase Authentication** — Secure login/signup with session-based persistence
- **Google OAuth** — One-click sign in with Google accounts
- **User Dashboard** — Personalized view of active listings and bookings
- **Profile Pictures** — Upload and update avatars via Cloudinary CDN
- **Wishlist / Favorites** — AJAX-powered heart toggle to save properties instantly without page reload

### 🏠 Listings & Property Management
- **Full CRUD** — Create, Read, Update, and Delete property listings
- **Cloud Image Upload** — Cloudinary integration for optimized image hosting
- **Category Tags** — Filter by tags like Trending, Beach, Castles, Camping, Mountains, etc.
- **Geocoding** — Auto-converts text addresses to map coordinates on listing creation
- **Indian Properties Seeder** — Pre-built seed script for realistic demo data

### 🔍 Advanced Search & Discovery
- **Smart Search Bar** — Dual-mode: shows popular destinations by default, switches to live DB results on keystroke
- **AJAX Suggestions** — Rich results with property image, title, and location
- **Keyboard Navigation** — Arrow key + Enter support for accessibility
- **Filters** — Search by location, title, or country; with date picker and guest counter (Adults / Children / Infants)

### 🗺️ Interactive Maps
- **Geoapify Geocoding** — Precise coordinate lookup for every listing
- **Cluster Map** — Homepage map groups nearby listings into clusters that expand on zoom
- **Listing Location Map** — Per-property map pinpointing the exact location

### 💬 Real-Time Messaging (Socket.IO)
- **Live Chat** — Real-time direct messaging between users powered by WebSockets
- **Instant Delivery** — Messages persisted to MongoDB and broadcast immediately
- **Push Notifications (FCM)** — Firebase Cloud Messaging delivers notifications even when the user is offline
- **Token Hygiene** — Expired FCM tokens automatically cleaned up from the database

### ⭐ Reviews & Ratings
- **Star Ratings** — 1 to 5-star rating system per property
- **Review Text** — Written feedback for each stay
- **Rating Breakdown** — Visual progress bars showing the distribution of ratings
- **Author-Only Deletion** — Only the review author can delete their review

### 💰 Booking System
- **Property Reservations** — Book properties for specific check-in/check-out dates
- **GST Tax Toggle** — One-click switch between base price and price with 18% GST
- **Mobile Sticky Bar** — Price and booking button stick to the bottom on mobile for easy access
- **Admin Booking Panel** — Full admin view to monitor and manage all bookings

### 🛡️ Admin Dashboard
- **User Management** — View and manage all registered users
- **Listing Oversight** — Monitor all properties listed on the platform
- **Booking Management** — Admin-level control over all reservations

### 🎨 UI / UX
- **Fully Responsive** — Bootstrap 5 grid, works on mobile, tablet, and desktop
- **Skeleton Screens** — Placeholder shapes shown while data loads (perceived performance)
- **Lazy Loading** — Images load only when scrolled into the viewport
- **Toast Notifications** — Flash messages for success and error actions
- **Infinite Scroll** — Load more listings as you scroll
- **Email Notifications** — Nodemailer integration for transactional emails

### 🔒 Security
- **Helmet.js** — Strict Content Security Policy, XSS protection, and other HTTP security headers
- **Joi Validation** — Server-side schema validation on all form inputs
- **HttpOnly Cookies** — Secure, tamper-resistant session cookies
- **MongoDB Session Store** — Sessions stored in MongoDB via `connect-mongo`
- **Route Authorization** — `isLoggedIn`, `isOwner`, `isReviewAuthor` middleware guards
- **Proxy Trust** — Configured for secure deployment behind cloud load balancers (Render/Railway)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 20.x |
| **Framework** | Express.js 5.x |
| **Database** | MongoDB + Mongoose 8.x |
| **Auth** | Firebase Authentication + express-session |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Real-Time** | Socket.IO 4.x |
| **Templating** | EJS + ejs-mate |
| **Image Storage** | Cloudinary + Multer |
| **Maps** | Geoapify API + Leaflet.js |
| **Email** | Nodemailer |
| **Validation** | Joi |
| **Security** | Helmet.js |
| **Session Store** | connect-mongo |
| **Styling** | Bootstrap 5 + Custom CSS |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) `v20.x` or higher
- [MongoDB](https://www.mongodb.com/) (local) **or** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Cloudinary](https://cloudinary.com/) account
- A [Firebase](https://firebase.google.com/) project (for Auth + FCM)
- A [Geoapify](https://www.geoapify.com/) API key (for maps)

---

### 📦 Installation

**1. Clone the repository**

```bash
git clone https://github.com/PratikHarkare06/StayNest-.git
cd StayNest-
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory:

```env
# ─── MongoDB ───────────────────────────────────────────
# Local MongoDB
ATLAS_URL=mongodb://127.0.0.1:27017/staynest

# OR MongoDB Atlas (recommended for production)
# ATLAS_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# ─── Cloudinary ────────────────────────────────────────
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# ─── Maps ──────────────────────────────────────────────
MAP_TOKEN=your_geoapify_api_key

# ─── Session ───────────────────────────────────────────
SESSION_SECRET=your_super_secret_session_string

# ─── Firebase ──────────────────────────────────────────
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
FIREBASE_VAPID_KEY=your_vapid_key
```

**4. (Optional) Seed the database**

Populate the database with sample Indian property listings:

```bash
node scripts/seedIndianProperties.js
```

**5. Run the development server**

```bash
npm run dev
```

The app will be running at **[http://localhost:8080](http://localhost:8080)**

---

### 🏗️ Production Start

```bash
npm start
```

---

## 📁 Project Structure

```
StayNest/
├── app.js                  # Entry point, Express & Socket.IO setup
├── middleware.js           # Auth, ownership & validation guards
├── schema.js               # Joi validation schemas
├── cloudConfig.js          # Cloudinary + Multer configuration
│
├── models/
│   ├── listing.js          # Property listing schema
│   ├── user.js             # User schema (with FCM tokens, wishlist)
│   ├── review.js           # Review & rating schema
│   ├── booking.js          # Booking schema
│   └── message.js          # Chat message schema
│
├── controllers/
│   ├── listing.js          # Listing CRUD logic
│   ├── user.js             # Auth, profile, dashboard logic
│   ├── review.js           # Review logic
│   ├── booking.js          # Booking logic
│   ├── admin.js            # Admin panel logic
│   └── message.js          # Chat logic
│
├── routes/
│   ├── listing.js          # /listings routes
│   ├── user.js             # /login, /signup, /dashboard routes
│   ├── review.js           # /listings/:id/reviews routes
│   ├── booking.js          # /listings/:id/bookings routes
│   ├── admin.js            # /admin routes
│   └── message.js          # /messages routes
│
├── views/                  # EJS templates
│   ├── listings/           # Index, Show, New, Edit pages
│   ├── users/              # Login, Signup, Dashboard pages
│   ├── admin/              # Admin panel pages
│   ├── messages/           # Chat pages
│   ├── includes/           # Navbar, Footer, Flash, Skeleton
│   └── layouts/            # Base boilerplate layout
│
├── public/
│   ├── css/                # Custom stylesheets
│   ├── JS/                 # Client-side JS (map, wishlist, booking, etc.)
│   ├── images/             # Static assets
│   └── firebase-messaging-sw.js  # FCM Service Worker
│
├── utils/
│   ├── wrapAsync.js        # Async error wrapper
│   ├── ExpressError.js     # Custom error class
│   ├── firebase.js         # Firebase Admin SDK init
│   └── email.js            # Nodemailer email utility
│
├── scripts/
│   ├── seedIndianProperties.js  # Seed demo listings
│   ├── makeAdmin.js             # Promote a user to admin
│   ├── transfer_listings.js     # DB migration utility
│   └── debug_analytics.js      # Analytics debug tool
│
├── init/
│   ├── data.js             # Initial seed data
│   └── index.js            # DB initializer script
│
├── .env                    # ⚠️ NOT committed — see above
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 Key API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/listings` | Browse all listings |
| `GET` | `/listings/:id` | View a single listing |
| `POST` | `/listings` | Create a new listing |
| `PUT` | `/listings/:id` | Update a listing |
| `DELETE` | `/listings/:id` | Delete a listing |
| `POST` | `/listings/:id/reviews` | Add a review |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete a review |
| `GET` | `/listings/:id/bookings` | View bookings for a listing |
| `POST` | `/listings/:id/bookings` | Book a property |
| `GET` | `/messages` | View all conversations |
| `GET` | `/messages/:userId` | Open a specific chat |
| `GET` | `/admin/dashboard` | Admin overview |
| `GET` | `/admin/users` | Manage users |
| `GET` | `/admin/bookings` | Manage bookings |
| `GET` | `/dashboard` | User dashboard |

---

## ⚙️ Scripts

| Command | Description |
|---|---|
| `npm start` | Start the production server |
| `npm run dev` | Start with hot-reload (`node --watch`) |
| `node scripts/seedIndianProperties.js` | Seed demo property data |
| `node scripts/makeAdmin.js` | Promote a user to admin role |

---

## 🌐 Deployment

This app is ready to deploy on **[Render](https://render.com/)**, **[Railway](https://railway.app/)**, or any Node.js host.

**Environment setup for production:**
- Set `NODE_ENV=production` in your hosting environment variables
- Use your **MongoDB Atlas** connection string for `ATLAS_URL`
- Add all `.env` keys as environment variables in your hosting dashboard — never commit `.env` to Git

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">Built with ❤️ by <a href="https://github.com/PratikHarkare06">Pratik Harkare</a></p>
