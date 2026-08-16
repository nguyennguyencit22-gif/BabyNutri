// @ts-nocheck
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const firebaseAdmin = require("../config/firebaseAdmin");

/**
 * LOGIN
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            `
          SELECT
    u.*,
    r.name AS role
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = ?
            `,
            [email],
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Email not found",
            });
        }

        const user = users[0];

        let isMatch = false;

        if (user.password && user.password.startsWith("$2")) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = password === user.password;
        }

        if (!isMatch) {
            return res.status(401).json({
                message: "Wrong password",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );

        return res.json({
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                avatar: user.avatar || null,
                role: user.role,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

/**
 * REGISTER
 */
exports.register = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { parent, children = [] } = req.body;

        // ======================
        // VALIDATION
        // ======================

        if (!parent) {
            return res.status(400).json({
                message: "Parent data required",
            });
        }

        const fullName = parent.fullName?.trim();
        const email = parent.email?.trim().toLowerCase();
        const password = parent.password;

        if (!fullName) {
            return res.status(400).json({
                message: "Full name is required",
            });
        }

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        if (!password) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        await connection.beginTransaction();

        // ======================
        // CHECK EMAIL
        // ======================

        const [exist] = await connection.query(
            `
            SELECT id
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        if (exist.length > 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Email already exists",
            });
        }

        // ======================
        // CREATE USER
        // ======================

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const [userResult] =
            await connection.query(
                `
            INSERT INTO users
(
    full_name,
    email,
    password,
    role_id,
    avatar
)
VALUES (?, ?, ?, ?, ?)
                `,
                [
                    fullName,
                    parent.email,
                    hashedPassword,
                    3,
                    parent.avatar || null
                ]
            );

        const userId = userResult.insertId;

        // ======================
        // CREATE CHILDREN
        // ======================

        for (const child of children) {

            const [childResult] =
                await connection.query(
                    `
                    INSERT INTO child_profiles
                    (
                        parent_id,
                        name,
                        date_of_birth,
                        weight,
                        height,
                        gender,
                        image_url
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?, ?
                    )
                    `,
                    [
                        userId,
                        child.name || null,
                        child.dob || null,
                        child.weight
                            ? Number(child.weight)
                            : null,
                        child.height
                            ? Number(child.height)
                            : null,
                        child.gender || null,
                        child.image_url || null,
                    ]
                );

            const childId =
                childResult.insertId;

            // ======================
            // SAVE ALLERGIES
            // ======================

            if (
                Array.isArray(
                    child.allergies
                ) &&
                child.allergies.length > 0
            ) {
                for (const allergyId of child.allergies) {

                    await connection.query(
                        `
                        INSERT INTO child_allergies
                        (
                            child_id,
                            allergy_id
                        )
                        VALUES (?, ?)
                        `,
                        [
                            childId,
                            allergyId
                        ]
                    );
                }
            }
        }

        await connection.commit();

        const user = {
            id: userId,
            full_name: fullName,
            email,
            role: "Parent",
        };

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(201).json({
            message:
                "Account created successfully",
            token,
            user,
        });

    } catch (err) {

        try {
            await connection.rollback();
        } catch { }

        console.error(
            "REGISTER ERROR:",
            err
        );

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });

    } finally {

        connection.release();

    }
};

/**
 * FIREBASE LOGIN
 * Verifies a Firebase ID token (via firebaseAuthMiddleware) and finds/creates
 * the matching MySQL user. Role is NEVER taken from the client — a brand
 * new account always gets Parent; Expert/Admin only ever come from a row
 * that already existed in the database (assigned by an admin).
 */
exports.firebaseLogin = async (req, res) => {
    try {
        const { uid, email, name } = req.firebaseUser;

        if (!email) {
            return res.status(400).json({
                message: "Firebase account has no email.",
            });
        }

        const [existing] = await db.query(
            `
            SELECT
                u.*,
                r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.firebase_uid = ? OR u.email = ?
            `,
            [uid, email]
        );

        let user;

        if (existing.length > 0) {
            user = existing[0];

            if (!user.firebase_uid) {
                await db.query(
                    `UPDATE users SET firebase_uid = ? WHERE id = ?`,
                    [uid, user.id]
                );
            }
        } else {
            const [insertResult] = await db.query(
                `
                INSERT INTO users
                    (full_name, email, password, role_id, firebase_uid)
                VALUES (?, ?, NULL, 3, ?)
                `,
                [name || email.split("@")[0], email, uid]
            );

            user = {
                id: insertResult.insertId,
                full_name: name || email.split("@")[0],
                email,
                avatar: null,
                role: "Parent",
            };
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                avatar: user.avatar || null,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("FIREBASE LOGIN ERROR:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};


/**
 * DELETE MY ACCOUNT — permanently deletes the authenticated user's account
 * and every piece of data tied to it. Irreversible.
 *
 * Deletes are issued explicitly in dependency order rather than relying on
 * the schema's ON DELETE CASCADE, since this project's live database has
 * repeatedly drifted from the tracked seed script this session (missing
 * columns/tables found and patched several times) — safer not to trust
 * cascade behavior for a destructive, unrecoverable operation.
 */
exports.deleteMyAccount = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }

    const connection = await db.getConnection();
    try {
        const [userRows] = await connection.query(
            `SELECT id, firebase_uid FROM users WHERE id = ?`,
            [userId]
        );
        if (!userRows.length) {
            connection.release();
            return res.status(404).json({ message: "Account not found" });
        }
        const firebaseUid = userRows[0].firebase_uid;

        await connection.beginTransaction();

        const [childRows] = await connection.query(
            `SELECT id FROM child_profiles WHERE parent_id = ?`,
            [userId]
        );
        const childIds = childRows.map((c) => c.id);

        if (childIds.length > 0) {
            await connection.query(`DELETE FROM child_growth_records WHERE child_id IN (?)`, [childIds]);
            await connection.query(`DELETE FROM child_allergies WHERE child_id IN (?)`, [childIds]);
            await connection.query(`DELETE FROM child_food_preferences WHERE child_id IN (?)`, [childIds]);
            await connection.query(`DELETE FROM child_known_allergies WHERE child_id IN (?)`, [childIds]);
            await connection.query(`DELETE FROM child_invitation_codes WHERE child_id IN (?)`, [childIds]);
            await connection.query(`DELETE FROM child_caregivers WHERE child_id IN (?)`, [childIds]);
        }

        const [mealPlanByParentRows] = await connection.query(
            `SELECT id FROM meal_plans WHERE parent_id = ?`,
            [userId]
        );
        let mealPlanByChildRows = [];
        if (childIds.length > 0) {
            [mealPlanByChildRows] = await connection.query(
                `SELECT id FROM meal_plans WHERE child_id IN (?)`,
                [childIds]
            );
        }
        const mealPlanIds = [...new Set([...mealPlanByParentRows, ...mealPlanByChildRows].map((m) => m.id))];
        if (mealPlanIds.length > 0) {
            await connection.query(`DELETE FROM meal_plan_items WHERE meal_plan_id IN (?)`, [mealPlanIds]);
        }
        await connection.query(`DELETE FROM meal_plans WHERE parent_id = ?`, [userId]);

        if (childIds.length > 0) {
            await connection.query(`DELETE FROM child_profiles WHERE id IN (?)`, [childIds]);
        }

        // This user as a caregiver on someone else's child.
        await connection.query(`DELETE FROM child_caregivers WHERE user_id = ?`, [userId]);
        // Invitation codes for children this user doesn't own (created or redeemed by them).
        await connection.query(`UPDATE child_invitation_codes SET created_by = NULL WHERE created_by = ?`, [userId]);
        await connection.query(`UPDATE child_invitation_codes SET used_by = NULL WHERE used_by = ?`, [userId]);

        await connection.query(`DELETE FROM favorite_recipes WHERE user_id = ?`, [userId]);
        await connection.query(`DELETE FROM recipe_ratings WHERE user_id = ?`, [userId]);
        await connection.query(`DELETE FROM recipe_comments WHERE user_id = ?`, [userId]);
        await connection.query(`DELETE FROM user_recipe_history WHERE user_id = ?`, [userId]);
        await connection.query(`DELETE FROM notifications WHERE user_id = ?`, [userId]);
        await connection.query(`DELETE FROM measurement_settings WHERE user_id = ?`, [userId]);

        const [convoRows] = await connection.query(
            `SELECT id FROM chat_conversations WHERE parent_id = ? OR expert_id = ?`,
            [userId, userId]
        );
        const convoIds = convoRows.map((c) => c.id);
        if (convoIds.length > 0) {
            await connection.query(`DELETE FROM chat_ratings WHERE conversation_id IN (?)`, [convoIds]);
            await connection.query(`DELETE FROM chat_messages WHERE conversation_id IN (?)`, [convoIds]);
            await connection.query(`DELETE FROM chat_conversations WHERE id IN (?)`, [convoIds]);
        }

        const [questionRows] = await connection.query(
            `SELECT id FROM questions WHERE parent_id = ?`,
            [userId]
        );
        const questionIds = questionRows.map((q) => q.id);
        if (questionIds.length > 0) {
            await connection.query(`DELETE FROM answers WHERE question_id IN (?)`, [questionIds]);
        }
        await connection.query(`DELETE FROM answers WHERE expert_id = ?`, [userId]);
        await connection.query(`DELETE FROM questions WHERE parent_id = ? OR expert_id = ?`, [userId, userId]);

        // Content this user authored (as an Expert) stays, just loses attribution.
        await connection.query(`UPDATE recipes SET expert_id = NULL WHERE expert_id = ?`, [userId]);
        await connection.query(`UPDATE articles SET expert_id = NULL WHERE expert_id = ?`, [userId]);
        await connection.query(`DELETE FROM expert_profiles WHERE expert_id = ?`, [userId]);

        await connection.query(`DELETE FROM users WHERE id = ?`, [userId]);

        await connection.commit();

        if (firebaseUid && firebaseAdmin.isReady()) {
            try {
                await firebaseAdmin.deleteUser(firebaseUid);
            } catch (firebaseErr) {
                console.error("Delete Firebase user error (MySQL data already deleted):", firebaseErr);
            }
        }

        res.json({ message: "Account and all associated data deleted" });
    } catch (err) {
        try { await connection.rollback(); } catch {}
        console.error("deleteMyAccount error:", err);
        res.status(500).json({ message: "Failed to delete account", error: err.message });
    } finally {
        connection.release();
    }
};
