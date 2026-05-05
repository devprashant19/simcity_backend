const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    // Attempt to load from environment variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Fallback for development if file exists
      // admin.initializeApp({
      //   credential: admin.credential.applicationDefault()
      // });
      console.warn("FIREBASE_SERVICE_ACCOUNT not set. Token verification will fail.");
    }
  } catch (err) {
    console.error("Firebase Admin initialization error:", err.message);
  }
}

module.exports = admin;
