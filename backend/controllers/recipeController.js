const db = require("../db");

// ==========================================
// GET ALL RECIPES (LIST PAGE)
// ==========================================
exports.getRecipes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                r.*,
                mt.name AS mealType,
                u.full_name AS expertName
            FROM recipes r
            LEFT JOIN meal_types mt ON r.meal_type_id = mt.id
            LEFT JOIN users u ON r.expert_id = u.id
            ORDER BY r.id DESC
        `);

        res.json(rows);

    } catch (err) {
        console.error("getRecipes error:", err);
        res.status(500).json({
            message: "Failed to fetch recipes",
            error: err.message
        });
    }
};



// ==========================================
// GET RECIPE BY ID (FULL DETAIL)
// ==========================================
exports.getRecipeById = async (req, res) => {
    try {
        const id = req.params.id;

        // 1. MAIN RECIPE
        const [recipeRows] = await db.query(
            `
            SELECT 
                r.*,
                mt.name AS mealType,
                u.full_name AS expertName
            FROM recipes r
            LEFT JOIN meal_types mt ON r.meal_type_id = mt.id
            LEFT JOIN users u ON r.expert_id = u.id
            WHERE r.id = ?
            `,
            [id]
        );

        if (!recipeRows.length) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        const recipe = recipeRows[0];

        // ==========================================
        // 2. INGREDIENTS
        // ==========================================
        const [ingredientRows] = await db.query(`
            SELECT 
                i.name,
                ri.quantity
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = ?
        `, [id]);

        const ingredients = ingredientRows.map(
            (i) => `${i.quantity} ${i.name}`
        );

        // ==========================================
        // 3. STEPS (NEW TABLE)
        // ==========================================
        const [stepRows] = await db.query(`
            SELECT 
                step_number,
                description
            FROM recipe_steps
            WHERE recipe_id = ?
            ORDER BY step_number ASC
        `, [id]);

        const steps = stepRows.map(s => s.description);

        // ==========================================
        // 4. ALLERGIES (NEW RELATION)
        // ==========================================
        const [allergyRows] = await db.query(`
            SELECT 
                a.name
            FROM recipe_allergies ra
            JOIN allergies a ON ra.allergy_id = a.id
            WHERE ra.recipe_id = ?
        `, [id]);

        const allergies = allergyRows.map(a => a.name);

        // ==========================================
        // 5. ASSETS (stickers / images)
        // ==========================================
        const [assetRows] = await db.query(`
            SELECT 
                type,
                image_url
            FROM recipe_assets
            WHERE recipe_id = ?
        `, [id]);

        const stickers = assetRows
            .filter(a => a.type === "sticker")
            .map(a => a.image_url);

        const heroImages = assetRows
            .filter(a => a.type === "hero")
            .map(a => a.image_url);

        const gallery = assetRows
            .filter(a => a.type === "gallery")
            .map(a => a.image_url);

        // ==========================================
        // FINAL RESPONSE (FRONTEND FRIENDLY)
        // ==========================================
        res.json({
            ...recipe,
            ingredients,
            steps,
            allergies,
            assets: {
                stickers,
                heroImages,
                gallery
            }
        });

    } catch (err) {
        console.error("🔥 getRecipeById error:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};
exports.getRecipeComments = async (req, res) => {
    try {
        const recipeId = req.params.id;

        const [rows] = await db.query(`
    SELECT 
        rc.id,
        rc.content,
        u.full_name AS userName
    FROM recipe_comments rc
    JOIN users u ON rc.user_id = u.id
    WHERE rc.recipe_id = ?
    ORDER BY rc.id DESC
`, [recipeId]);

        res.json(rows);

    } catch (err) {
        console.error("getRecipeComments error:", err);
        res.status(500).json({
            message: "Failed to fetch comments",
            error: err.message
        });
    }
};

exports.getRecipeRatings = async (req, res) => {
    try {
        const recipeId = req.params.id;

        const [rows] = await db.query(`
            SELECT 
                r.id,
                r.rating,
                r.review,
                u.full_name AS userName
            FROM recipe_ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.recipe_id = ?
            ORDER BY r.id DESC
        `, [recipeId]);

        res.json(rows);

    } catch (err) {
        console.error("getRecipeRatings error:", err);
        res.status(500).json({
            message: "Failed to fetch ratings",
            error: err.message
        });
    }
};

exports.getRecipeRatingSummary = async (req, res) => {
    try {
        const recipeId = req.params.id;

        const [rows] = await db.query(`
            SELECT 
                COUNT(*) AS totalRatings,
                COALESCE(AVG(rating), 0) AS averageRating
            FROM recipe_ratings
            WHERE recipe_id = ?
        `, [recipeId]);

        res.json(rows[0]);

    } catch (err) {
        console.error("getRecipeRatingSummary error:", err);
        res.status(500).json({
            message: "Failed to fetch rating summary",
            error: err.message
        });
    }
};

exports.createComment = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user.id; // from JWT
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        await db.query(
            `INSERT INTO recipe_comments (recipe_id, user_id, content)
             VALUES (?, ?, ?)`,
            [recipeId, userId, content]
        );

        res.json({ message: "Comment added successfully" });

    } catch (err) {
        console.error("createComment error:", err);
        res.status(500).json({
            message: "Failed to create comment",
            error: err.message,
        });
    }
};

exports.createOrUpdateRating = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user.id;
        const { rating, review } = req.body;

        if (!rating) {
            return res.status(400).json({ message: "Rating required" });
        }

        // check if user already rated
        const [existing] = await db.query(
            `SELECT id FROM recipe_ratings WHERE recipe_id = ? AND user_id = ?`,
            [recipeId, userId]
        );

        if (existing.length > 0) {
            // update
            await db.query(
                `UPDATE recipe_ratings
                 SET rating = ?, review = ?
                 WHERE recipe_id = ? AND user_id = ?`,
                [rating, review, recipeId, userId]
            );
        } else {
            // insert
            await db.query(
                `INSERT INTO recipe_ratings (recipe_id, user_id, rating, review)
                 VALUES (?, ?, ?, ?)`,
                [recipeId, userId, rating, review]
            );
        }

        res.json({ message: "Rating saved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};