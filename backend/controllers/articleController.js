const db = require("../db");

exports.getArticles = async (req, res) => {
    try {

        const [rows] = await db.query(`
            SELECT
                a.*,
                u.full_name AS author
            FROM articles a
            JOIN users u
                ON a.expert_id = u.id
            ORDER BY a.created_at DESC
        `);

        res.json(rows);

    } catch (err) {
        res.status(500).json(err);
    }
};

exports.getArticleById = async (req, res) => {
    try {

        const [rows] = await db.query(
            `
            SELECT *
            FROM articles
            WHERE id = ?
            `,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Article not found"
            });
        }

        res.json(rows[0]);

    } catch (err) {
        res.status(500).json(err);
    }
};