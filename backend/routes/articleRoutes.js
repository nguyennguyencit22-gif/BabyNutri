const express = require("express");
const router = express.Router();
const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
} = require("../controllers/articleController");
const auth = require("../middleware/auth");

router.get("/", getArticles);
router.post("/", auth, createArticle);
router.get("/:id", getArticleById);
router.put("/:id", auth, updateArticle);
router.delete("/:id", auth, deleteArticle);

module.exports = router;