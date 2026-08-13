const express = require("express");
const router = express.Router();
const { getMyProfile, updateMyProfile } = require("../controllers/expertController");
const auth = require("../middleware/auth");

router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);

module.exports = router;
