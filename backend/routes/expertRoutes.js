const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getMyProfile,
    updateMyProfile,
    getExperts,
    getExpertById,
    toggleFollowExpert,
    updateMyExpertProfile,
    getExpertRatingBreakdown,
} = require("../controllers/expertController");

router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);
router.get("/", auth, getExperts);
router.put("/profile", auth, updateMyExpertProfile);
router.get("/:id/rating-breakdown", getExpertRatingBreakdown);
router.get("/:id", auth, getExpertById);
router.post("/:id/follow", auth, toggleFollowExpert);

module.exports = router;
