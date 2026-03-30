require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const dbUrl = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/wonderlust";

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to DB for updating Admin rights...");
        makeAllAdmin();
    })
    .catch((err) => console.log("DB Connection Error:", err));

async function makeAllAdmin() {
    try {
        const result = await User.updateMany({}, { $set: { isAdmin: true } });
        console.log(`✅ Success! Updated ${result.modifiedCount} users to have Admin access.`);
        console.log("You can now login and access the /admin dashboard.");
    } catch (err) {
        console.error("❌ Error updating users:", err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}
