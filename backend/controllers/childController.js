// @ts-nocheck
const db = require("../db");

function splitTags(value) {
    return value ? value.split(",") : [];
}

// The mobile app sends either a plain 'YYYY-MM-DD' (QuestionnaireScreen) or
// a full ISO datetime via Date.toISOString() (Add/EditBabyProfileScreen).
// MySQL's DATE column only accepts the former, so always normalize.
function toDateOnly(value) {
    if (!value) {
        return null;
    }

    return String(value).slice(0, 10);
}

// Matches the mobile app's invitation-code regex (^BN-[A-Z0-9]{6}$) so a
// profile_code can double as a readable ID without touching client code.
function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";

    for (let i = 0; i < 6; i++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
    }

    return `BN-${suffix}`;
}

function toResponseShape(row) {
    return {
        id: row.id,
        name: row.name,
        dateOfBirth: row.dateOfBirth,
        gender: row.gender,
        weight: row.weight,
        weightUnit: row.weightUnit,
        height: row.height,
        heightUnit: row.heightUnit,
        imageUrl: row.imageUrl,
        profileColor: row.profileColor,
        nutritionGoal: row.nutritionGoal,
        profileCode: row.profileCode,
        permission: row.permission,
        allergies: splitTags(row.allergies),
        foodPreferences: splitTags(row.foodPreferences),
    };
}

// `permission` only makes sense when the query is scoped to one caregiver
// (see WHERE cc.user_id = ? below) — a child can have several caregiver
// rows, so joining it unscoped would multiply/ambiguous the result.
const SELECT_CHILDREN = `
    SELECT
        cp.id,
        cp.name,
        cp.date_of_birth AS dateOfBirth,
        cp.gender,
        cp.weight,
        cp.weight_unit AS weightUnit,
        cp.height,
        cp.height_unit AS heightUnit,
        cp.image_url AS imageUrl,
        cp.profile_color AS profileColor,
        cp.nutrition_goal AS nutritionGoal,
        cp.profile_code AS profileCode,
        cc.permission AS permission,
        GROUP_CONCAT(DISTINCT ka.allergy_name) AS allergies,
        GROUP_CONCAT(DISTINCT fp.food_name) AS foodPreferences
    FROM child_profiles cp
    JOIN child_caregivers cc ON cc.child_id = cp.id
    LEFT JOIN child_known_allergies ka ON ka.child_id = cp.id
    LEFT JOIN child_food_preferences fp ON fp.child_id = cp.id
`;

async function insertTags(table, column, childId, values) {
    if (!Array.isArray(values) || values.length === 0) {
        return;
    }

    const rows = values.map((value) => [childId, value]);

    await db.query(
        `INSERT INTO ${table} (child_id, ${column}) VALUES ?`,
        [rows]
    );
}

// Returns the caller's permission on a child ('owner' | 'editor'), or null
// if they aren't a caregiver of that child at all.
async function getPermission(childId, userId) {
    const [rows] = await db.query(
        `SELECT permission FROM child_caregivers WHERE child_id = ? AND user_id = ?`,
        [childId, userId]
    );

    return rows.length > 0 ? rows[0].permission : null;
}

// ==========================================
// GET /api/children — every baby profile the
// logged-in user has caregiver access to
// (as owner OR as an invited editor)
// ==========================================
exports.getChildren = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query(
            `${SELECT_CHILDREN} WHERE cc.user_id = ? GROUP BY cp.id, cc.permission ORDER BY cp.id ASC`,
            [userId]
        );

        return res.json(rows.map(toResponseShape));
    } catch (err) {
        console.error("getChildren error:", err);
        return res.status(500).json({
            message: "Failed to fetch baby profiles",
        });
    }
};

// ==========================================
// GET /api/children/:id — single baby profile
// ==========================================
exports.getChildById = async (req, res) => {
    try {
        const parentId = req.user.id;

        const [rows] = await db.query(
            `${SELECT_CHILDREN} WHERE cp.id = ? AND cc.user_id = ? GROUP BY cp.id, cc.permission`,
            [req.params.id, parentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Baby profile not found.",
            });
        }

        return res.json(toResponseShape(rows[0]));
    } catch (err) {
        console.error("getChildById error:", err);
        return res.status(500).json({
            message: "Failed to fetch baby profile",
        });
    }
};

function validateChildAge(dateOfBirth) {
    if (!dateOfBirth) return true;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return true;
    const today = new Date();
    let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (today.getDate() < dob.getDate()) {
        months -= 1;
    }
    return months >= 0 && months <= 60;
}

