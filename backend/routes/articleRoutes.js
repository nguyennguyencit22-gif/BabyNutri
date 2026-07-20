const express = require("express");
const router = express.Router();

const {
    getArticles,
    getArticleById
} = require("../controllers/articleController");

router.get("/", getArticles);

router.get("/:id", getArticleById);

module.exports = router;