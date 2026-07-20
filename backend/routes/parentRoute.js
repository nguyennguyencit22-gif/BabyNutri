const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const db = require("../db"); // ✅ FIX IMPORTANT

const { getDashboard } = require("../controllers/parentController");

// ================= DASHBOARD =================
router.get("/dashboard", auth, getDashboard);

// ================= UPDATE PARENT AVATAR =================
router.put("/avatar", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                message: "Avatar is required",
            });
        }

        await db.query(
            "UPDATE users SET avatar = ? WHERE id = ?",
            [avatar, userId]
        );

        return res.json({
            message: "Parent avatar updated",
        });

    } catch (err) {
        console.error("UPDATE PARENT AVATAR ERROR:", err);
        return res.status(500).json({
            message: err.message,
        });
    }
});

// ================= UPDATE BABY AVATAR =================
router.put("/baby/:id/avatar", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { avatar } = req.body;
        const userId = req.user.id;

        if (!avatar) {
            return res.status(400).json({
                message: "Avatar is required",
            });
        }

        // check ownership
        const [rows] = await db.query(
            `SELECT id FROM child_profiles 
             WHERE id = ? AND parent_id = ?`,
            [id, userId]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                message: "Forbidden - not your child",
            });
        }

        await db.query(
            `UPDATE child_profiles 
             SET image_url = ? 
             WHERE id = ?`,
            [avatar, id]
        );

        return res.json({
            message: "Baby avatar updated",
        });

    } catch (err) {
        console.error("UPDATE BABY AVATAR ERROR:", err);
        return res.status(500).json({
            message: err.message,
        });
    }
});

module.exports = router;