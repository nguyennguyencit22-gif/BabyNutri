const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            req.user = null;
            return next();
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            req.user = null;
            return next();
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decoded;
        next();
    } catch (err) {
        console.error("AUTH ERROR:", err);
        req.user = null;
        next();
    }
};

module.exports = auth;