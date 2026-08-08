
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
        allergies: splitTags(row.allergies),
        foodPreferences: splitTags(row.foodPreferences),
    };
}

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
        GROUP_CONCAT(DISTINCT ka.allergy_name) AS allergies,
        GROUP_CONCAT(DISTINCT fp.food_name) AS foodPreferences
    FROM child_profiles cp
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

// ==========================================
// GET /api/children — every baby profile that
// belongs to the logged-in parent
// ==========================================
exports.getChildren = async (req, res) => {
    try {
        const parentId = req.user.id;

        const [rows] = await db.query(
            `${SELECT_CHILDREN} WHERE cp.parent_id = ? GROUP BY cp.id ORDER BY cp.id ASC`,
            [parentId]
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
            `${SELECT_CHILDREN} WHERE cp.id = ? AND cp.parent_id = ? GROUP BY cp.id`,
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

// ==========================================
// POST /api/children — create a baby profile
// owned by the logged-in parent
// ==========================================
exports.createChild = async (req, res) => {
    try {
        const parentId = req.user.id;
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

        const [result] = await db.query(
            `
            INSERT INTO child_profiles
                (parent_id, name, date_of_birth, gender, weight, weight_unit,
                 height, height_unit, image_url, profile_color, nutrition_goal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                parentId,
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
            ]
        );

        const childId = result.insertId;

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
            `${SELECT_CHILDREN} WHERE cp.id = ? GROUP BY cp.id`,
            [childId]
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
// PUT /api/children/:id — update a baby profile,
// only if it belongs to the logged-in parent
// ==========================================
exports.updateChild = async (req, res) => {
    try {
        const parentId = req.user.id;
        const childId = req.params.id;

        const [owned] = await db.query(
            `SELECT id FROM child_profiles WHERE id = ? AND parent_id = ?`,
            [childId, parentId]
        );

        if (owned.length === 0) {
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
            `${SELECT_CHILDREN} WHERE cp.id = ? GROUP BY cp.id`,
            [childId]
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
// DELETE /api/children/:id — only if it belongs
// to the logged-in parent
// ==========================================
exports.deleteChild = async (req, res) => {
    try {
        const parentId = req.user.id;
        const childId = req.params.id;

        const [owned] = await db.query(
            `SELECT id FROM child_profiles WHERE id = ? AND parent_id = ?`,
            [childId, parentId]
        );

        if (owned.length === 0) {
            return res.status(404).json({
                message: "Baby profile not found.",
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
