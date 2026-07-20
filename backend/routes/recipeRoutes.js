const express = require("express");
const router = express.Router();

const {
    getRecipes,
    getRecipeById,
    getRecipeComments,
    getRecipeRatings,
    getRecipeRatingSummary,
    createComment,
    createOrUpdateRating
} = require("../controllers/recipeController");

const auth = require("../middleware/auth");

// ==========================================
// ROUTES
// ==========================================

router.get("/", getRecipes);
router.get("/:id", getRecipeById);

// COMMENTS
router.get("/:id/comments", getRecipeComments);

router.post("/:id/comments", auth, createComment);

// RATINGS
router.get("/:id/ratings", getRecipeRatings);

router.post("/:id/rating", auth, createOrUpdateRating);

// RATING SUMMARY
router.get("/:id/rating-summary", getRecipeRatingSummary);



module.exports = router;