// ==========================================
// POST /api/children — create a baby profile;
// the creator becomes its owner caregiver
// ==========================================
exports.createChild = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            dateOfBirth,
            gender,
            weight,
            weightUnit,
            height,
            heightUnit,
            imageUrl,
            profileColor,
            nutritionGoal,
            allergies,
            foodPreferences,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Baby name is required.",
            });
        }

        if (dateOfBirth && !validateChildAge(dateOfBirth)) {
            return res.status(400).json({
                message: "BabyNutri is designed for children up to 5 years old (60 months). Please select a valid date of birth within 5 years.",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO child_profiles
                (parent_id, name, date_of_birth, gender, weight, weight_unit,
                 height, height_unit, image_url, profile_color, nutrition_goal,
                 profile_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                name.trim(),
                toDateOnly(dateOfBirth),
                gender || null,
                weight || null,
                weightUnit || "kg",
                height || null,
                heightUnit || "cm",
                imageUrl || null,
                profileColor || null,
                nutritionGoal || null,
                generateCode(),
            ]
        );

        const childId = result.insertId;

        await db.query(
            `INSERT INTO child_caregivers (child_id, user_id, permission) VALUES (?, ?, 'owner')`,
            [childId, userId]
        );

        await insertTags(
            "child_known_allergies",
            "allergy_name",
            childId,
            allergies
        );
        await insertTags(
            "child_food_preferences",
            "food_name",
            childId,
            foodPreferences
        );

        const [rows] = await db.query(
            `${SELECT_CHILDREN} WHERE cp.id = ? AND cc.user_id = ? GROUP BY cp.id, cc.permission`,
            [childId, userId]
        );

        return res.status(201).json(toResponseShape(rows[0]));
    } catch (err) {
        console.error("createChild error:", err);
        return res.status(500).json({
            message: "Failed to create baby profile",
        });
    }
};

// ==========================================
// PUT /api/children/:id — update a baby profile;
// owner or editor caregivers may do this
// ==========================================
exports.updateChild = async (req, res) => {
    try {
        const userId = req.user.id;
        const childId = req.params.id;

        const permission = await getPermission(childId, userId);

        if (!permission) {
            return res.status(404).json({
                message: "Baby profile not found.",
            });
        }

        const {
            name,
            dateOfBirth,
            gender,
            weight,
            weightUnit,
            height,
            heightUnit,
            imageUrl,
            profileColor,
            nutritionGoal,
            allergies,
            foodPreferences,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Baby name is required.",
            });
        }

        if (dateOfBirth && !validateChildAge(dateOfBirth)) {
            return res.status(400).json({
                message: "BabyNutri is designed for children up to 5 years old (60 months). Please select a valid date of birth within 5 years.",
            });
        }

        await db.query(
            `
            UPDATE child_profiles
            SET
                name = ?,
                date_of_birth = ?,
                gender = ?,
                weight = ?,
                weight_unit = ?,
                height = ?,
                height_unit = ?,
                image_url = ?,
                profile_color = ?,
                nutrition_goal = ?
            WHERE id = ?
            `,
            [
                name.trim(),
                toDateOnly(dateOfBirth),
                gender || null,
                weight || null,
                weightUnit || "kg",
                height || null,
                heightUnit || "cm",
                imageUrl || null,
                profileColor || null,
                nutritionGoal || null,
                childId,
            ]
        );

        await db.query(
            `DELETE FROM child_known_allergies WHERE child_id = ?`,
            [childId]
        );
        await insertTags(
            "child_known_allergies",
            "allergy_name",
            childId,
            allergies
        );

        await db.query(
            `DELETE FROM child_food_preferences WHERE child_id = ?`,
            [childId]
        );
        await insertTags(
            "child_food_preferences",
            "food_name",
            childId,
            foodPreferences
        );

        const [rows] = await db.query(
            `${SELECT_CHILDREN} WHERE cp.id = ? AND cc.user_id = ? GROUP BY cp.id, cc.permission`,
            [childId, userId]
        );

        return res.json(toResponseShape(rows[0]));
    } catch (err) {
        console.error("updateChild error:", err);
        return res.status(500).json({
            message: "Failed to update baby profile",
        });
    }
};

// ==========================================
// DELETE /api/children/:id — only the owner
// caregiver may delete a baby profile
// ==========================================
exports.deleteChild = async (req, res) => {
    try {
        const userId = req.user.id;
        const childId = req.params.id;

        const permission = await getPermission(childId, userId);

        if (!permission) {
            return res.status(404).json({
                message: "Baby profile not found.",
            });
        }

        if (permission !== "owner") {
            return res.status(403).json({
                message: "Only the owner can delete this baby profile.",
            });
        }

        await db.query(`DELETE FROM child_profiles WHERE id = ?`, [
            childId,
        ]);

        return res.json({
            message: "Baby profile deleted.",
        });
    } catch (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message:
                    "This baby profile still has related data (e.g. meal plans) and can't be deleted yet.",
            });
        }

        console.error("deleteChild error:", err);
        return res.status(500).json({
            message: "Failed to delete baby profile",
        });
    }
};
