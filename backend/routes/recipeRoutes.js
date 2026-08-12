const express = require("express");
const router = express.Router();
const {
    getRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    getRecipeComments,
    getRecipeRatings,
    getRecipeRatingSummary,
    getMyRating,
    createComment,
    createOrUpdateRating,
    toggleFavorite,
    getMyFavorites
} = require("../controllers/recipeController");
const auth = require("../middleware/auth");

// Search / favorites đặt TRƯỚC "/:id" để không bị nuốt route
router.get("/search", searchRecipes);
router.get("/favorites/mine", auth, getMyFavorites);

router.get("/", getRecipes);
router.post("/", auth, createRecipe);
router.get("/:id", getRecipeById);
router.put("/:id", auth, updateRecipe);
router.delete("/:id", auth, deleteRecipe);

router.get("/:id/comments", getRecipeComments);
router.post("/:id/comments", auth, createComment);
router.get("/:id/ratings", getRecipeRatings);
router.post("/:id/rating", auth, createOrUpdateRating);
router.get("/:id/rating-summary", getRecipeRatingSummary);
router.get("/:id/my-rating", auth, getMyRating);
router.post("/:id/favorite", auth, toggleFavorite);

module.exports = router;