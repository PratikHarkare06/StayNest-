# Features of Wanderlust Application

This document provides a comprehensive overview of every feature implemented in the Wanderlust application, detailing the technical implementation and user benefits.

## 1. Authentication & User Management 👤
*Built with Passport.js for secure and scalable authentication.*

- **Secure Signup & Login**:
  - Users can create accounts and log in using Local Authentication.
  - Passwords are hashed and salted/hashed (using `passport-local-mongoose`) before storage.
  - Session-based persistence ensures users stay logged in.
- **User Profiles**:
  - Users have a dedicated profile page.
  - Ability to upload and update profile pictures (stored on Cloudinary).
- **Wishlist System (AJAX)**:
  - **Hearts**: Users can click the heart icon on any listing to add it to their wishlist.
  - **Real-time**: Updates happen instantly without page reloads using AJAX (`fetch` API).
  - **Start/Empty State**: Users can toggle items on/off seamlessly.
- **Dashboard**:
  - A personalized dashboard (`/dashboard`) showing the user's active listings and relevant actions.

## 2. Listings & Property Management 🏠
*The core of the application, allowing users to host and explore properties.*

- **CRUD Operations**:
  - **Create**: Hosted users can list new properties with Title, Description, Image, Price, Location, and Country.
  - **Read**: Detailed view for every listing (`/listings/:id`) showcasing all property data.
  - **Update**: Listing owners can edit details and replace images.
  - **Delete**: Owners can permanently remove their listings.
- **Cloud Image Storage**:
  - Integration with **Cloudinary** for scalable image hosting.
  - Automatic optimization and transformation of uploaded images.
- **Categorization**:
  - Listings are tagged with categories (e.g., Trending, Beach, Castles, Camping).
  - Filter pill-bar on the homepage allows users to filter by specific categories.

## 3. Advanced Search & Discovery 🔍
*A robust search engine designed for instant discovery.*

- **Dynamic Search Bar**:
  - **Mixed-Mode Logic**:
    - **Default State**: Shows a curated list of popular destinations (e.g., Mumbai, Goa, Manali) for inspiration.
    - **Active State**: As the user types, it switches to specific database results via **AJAX**.
  - **Rich Suggestions**: Search results display the property image, title, and location.
  - **Keyboard Navigation**: Full support for Arrow keys and Enter to navigate suggestions.
- **Filter Parameters**:
  - Search by **Location**, **Title**, or **Country**.
  - Integrated **Date Picker** for selecting check-in/check-out dates.
  - **Guest Counter** with separate counts for Adults, Children, and Infants.

## 4. Map Integration & Geocoding 🗺️
*Powered by Geoapify and Leaflet/Mapbox standards.*

- **Geocoding**:
  - Automatically converts text addresses (e.g., "Mumbai, India") into latitude/longitude coordinates upon listing creation.
- **Cluster Map**:
  - Interactive map on the homepage grouping nearby listings into clusters.
  - Clusters break apart into individual pins upon zooming.
- **Listing Location Map**:
  - Each listing detail page features a dedicated map showing the exact property location.

## 5. Reviews & Ratings ⭐
*Community-driven trust system.*

- **Star Ratings**: Users can rate properties from 1 to 5 stars.
- **Review Text**: Text-based feedback options.
- **Dynamic Deletion**: Design allows users to delete their own reviews.
- **Visual Breakdown**: Progress bars displaying the distribution of ratings.

## 6. Financial & Booking Features 💰
- **Tax Toggle Switch**:
  - A toggle on the main page to switch between "Base Price" and "After Tax (18% GST)".
  - Updates all prices on the page dynamically via JavaScript.
- **Booking System**:
  - Users can reserve properties for specific dates.
  - **Admin Booking Dashboard**: Administrators can view and manage all system bookings.

## 7. UI/UX Architectures 🎨
- **Responsive Design**: Fully responsive layout using **Bootstrap 5** grid system, working perfectly on Mobile, Tablet, and Desktop.
- **Sticky Booking Bar (Mobile)**:
  - On mobile devices, the booking price and button stick to the bottom of the screen for better conversion.
- **Skeleton & Lazy Loading**:
  - **Skeleton Screens**: displaying placeholder shapes while data loads to improve perceived performance.
  - **Lazy Loading**: Images load only when they scroll into the viewport, saving bandwidth.
- **Toast Notifications**:
  - Non-intrusive popup alerts (Flash messages) for actions like "Login Successful", "Listing Created", or "Error".

## 8. Security & Infrastructure 🛡️
- **Middleware Authorization**:
  - `isLoggedIn`: Protects routes requiring authentication.
  - `isOwner`: Ensures only the listing creator can edit/delete it.
  - `isReviewAuthor`: Restricts review deletion to the author.
- **Data Validation**:
  - **Joi** schemas validate all incoming data (forms) on the server side to prevent invalid or malicious inputs.
- **Helmet**:
  - Implements HTTP headers (like Content Security Policy, XSS Protection) to secure the app.
- **Session Security**:
  - HttpOnly cookies and secure session configuration to prevent session hijacking.
- **MVC Architecture**:
  - Clean separation of **M**odels (Mongoose), **V**iews (EJS), and **C**ontrollers (Business Logic).

---

*This document serves as the official feature reference for the Wanderlust project.*
