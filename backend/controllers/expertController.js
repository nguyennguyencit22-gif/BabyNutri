// @ts-nocheck
const db = require("../db");

// ==========================================
// MY EXPERT PROFILE (professional info card)
// ==========================================
exports.getMyProfile = async (req, res) => {
    try {
        const expertId = req.user?.id;
        if (!expertId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [rows] = await db.query(`
            SELECT
                u.id, u.full_name AS fullName, u.email, u.avatar,
                ep.information, ep.certificate, ep.specialization, ep.experience_year AS experienceYear, ep.is_verified AS isVerified
            FROM users u
            LEFT JOIN expert_profiles ep ON ep.expert_id = u.id
            WHERE u.id = ?
        `, [expertId]);

        if (!rows.length) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("getMyProfile error:", err);
        res.status(500).json({ message: "Failed to fetch profile", error: err.message });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const expertId = req.user?.id;
        if (!expertId) {
            return res.status(401).json({ message: "Login required" });
        }

        const { information, certificate, specialization, experienceYear } = req.body;

        const [existing] = await db.query(`SELECT expert_id FROM expert_profiles WHERE expert_id = ?`, [expertId]);

        if (existing.length > 0) {
            await db.query(
                `UPDATE expert_profiles SET
                    information = COALESCE(?, information),
                    certificate = COALESCE(?, certificate),
                    specialization = COALESCE(?, specialization),
                    experience_year = COALESCE(?, experience_year)
                 WHERE expert_id = ?`,
                [information, certificate, specialization, experienceYear, expertId]
            );
        } else {
            await db.query(
                `INSERT INTO expert_profiles (expert_id, information, certificate, specialization, experience_year)
                 VALUES (?, ?, ?, ?, ?)`,
                [expertId, information || null, certificate || null, specialization || null, experienceYear || null]
            );
        }

        res.json({ message: "Profile updated" });
    } catch (err) {
        console.error("updateMyProfile error:", err);
        res.status(500).json({ message: "Failed to update profile", error: err.message });
    }
};
