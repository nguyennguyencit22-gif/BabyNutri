const express = require("express");
const router = express.Router();
const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getMyArticles
} = require("../controllers/articleController");
const auth = require("../middleware/auth");

// "mine" đặt TRƯỚC "/:id" để không bị nuốt route
router.get("/mine", auth, getMyArticles);

router.get("/", getArticles);
router.post("/", auth, createArticle);
router.get("/:id", getArticleById);
router.put("/:id", auth, updateArticle);
router.delete("/:id", auth, deleteArticle);

module.exports = router;