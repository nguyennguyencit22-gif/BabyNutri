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
        const { title, summary, content, imageUrl, category, targetAge, readingTime, tags } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        const expertId = req.user?.id || 2;

        const [result] = await db.query(
            `INSERT INTO articles (title, summary, content, image_url, expert_id, category, target_age, reading_time, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, summary || '', content, imageUrl || '', expertId, category || null, targetAge || null, readingTime || null, tags || null]
        );
        const articleId = result.insertId;

        if (expertId) {
            try {
                const [followers] = await db.query(
                    `SELECT user_id FROM expert_followers WHERE expert_id = ?`,
                    [expertId]
                );
                if (followers.length > 0) {
                    const followerIds = followers.map((f) => f.user_id);
                    const [expUser] = await db.query(
                        `SELECT full_name FROM users WHERE id = ?`,
                        [expertId]
                    );
                    const expName = expUser.length > 0 ? expUser[0].full_name : "Expert";
                    const { sendNotificationToUsers } = require("./notificationController");
                    await sendNotificationToUsers(
                        followerIds,
                        `New Article from ${expName}`,
                        `${expName} published a new article: "${title}"`,
                        "article",
                        articleId
                    );
                }
            } catch (notifErr) {
                console.error("Failed to send article notifications:", notifErr);
            }
        }

        res.status(201).json({ message: "Article created", id: articleId });
    } catch (err) {
        console.error("createArticle error:", err);
        res.status(500).json({ message: "Failed to create article", error: err.message });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, summary, content, imageUrl, category, targetAge, readingTime, tags } = req.body;
        await db.query(
            `UPDATE articles SET
                title = COALESCE(?, title),
                summary = COALESCE(?, summary),
                content = COALESCE(?, content),
                image_url = COALESCE(?, image_url),
                category = COALESCE(?, category),
                target_age = COALESCE(?, target_age),
                reading_time = COALESCE(?, reading_time),
                tags = COALESCE(?, tags)
             WHERE id = ?`,
            [title, summary, content, imageUrl, category, targetAge, readingTime, tags, id]
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

// ==========================================
// ARTICLE COMMENTS
// ==========================================
exports.getArticleComments = async (req, res) => {
    try {
        const articleId = req.params.id;
        const [rows] = await db.query(`
            SELECT c.id, c.content, c.created_at AS createdAt, u.full_name AS userName, u.avatar AS userAvatar
            FROM article_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.id DESC
        `, [articleId]);
        res.json(rows);
    } catch (err) {
        console.error("getArticleComments error:", err);
        res.status(500).json({ message: "Failed to fetch article comments" });
    }
};

exports.addArticleComment = async (req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const [result] = await db.query(`
            INSERT INTO article_comments (article_id, user_id, content)
            VALUES (?, ?, ?)
        `, [articleId, userId, content.trim()]);

        const [userRows] = await db.query(`SELECT full_name, avatar FROM users WHERE id = ?`, [userId]);
        const userName = userRows.length > 0 ? userRows[0].full_name : "User";
        const userAvatar = userRows.length > 0 ? userRows[0].avatar : null;

        res.status(201).json({
            id: result.insertId,
            articleId,
            userId,
            userName,
            userAvatar,
            content: content.trim(),
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("addArticleComment error:", err);
        res.status(500).json({ message: "Failed to add article comment" });
    }
};

exports.deleteArticleComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.id;

        const [existing] = await db.query(`SELECT user_id FROM article_comments WHERE id = ?`, [commentId]);
        if (!existing.length) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({ message: "You can only delete your own comment" });
        }

        await db.query(`DELETE FROM article_comments WHERE id = ?`, [commentId]);
        res.json({ message: "Comment deleted" });
    } catch (err) {
        console.error("deleteArticleComment error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ==========================================
// ARTICLE RATINGS
// ==========================================
exports.getArticleRatings = async (req, res) => {
    try {
        const articleId = req.params.id;
        const [rows] = await db.query(`
            SELECT r.id, r.rating, r.review, r.created_at AS createdAt, u.full_name AS userName
            FROM article_ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.article_id = ?
            ORDER BY r.id DESC
        `, [articleId]);
        res.json(rows);
    } catch (err) {
        console.error("getArticleRatings error:", err);
        res.status(500).json({ message: "Failed to fetch article ratings" });
    }
};

exports.getArticleRatingSummary = async (req, res) => {
    try {
        const articleId = req.params.id;
        const [rows] = await db.query(`
            SELECT COUNT(*) AS totalRatings, COALESCE(AVG(rating), 0) AS averageRating
            FROM article_ratings
            WHERE article_id = ?
        `, [articleId]);

        res.json({
            totalRatings: rows[0].totalRatings,
            averageRating: Number(Number(rows[0].averageRating).toFixed(1)),
        });
    } catch (err) {
        console.error("getArticleRatingSummary error:", err);
        res.status(500).json({ message: "Failed to fetch article rating summary" });
    }
};

exports.getMyArticleRating = async (req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [rows] = await db.query(
            `SELECT rating FROM article_ratings WHERE article_id = ? AND user_id = ?`,
            [articleId, userId]
        );
        res.json({ rating: rows.length > 0 ? rows[0].rating : null });
    } catch (err) {
        console.error("getMyArticleRating error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createOrUpdateArticleRating = async (req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user.id;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Valid rating (1-5) required" });
        }

        const [existing] = await db.query(
            `SELECT id FROM article_ratings WHERE article_id = ? AND user_id = ?`,
            [articleId, userId]
        );

        if (existing.length > 0) {
            await db.query(
                `UPDATE article_ratings SET rating = ?, review = ? WHERE article_id = ? AND user_id = ?`,
                [rating, review || null, articleId, userId]
            );
        } else {
            await db.query(
                `INSERT INTO article_ratings (article_id, user_id, rating, review) VALUES (?, ?, ?, ?)`,
                [articleId, userId, rating, review || null]
            );
        }

        res.json({ message: "Article rating saved successfully" });
    } catch (err) {
        console.error("createOrUpdateArticleRating error:", err);
        res.status(500).json({ message: "Failed to save article rating" });
    }
};
