
const mongoose = require('mongoose');
const Listing = require('../models/listing');

if (process.env.NODE_ENV != "production") {
    require("dotenv").config({ path: '../.env' });
}

const DB_URL = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/wanderlust";
const TARGET_USER_ID = "696db697f848e4c6265f7d94"; // demo1 

async function run() {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB");

    const result = await Listing.updateMany({}, { owner: TARGET_USER_ID });
    console.log(`Updated ${result.modifiedCount} listings to be owned by User ID: ${TARGET_USER_ID}`);

    console.log("Done.");
    process.exit();
}

run();
