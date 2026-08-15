const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
    },
});

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/gif",
    "application/octet-stream",
]);

const ALLOWED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".gif"]);

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) || ALLOWED_EXTS.has(ext)) {
        return cb(null, true);
    }
    return cb(new Error("Only image files (jpeg, png, webp, heic) are allowed"));
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 8 * 1024 * 1024 },
});
