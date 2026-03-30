const admin = require("firebase-admin");

// Initialize Firebase Admin without a service account JSON by grabbing the Project ID.
// This allows us to securely verify ID tokens sent from the frontend!
admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID
});

module.exports = admin;
