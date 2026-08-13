const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const { uploadImage } = require("../controllers/uploadController");

router.post("/image", auth, upload.single("image"), uploadImage);

module.exports = router;
