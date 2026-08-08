// @ts-nocheck
const path = require("path");
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Download from Firebase Console → Project settings → Service accounts →
// Generate new private key, then save it exactly at this path. Never commit
// this file — it's already covered by the repo's .gitignore.
const SERVICE_ACCOUNT_PATH = path.join(
    __dirname,
    "firebase-service-account.json"
);

let initError = null;

// Loaded lazily/defensively: the credential file won't exist until someone
// downloads it from Firebase Console, and the rest of the backend (recipes,
// home, measurement-settings...) must keep working even if nobody ever
// wires Firebase up. Only the firebase-login route depends on this.
if (getApps().length === 0) {
    try {
        const serviceAccount = require(SERVICE_ACCOUNT_PATH);

        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error) {
        initError =
            "Missing/invalid backend/config/firebase-service-account.json. " +
            "Download it from Firebase Console (Project settings > " +
            "Service accounts > Generate new private key) and place it there.";
    }
}

function isReady() {
    return initError === null;
}

function verifyIdToken(idToken) {
    return getAuth().verifyIdToken(idToken);
}

module.exports = {
    isReady,
    initError: () => initError,
    verifyIdToken,
};
