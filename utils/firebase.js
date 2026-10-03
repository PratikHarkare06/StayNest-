const admin = require("firebase-admin");

if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID
        });
    } else {
        console.warn("⚠️ Warning: FIREBASE_PROJECT_ID is not defined in environment variables. Firebase Admin functions may be degraded.");
    }
}

module.exports = admin;
