// @ts-nocheck
const db = require("../db");

/**
 * GET /api/questions
 * List all questions with answers & parent/expert details.
 */
exports.getQuestions = async (req, res) => {
    try {
        const { status, myOnly } = req.query;

        let sql = `
            SELECT
                q.id,
                q.title,
                q.content,
                q.status,
                q.created_at AS createdAt,
                q.parent_id AS parentId,
                q.expert_id AS targetExpertId,
                ut.full_name AS targetExpertName,
                up.full_name AS parentName,
                a.id AS answerId,
                a.content AS answerContent,
                a.created_at AS answeredAt,
                ue.id AS expertId,
                ue.full_name AS expertName
            FROM questions q
            LEFT JOIN users up ON q.parent_id = up.id
            LEFT JOIN users ut ON q.expert_id = ut.id
            LEFT JOIN answers a ON q.id = a.question_id
            LEFT JOIN users ue ON a.expert_id = ue.id
        `;

        const conditions = [];
        const params = [];

        if (status) {
            conditions.push("q.status = ?");
            params.push(status);
        }

        if (myOnly === "true" && req.user) {
            conditions.push("q.parent_id = ?");
            params.push(req.user.id);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += ` ORDER BY q.created_at DESC`;

        const [rows] = await db.query(sql, params);

        const result = rows.map((r) => ({
            id: r.id.toString(),
            title: r.title,
            content: r.content,
            status: r.status || "Pending",
            createdAt: r.createdAt,
            parentName: r.parentName || "Anonymous Parent",
            targetExpertId: r.targetExpertId ? r.targetExpertId.toString() : null,
            targetExpertName: r.targetExpertName || null,
            answer: r.answerContent
                ? {
                      id: r.answerId?.toString(),
                      content: r.answerContent,
                      expertName: r.expertName || "Nutrition Expert",
                      answeredAt: r.answeredAt,
                  }
                : null,
        }));

        return res.json(result);
    } catch (error) {
        console.error("GET QUESTIONS ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/questions/public-experts
 * Returns list of verified experts for parent dropdown selection.
 */
exports.getPublicExperts = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.full_name AS fullName, ep.specialization
             FROM users u
             JOIN expert_profiles ep ON u.id = ep.expert_id
             WHERE u.role_id = 2 AND ep.is_verified = TRUE
             ORDER BY u.full_name ASC`
        );
        return res.json(rows);
    } catch (error) {
        console.error("GET PUBLIC EXPERTS ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/questions
 * Parent submits a new question (optional target expertId).
 */
exports.createQuestion = async (req, res) => {
    try {
        const { title, content, expertId } = req.body;
        const parentId = req.user ? req.user.id : null;
        const targetExpertId = expertId ? Number(expertId) : null;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required." });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Content is required." });
        }

        const [result] = await db.query(
            `INSERT INTO questions (parent_id, expert_id, title, content, status) VALUES (?, ?, ?, ?, 'Pending')`,
            [parentId, targetExpertId, title.trim(), content.trim()]
        );

        return res.status(201).json({
            message: "Question submitted successfully.",
            question: {
                id: result.insertId.toString(),
                title: title.trim(),
                content: content.trim(),
                targetExpertId: targetExpertId ? targetExpertId.toString() : null,
                status: "Pending",
                createdAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("CREATE QUESTION ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/questions/:id/answer
 * Expert / Admin answers a pending question.
 */
exports.answerQuestion = async (req, res) => {
    const connection = await db.getConnection();
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const role = (req.user.role || "").toLowerCase();
        if (role !== "expert" && role !== "admin") {
            return res.status(403).json({ message: "Only Experts and Admins can answer questions." });
        }

        const questionId = Number(req.params.id);
        const { content } = req.body;
        const expertId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Answer content is required." });
        }

        await connection.beginTransaction();

        const [qRows] = await connection.query("SELECT id, parent_id, title FROM questions WHERE id = ?", [questionId]);
        if (qRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Question not found." });
        }

        const parentId = qRows[0].parent_id;
        const qTitle = qRows[0].title;

        await connection.query("DELETE FROM answers WHERE question_id = ?", [questionId]);

        const [ansResult] = await connection.query(
            "INSERT INTO answers (question_id, expert_id, content) VALUES (?, ?, ?)",
            [questionId, expertId, content.trim()]
        );

        await connection.query(
            "UPDATE questions SET status = 'Answered', expert_id = ? WHERE id = ?",
            [expertId, questionId]
        );

        await connection.commit();

        if (parentId) {
            try {
                const [expUser] = await db.query(
                    `SELECT full_name FROM users WHERE id = ?`,
                    [expertId]
                );
                const expName = expUser.length > 0 ? expUser[0].full_name : "Expert";
                const { sendNotificationToUsers } = require("./notificationController");
                await sendNotificationToUsers(
                    [parentId],
                    `Question Answered by ${expName}`,
                    `${expName} answered your question: "${qTitle}"`,
                    "question",
                    questionId
                );
            } catch (notifErr) {
                console.error("Failed to send Q&A notification:", notifErr);
            }
        }

        return res.json({
            message: "Answer submitted successfully.",
            answer: {
                id: ansResult.insertId.toString(),
                questionId: questionId.toString(),
                content: content.trim(),
                expertId,
                answeredAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error("ANSWER QUESTION ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    } finally {
        connection.release();
    }
};

/**
 * POST /api/questions/faq
 * Expert / Admin creates a new FAQ item (auto-answered question).
 */
exports.createFAQ = async (req, res) => {
    const connection = await db.getConnection();
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const role = (req.user.role || "").toLowerCase();
        if (role !== "expert" && role !== "admin") {
            return res.status(403).json({ message: "Only Experts and Admins can create FAQ items." });
        }

        const { title, content, answer } = req.body;
        const expertId = req.user.id;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required." });
        }

        await connection.beginTransaction();

        const [qResult] = await connection.query(
            "INSERT INTO questions (expert_id, title, content, status) VALUES (?, ?, ?, 'Answered')",
            [expertId, title.trim(), content ? content.trim() : title.trim()]
        );

        const questionId = qResult.insertId;

        const answerText = answer ? answer.trim() : (content ? content.trim() : title.trim());

        await connection.query(
            "INSERT INTO answers (question_id, expert_id, content) VALUES (?, ?, ?)",
            [questionId, expertId, answerText]
        );

        await connection.commit();

        return res.status(201).json({
            message: "FAQ created successfully.",
            faq: {
                id: questionId.toString(),
                title: title.trim(),
                content: answerText,
                status: "Answered",
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error("CREATE FAQ ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    } finally {
        connection.release();
    }
};

/**
 * DELETE /api/questions/:id
 * Delete a question (Expert / Admin only).
 */
exports.deleteQuestion = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const role = (req.user.role || "").toLowerCase();
        if (role !== "expert" && role !== "admin") {
            return res.status(403).json({ message: "Only Experts and Admins can delete questions." });
        }

        const questionId = Number(req.params.id);

        await db.query("DELETE FROM questions WHERE id = ?", [questionId]);

        return res.json({ message: "Question deleted successfully." });
    } catch (error) {
        console.error("DELETE QUESTION ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/questions/:id/messages
 * Get all realtime chat messages for a specific Q&A topic.
 */
exports.getQuestionMessages = async (req, res) => {
    try {
        const questionId = Number(req.params.id);

        const [rows] = await db.query(
            `SELECT
                m.id,
                m.question_id AS questionId,
                m.sender_id AS senderId,
                m.sender_role AS senderRole,
                m.content,
                m.created_at AS createdAt,
                u.full_name AS senderName,
                u.avatar AS senderAvatar
             FROM qna_messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.question_id = ?
             ORDER BY m.id ASC`,
            [questionId]
        );

        return res.json(rows);
    } catch (error) {
        console.error("GET QUESTION MESSAGES ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/questions/:id/messages
 * HTTP fallback API to send a chat message in a Q&A topic.
 */
exports.addQuestionMessage = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const questionId = Number(req.params.id);
        const senderId = req.user.id;
        const senderRole = (req.user.role || "parent").toLowerCase();
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Message content cannot be empty." });
        }

        const [result] = await db.query(
            `INSERT INTO qna_messages (question_id, sender_id, sender_role, content) VALUES (?, ?, ?, ?)`,
            [questionId, senderId, senderRole, content.trim()]
        );

        if (senderRole === "expert") {
            await db.query(`UPDATE questions SET status = 'Answered' WHERE id = ?`, [questionId]);
        }

        const [userRows] = await db.query(`SELECT full_name, avatar FROM users WHERE id = ?`, [senderId]);
        const senderName = userRows.length > 0 ? userRows[0].full_name : "User";

        return res.status(201).json({
            id: result.insertId,
            questionId,
            senderId,
            senderName,
            senderRole,
            content: content.trim(),
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("ADD QUESTION MESSAGE ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

