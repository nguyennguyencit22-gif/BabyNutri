// @ts-nocheck
const { isReady, initError, verifyIdToken } = require("../config/firebaseAdmin");

// Verifies a Firebase ID token (NOT our own JWT) and attaches the trusted
// { uid, email, name, picture } to req.firebaseUser. Used only by the
// firebase-login route — every other protected route keeps using the
// regular `auth` middleware + our own JWT.
const firebaseAuth = async (req, res, next) => {
    if (!isReady()) {
        console.error("FIREBASE AUTH ERROR:", initError());

        return res.status(500).json({
            message: "Firebase Admin is not configured on the server.",
        });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No Firebase ID token provided",
            });
        }

        const idToken = authHeader.split(" ")[1];

        if (!idToken) {
            return res.status(401).json({
                message: "Invalid token format",
            });
        }

        const decoded = await verifyIdToken(idToken);

        req.firebaseUser = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
        };

        next();
    } catch (err) {
        console.error("FIREBASE AUTH ERROR:", err);

        return res.status(401).json({
            message: "Invalid or expired Firebase ID token",
        });
    }
};

module.exports = firebaseAuth;
