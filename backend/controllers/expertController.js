// @ts-nocheck
const db = require("../db");

/**
 * GET /api/experts
 * List all verified experts with follower count, recipe count, article count, and isFollowing status.
 */
exports.getExperts = async (req, res) => {
    try {
        const currentUserId = req.user ? req.user.id : null;

        const [rows] = await db.query(
            `SELECT
                u.id,
                u.full_name AS fullName,
                u.email,
                u.avatar,
                ep.information,
                ep.certificate,
                ep.specialization,
                ep.experience_year AS experienceYear,
                ep.is_verified AS isVerified,
                (SELECT COUNT(*) FROM expert_followers ef WHERE ef.expert_id = u.id) AS followerCount,
                (SELECT COUNT(*) FROM recipes r WHERE r.expert_id = u.id) AS recipeCount,
                (SELECT COUNT(*) FROM articles a WHERE a.expert_id = u.id) AS articleCount
             FROM users u
             JOIN expert_profiles ep ON u.id = ep.expert_id
             WHERE u.role_id = 2 AND ep.is_verified = TRUE
             ORDER BY followerCount DESC, u.full_name ASC`
        );

        let followedSet = new Set();
        if (currentUserId) {
            const [followed] = await db.query(
                `SELECT expert_id FROM expert_followers WHERE user_id = ?`,
                [currentUserId]
            );
            followedSet = new Set(followed.map((f) => f.expert_id));
        }

        const experts = rows.map((r) => ({
            ...r,
            isFollowing: followedSet.has(r.id),
        }));

        return res.json({ experts });
    } catch (err) {
        console.error("GET EXPERTS ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * GET /api/experts/:id
 * Get single expert profile details + their recipes and articles.
 */
exports.getExpertById = async (req, res) => {
    try {
        const expertId = Number(req.params.id);
        const currentUserId = req.user ? req.user.id : null;

        const [users] = await db.query(
            `SELECT
                u.id,
                u.full_name AS fullName,
                u.email,
                u.avatar,
                ep.information,
                ep.certificate,
                ep.specialization,
                ep.experience_year AS experienceYear,
                ep.is_verified AS isVerified,
                (SELECT COUNT(*) FROM expert_followers ef WHERE ef.expert_id = u.id) AS followerCount
             FROM users u
             JOIN expert_profiles ep ON u.id = ep.expert_id
             WHERE u.id = ?`,
            [expertId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Expert not found." });
        }

        const expert = users[0];

        let isFollowing = false;
        if (currentUserId) {
            const [fol] = await db.query(
                `SELECT 1 FROM expert_followers WHERE expert_id = ? AND user_id = ?`,
                [expertId, currentUserId]
            );
            isFollowing = fol.length > 0;
        }

        // Fetch recipes by this expert
        const [recipes] = await db.query(
            `SELECT id, name, description, image_url, cooking_time, month_age, calories FROM recipes WHERE expert_id = ? ORDER BY id DESC`,
            [expertId]
        );

        // Fetch articles by this expert
        const [articles] = await db.query(
            `SELECT id, title, summary, image_url, published_date FROM articles WHERE expert_id = ? ORDER BY id DESC`,
            [expertId]
        );

        return res.json({
            expert: {
                ...expert,
                isFollowing,
                recipes,
                articles,
            },
        });
    } catch (err) {
        console.error("GET EXPERT BY ID ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * POST /api/experts/:id/follow
 * Toggle follow / unfollow expert.
 */
exports.toggleFollowExpert = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in to follow experts." });
        }

        const expertId = Number(req.params.id);
        const userId = req.user.id;

        if (expertId === userId) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        const [existing] = await db.query(
            `SELECT 1 FROM expert_followers WHERE expert_id = ? AND user_id = ?`,
            [expertId, userId]
        );

        let isFollowing = false;

        if (existing.length > 0) {
            // Unfollow
            await db.query(
                `DELETE FROM expert_followers WHERE expert_id = ? AND user_id = ?`,
                [expertId, userId]
            );
            isFollowing = false;
        } else {
            // Follow
            await db.query(
                `INSERT INTO expert_followers (expert_id, user_id) VALUES (?, ?)`,
                [expertId, userId]
            );
            isFollowing = true;
        }

        // Get updated follower count
        const [[{ followerCount }]] = await db.query(
            `SELECT COUNT(*) AS followerCount FROM expert_followers WHERE expert_id = ?`,
            [expertId]
        );

        return res.json({
            message: isFollowing ? "Followed expert successfully." : "Unfollowed expert successfully.",
            isFollowing,
            followerCount,
        });
    } catch (err) {
        console.error("TOGGLE FOLLOW EXPERT ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * PUT /api/experts/profile
 * Allows logged in Expert to update their own profile details.
 */
exports.updateMyExpertProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const role = (req.user.role || "").toLowerCase();
        if (role !== "expert" && role !== "admin") {
            return res.status(403).json({ message: "Forbidden. Only Experts can update expert profiles." });
        }

        const expertId = req.user.id;
        const { fullName, information, certificate, specialization, experienceYear } = req.body;

        if (fullName && fullName.trim()) {
            await db.query("UPDATE users SET full_name = ? WHERE id = ?", [fullName.trim(), expertId]);
        }

        await db.query(
            `INSERT INTO expert_profiles (expert_id, information, certificate, specialization, experience_year, is_verified)
             VALUES (?, ?, ?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE
                information = COALESCE(?, information),
                certificate = COALESCE(?, certificate),
                specialization = COALESCE(?, specialization),
                experience_year = COALESCE(?, experience_year)`,
            [
                expertId,
                information || "",
                certificate || "",
                specialization || "",
                Number(experienceYear || 0),
                information,
                certificate,
                specialization,
                experienceYear !== undefined ? Number(experienceYear) : null
            ]
        );

        return res.json({ message: "Expert profile updated successfully." });
    } catch (err) {
        console.error("UPDATE EXPERT PROFILE ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};
