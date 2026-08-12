// @ts-nocheck
const db = require("../db");

/**
 * Helper to dispatch notification to multiple users
 */
async function sendNotificationToUsers(userIds, title, message, type = "general", refId = null) {
    if (!Array.isArray(userIds) || userIds.length === 0) return;
    try {
        const values = userIds.map((uid) => [uid, title, message, type, refId]);
        await db.query(
            `INSERT INTO notifications (user_id, title, message, type, ref_id) VALUES ?`,
            [values]
        );
    } catch (err) {
        console.error("DISPATCH NOTIFICATION ERROR:", err);
    }
}

/**
 * GET /api/notifications
 * Get logged in user's notifications.
 */
exports.getNotifications = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const userId = req.user.id;

        const [rows] = await db.query(
            `SELECT id, title, message, is_read AS isRead, type, ref_id AS refId, created_at AS createdAt
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId]
        );

        return res.json({ notifications: rows });
    } catch (err) {
        console.error("GET NOTIFICATIONS ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications.
 */
exports.getUnreadCount = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ unreadCount: 0 });
        }

        const [[{ count }]] = await db.query(
            `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
            [req.user.id]
        );

        return res.json({ unreadCount: count });
    } catch (err) {
        console.error("GET UNREAD COUNT ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for logged in user.
 */
exports.markAllRead = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
            [req.user.id]
        );

        return res.json({ message: "All notifications marked as read." });
    } catch (err) {
        console.error("MARK ALL READ ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports.sendNotificationToUsers = sendNotificationToUsers;
