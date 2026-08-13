const express = require("express");
const router = express.Router();
const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getMyArticles,
    getArticleComments,
    addArticleComment,
    deleteArticleComment,
    getArticleRatings,
    getArticleRatingSummary,
    getMyArticleRating,
    createOrUpdateArticleRating
} = require("../controllers/articleController");
const auth = require("../middleware/auth");

// "mine" placed BEFORE "/:id"
router.get("/mine", auth, getMyArticles);

// Comments
router.get("/:id/comments", getArticleComments);
router.post("/:id/comments", auth, addArticleComment);
router.delete("/comments/:commentId", auth, deleteArticleComment);

// Ratings
router.get("/:id/ratings", getArticleRatings);
router.get("/:id/rating-summary", getArticleRatingSummary);
router.get("/:id/my-rating", auth, getMyArticleRating);
router.post("/:id/ratings", auth, createOrUpdateArticleRating);

// Standard CRUD
router.get("/", getArticles);
router.post("/", auth, createArticle);
router.get("/:id", getArticleById);
router.put("/:id", auth, updateArticle);
router.delete("/:id", auth, deleteArticle);

module.exports = router;