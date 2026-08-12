const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getExperts,
    getExpertById,
    toggleFollowExpert,
    updateMyExpertProfile,
} = require("../controllers/expertController");

router.get("/", auth, getExperts);
router.put("/profile", auth, updateMyExpertProfile);
router.get("/:id", auth, getExpertById);
router.post("/:id/follow", auth, toggleFollowExpert);

module.exports = router;
