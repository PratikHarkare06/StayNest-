
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const User = require('../models/user');

if (process.env.NODE_ENV != "production") {
    require("dotenv").config({ path: '../.env' });
}

const DB_URL = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function run() {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB");

    const users = await User.find({});
    console.log(`\n--- USERS (${users.length}) ---`);
    users.forEach(u => console.log(`ID: ${u._id}, Username: ${u.username}, IsAdmin: ${u.isAdmin}`));

    const listings = await Listing.find({});
    console.log(`\n--- LISTINGS (${listings.length}) ---`);
    listings.forEach(l => console.log(`ID: ${l._id}, Title: ${l.title}, Owner: ${l.owner}`));

    const bookings = await Booking.find({}).populate('listing');
    console.log(`\n--- BOOKINGS (${bookings.length}) ---`);

    for (let b of bookings) {
        if (b.listing) {
            console.log(`Booking ID: ${b._id}`);
            console.log(` - Listing: ${b.listing.title} (${b.listing._id})`);
            console.log(` - Listing Owner: ${b.listing.owner}`);
            console.log(` - Booked By: ${b.user}`);
            console.log(` - Status: ${b.status}`);
            console.log(` - Price: ${b.totalPrice}`);
            console.log(` - Created: ${b.createdAt}`);
        } else {
            console.log(`Booking ID: ${b._id} [ORPHANED - Listing Deleted]`);
        }
    }

    console.log("\nDone.");
    process.exit();
}

run();
