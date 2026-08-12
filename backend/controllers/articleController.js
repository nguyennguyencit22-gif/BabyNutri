// @ts-nocheck
const db = require("../db");

exports.getArticles = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, u.full_name AS author
            FROM articles a
            JOIN users u ON a.expert_id = u.id
            ORDER BY a.id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("getArticles error:", err);
        res.status(500).json({ message: "Failed to fetch articles", error: err.message });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT a.*, u.full_name AS author
            FROM articles a
            JOIN users u ON a.expert_id = u.id
            WHERE a.id = ?
            `,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("getArticleById error:", err);
        res.status(500).json({ message: "Failed to fetch article", error: err.message });
    }
};

exports.getMyArticles = async (req, res) => {
    try {
        const expertId = req.user?.id;
        if (!expertId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [rows] = await db.query(
            `SELECT * FROM articles WHERE expert_id = ? ORDER BY id DESC`,
            [expertId]
        );
        res.json(rows);
    } catch (err) {
        console.error("getMyArticles error:", err);
        res.status(500).json({ message: "Failed to fetch your articles", error: err.message });
    }
};

exports.createArticle = async (req, res) => {
    try {
        const { title, summary, content, imageUrl } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        const expertId = req.user?.id || 2;

        const [result] = await db.query(
            `INSERT INTO articles (title, summary, content, image_url, expert_id) VALUES (?, ?, ?, ?, ?)`,
            [title, summary || '', content, imageUrl || '', expertId]
        );
        res.status(201).json({ message: "Article created", id: result.insertId });
    } catch (err) {
        console.error("createArticle error:", err);
        res.status(500).json({ message: "Failed to create article", error: err.message });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, summary, content, imageUrl } = req.body;
        await db.query(
            `UPDATE articles SET title = COALESCE(?, title), summary = COALESCE(?, summary), content = COALESCE(?, content), image_url = COALESCE(?, image_url) WHERE id = ?`,
            [title, summary, content, imageUrl, id]
        );
        res.json({ message: "Article updated" });
    } catch (err) {
        console.error("updateArticle error:", err);
        res.status(500).json({ message: "Failed to update article", error: err.message });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const id = req.params.id;
        await db.query(`DELETE FROM articles WHERE id = ?`, [id]);
        res.json({ message: "Article deleted" });
    } catch (err) {
        console.error("deleteArticle error:", err);
        res.status(500).json({ message: "Failed to delete article", error: err.message });
    }
};