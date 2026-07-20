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