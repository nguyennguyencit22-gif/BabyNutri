// @ts-nocheck
const db = require("../db");

// ==========================================
// EXPERTS (for Parent's "start a chat" picker)
// ==========================================
exports.getExperts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.full_name AS name, ep.specialization AS role, u.avatar AS image
            FROM expert_profiles ep
            JOIN users u ON u.id = ep.expert_id
            WHERE ep.is_verified = TRUE
            ORDER BY u.id ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error("getExperts error:", err);
        res.status(500).json({ message: "Failed to fetch experts", error: err.message });
    }
};

// ==========================================
// CONVERSATIONS
// ==========================================

// Parent starts (or resumes) a conversation with a given expert.
exports.startConversation = async (req, res) => {
    try {
        const parentId = req.user?.id;
        const { expertId } = req.body;

        if (!parentId) {
            return res.status(401).json({ message: "Login required" });
        }
        if (!expertId) {
            return res.status(400).json({ message: "expertId is required" });
        }

        const [existing] = await db.query(
            `SELECT id FROM chat_conversations WHERE parent_id = ? AND expert_id = ?`,
            [parentId, expertId]
        );

        if (existing.length > 0) {
            return res.json({ id: existing[0].id });
        }

        const [result] = await db.query(
            `INSERT INTO chat_conversations (parent_id, expert_id) VALUES (?, ?)`,
            [parentId, expertId]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error("startConversation error:", err);
        res.status(500).json({ message: "Failed to start conversation", error: err.message });
    }
};

// List conversations for the current user — Parent sees the ones they
// started, Expert/Admin sees the ones addressed to them.
exports.getMyConversations = async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = (req.user?.role || '').toLowerCase();

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const isExpertSide = role === 'expert' || role === 'admin';
        const [rows] = await db.query(`
            SELECT
                c.id, c.status, c.last_message AS lastMessage, c.last_message_at AS lastMessageAt, c.created_at AS createdAt,
                pu.id AS parentId, pu.full_name AS parentName, pu.avatar AS parentAvatar,
                eu.id AS expertId, eu.full_name AS expertName, eu.avatar AS expertAvatar
            FROM chat_conversations c
            JOIN users pu ON pu.id = c.parent_id
            JOIN users eu ON eu.id = c.expert_id
            WHERE ${isExpertSide ? 'c.expert_id' : 'c.parent_id'} = ?
            ORDER BY c.last_message_at DESC
        `, [userId]);

        res.json(rows);
    } catch (err) {
        console.error("getMyConversations error:", err);
        res.status(500).json({ message: "Failed to fetch conversations", error: err.message });
    }
};

const assertParticipant = async (conversationId, userId) => {
    const [rows] = await db.query(
        `SELECT parent_id, expert_id, status FROM chat_conversations WHERE id = ?`,
        [conversationId]
    );
    if (!rows.length) return null;
    const convo = rows[0];
    if (convo.parent_id !== userId && convo.expert_id !== userId) return null;
    return convo;
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user?.id;
        const conversationId = req.params.id;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const convo = await assertParticipant(conversationId, userId);
        if (!convo) {
            return res.status(403).json({ message: "Not a participant in this conversation" });
        }

        const [rows] = await db.query(`
            SELECT m.id, m.sender_id AS senderId, m.content, m.created_at AS createdAt
            FROM chat_messages m
            WHERE m.conversation_id = ?
            ORDER BY m.id ASC
        `, [conversationId]);

        res.json(rows);
    } catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Failed to fetch messages", error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user?.id;
        const conversationId = req.params.id;
        const { content } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Content is required" });
        }

        const convo = await assertParticipant(conversationId, userId);
        if (!convo) {
            return res.status(403).json({ message: "Not a participant in this conversation" });
        }

        const messageId = await exports.persistMessage(conversationId, userId, content.trim());
        res.status(201).json({
            id: messageId,
            conversationId: Number(conversationId),
            senderId: userId,
            content: content.trim(),
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("sendMessage error:", err);
        res.status(500).json({ message: "Failed to send message", error: err.message });
    }
};

exports.endConversation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const conversationId = req.params.id;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const convo = await assertParticipant(conversationId, userId);
        if (!convo) {
            return res.status(403).json({ message: "Not a participant in this conversation" });
        }

        await db.query(`UPDATE chat_conversations SET status = 'ended' WHERE id = ?`, [conversationId]);
        res.json({ message: "Conversation ended" });
    } catch (err) {
        console.error("endConversation error:", err);
        res.status(500).json({ message: "Failed to end conversation", error: err.message });
    }
};

exports.rateConversation = async (req, res) => {
    try {
        const parentId = req.user?.id;
        const conversationId = req.params.id;
        const { rating, review } = req.body;

        if (!parentId) {
            return res.status(401).json({ message: "Login required" });
        }
        if (!rating) {
            return res.status(400).json({ message: "Rating required" });
        }

        const [rows] = await db.query(
            `SELECT parent_id FROM chat_conversations WHERE id = ?`,
            [conversationId]
        );
        if (!rows.length || rows[0].parent_id !== parentId) {
            return res.status(403).json({ message: "Only the parent in this conversation can rate it" });
        }

        await db.query(
            `INSERT INTO chat_ratings (conversation_id, parent_id, rating, review) VALUES (?, ?, ?, ?)`,
            [conversationId, parentId, rating, review || null]
        );
        res.status(201).json({ message: "Rating saved" });
    } catch (err) {
        console.error("rateConversation error:", err);
        res.status(500).json({ message: "Failed to save rating", error: err.message });
    }
};

// Feedback rollup for an Expert — used by the "Feedback & Ratings" screen
// to include chat ratings alongside recipe ratings.
exports.getMyChatFeedback = async (req, res) => {
    try {
        const expertId = req.user?.id;
        if (!expertId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [rows] = await db.query(`
            SELECT
                COUNT(*) AS totalRatings,
                COALESCE(AVG(r.rating), 0) AS avgRating,
                COUNT(CASE WHEN r.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN 1 END) AS ratingsThisMonth
            FROM chat_ratings r
            JOIN chat_conversations c ON c.id = r.conversation_id
            WHERE c.expert_id = ?
        `, [expertId]);

        res.json(rows[0]);
    } catch (err) {
        console.error("getMyChatFeedback error:", err);
        res.status(500).json({ message: "Failed to fetch chat feedback", error: err.message });
    }
};

// Exposed so the Socket.IO handler (server.js) can persist messages using
// the exact same logic as a REST endpoint would, without importing a route.
exports.persistMessage = async (conversationId, senderId, content) => {
    const [result] = await db.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
        [conversationId, senderId, content]
    );
    await db.query(
        `UPDATE chat_conversations SET last_message = ?, last_message_at = NOW() WHERE id = ?`,
        [content, conversationId]
    );
    return result.insertId;
};

exports.assertParticipant = assertParticipant;
