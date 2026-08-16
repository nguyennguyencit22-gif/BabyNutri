// @ts-nocheck
const db = require("../db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

/**
 * Helper middleware / check to ensure request user is an Admin
 */
function checkIsAdmin(req, res) {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized. Please log in." });
        return false;
    }
    const role = (req.user.role || "").toLowerCase();
    if (role !== "admin") {
        res.status(403).json({ message: "Forbidden. Admin access required." });
        return false;
    }
    return true;
}

/**
 * POST /api/admin/experts
 * Admin creates a new Expert or promotes an existing user to Expert
 */
exports.createOrPromoteExpert = async (req, res) => {
    if (!checkIsAdmin(req, res)) return;

    const connection = await db.getConnection();
    try {
        const {
            email,
            fullName,
            password,
            information,
            certificate,
            specialization,
            experienceYear
        } = req.body;

        const cleanEmail = email?.trim().toLowerCase();
        const cleanName = fullName?.trim();

        if (!cleanEmail) {
            return res.status(400).json({ message: "Email is required." });
        }
        if (!cleanName) {
            return res.status(400).json({ message: "Full name is required." });
        }

        await connection.beginTransaction();

        // Check if user exists
        const [existing] = await connection.query(
            "SELECT id, role_id FROM users WHERE email = ?",
            [cleanEmail]
        );

        let userId;

        let generatedPassword = null;

        if (existing.length > 0) {
            userId = existing[0].id;
            // Update role_id to 2 (Expert). Existing password is left untouched.
            await connection.query(
                "UPDATE users SET role_id = 2, full_name = ? WHERE id = ?",
                [cleanName, userId]
            );
        } else {
            // Create new user with role_id = 2 (Expert). If no password was
            // supplied, generate a random one rather than falling back to a
            // guessable default -- this account is reachable via the plain
            // /auth/login endpoint, not just Google Sign-In.
            generatedPassword = password || crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "x");
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);
            const [insertRes] = await connection.query(
                `INSERT INTO users (full_name, email, password, role_id, avatar)
                 VALUES (?, ?, ?, 2, 'https://i.pravatar.cc/200?img=60')`,
                [cleanName, cleanEmail, hashedPassword]
            );
            userId = insertRes.insertId;
        }

        // Upsert expert profile
        const info = information || "Pediatric Nutrition Specialist";
        const cert = certificate || "Certified Nutritionist";
        const spec = specialization || "Child Nutrition";
        const expYears = Number(experienceYear || 5);

        await connection.query(
            `INSERT INTO expert_profiles (expert_id, information, certificate, specialization, experience_year, is_verified)
             VALUES (?, ?, ?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE
                information = VALUES(information),
                certificate = VALUES(certificate),
                specialization = VALUES(specialization),
                experience_year = VALUES(experience_year),
                is_verified = TRUE`,
            [userId, info, cert, spec, expYears]
        );

        await connection.commit();

        return res.status(201).json({
            message: generatedPassword
                ? "Expert account created. Share the temporary password with them securely -- it will not be shown again."
                : "Existing account promoted to Expert.",
            expert: {
                id: userId,
                fullName: cleanName,
                email: cleanEmail,
                role: "Expert",
                information: info,
                certificate: cert,
                specialization: spec,
                experienceYear: expYears,
                temporaryPassword: generatedPassword || undefined
            }
        });
    } catch (err) {
        await connection.rollback();
        console.error("ADMIN CREATE EXPERT ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/admin/experts
 * Admin lists all Expert users
 */
exports.getExperts = async (req, res) => {
    if (!checkIsAdmin(req, res)) return;

    try {
        const [rows] = await db.query(
            `SELECT
                u.id,
                u.full_name AS fullName,
                u.email,
                u.avatar,
                u.created_at AS createdAt,
                ep.information,
                ep.certificate,
                ep.specialization,
                ep.experience_year AS experienceYear,
                ep.is_verified AS isVerified
             FROM users u
             LEFT JOIN expert_profiles ep ON u.id = ep.expert_id
             WHERE u.role_id = 2
             ORDER BY u.id DESC`
        );

        return res.json({ experts: rows });
    } catch (err) {
        console.error("ADMIN GET EXPERTS ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * GET /api/admin/reports
 * Returns system-wide statistics & reports for Admin
 */
exports.getReports = async (req, res) => {
    if (!checkIsAdmin(req, res)) return;

    try {
        const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
        const [[{ totalParents }]] = await db.query("SELECT COUNT(*) AS totalParents FROM users WHERE role_id = 3");
        const [[{ totalExperts }]] = await db.query("SELECT COUNT(*) AS totalExperts FROM users WHERE role_id = 2");
        const [[{ totalRecipes }]] = await db.query("SELECT COUNT(*) AS totalRecipes FROM recipes");
        const [[{ totalArticles }]] = await db.query("SELECT COUNT(*) AS totalArticles FROM articles");
        const [[{ totalQuestions }]] = await db.query("SELECT COUNT(*) AS totalQuestions FROM questions");
        const [[{ totalAnswered }]] = await db.query("SELECT COUNT(*) AS totalAnswered FROM questions WHERE status = 'Answered'");
        const [[{ totalFollowers }]] = await db.query("SELECT COUNT(*) AS totalFollowers FROM expert_followers");

        return res.json({
            reports: {
                totalUsers,
                totalParents,
                totalExperts,
                totalRecipes,
                totalArticles,
                totalQuestions,
                totalAnswered,
                totalFollowers,
            }
        });
    } catch (err) {
        console.error("ADMIN GET REPORTS ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * DELETE /api/admin/experts/:id
 * Demotes an Expert back to Parent role
 */
exports.demoteExpert = async (req, res) => {
    if (!checkIsAdmin(req, res)) return;

    try {
        const expertId = Number(req.params.id);
        if (!expertId) {
            return res.status(400).json({ message: "Invalid expert ID." });
        }

        // Change role_id to 3 (Parent)
        await db.query("UPDATE users SET role_id = 3 WHERE id = ?", [expertId]);

        return res.json({ message: "Expert demoted to Parent successfully." });
    } catch (err) {
        console.error("ADMIN DEMOTE EXPERT ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};
