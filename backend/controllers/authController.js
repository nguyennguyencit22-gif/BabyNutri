// @ts-nocheck
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
            user,
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
