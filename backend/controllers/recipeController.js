// @ts-nocheck
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
        res.status(500).json({ message: "Failed to fetch recipes", error: err.message });
    }
};

// ==========================================
// GET RECIPE BY ID (FULL DETAIL)
// ==========================================
exports.getRecipeById = async (req, res) => {
    try {
        const id = req.params.id;

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

        const [ingredientRows] = await db.query(`
            SELECT i.name, ri.quantity
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = ?
        `, [id]);
        const ingredients = ingredientRows.map((i) => `${i.quantity} ${i.name}`);

        const [stepRows] = await db.query(`
            SELECT step_number, description
            FROM recipe_steps
            WHERE recipe_id = ?
            ORDER BY step_number ASC
        `, [id]);
        const steps = stepRows.map(s => s.description);

        const [allergyRows] = await db.query(`
            SELECT a.name
            FROM recipe_allergies ra
            JOIN allergies a ON ra.allergy_id = a.id
            WHERE ra.recipe_id = ?
        `, [id]);
        const allergies = allergyRows.map(a => a.name);

        const [assetRows] = await db.query(`
            SELECT type, image_url
            FROM recipe_assets
            WHERE recipe_id = ?
        `, [id]);
        const stickers = assetRows.filter(a => a.type === "sticker").map(a => a.image_url);
        const heroImages = assetRows.filter(a => a.type === "hero").map(a => a.image_url);
        const gallery = assetRows.filter(a => a.type === "gallery").map(a => a.image_url);

        res.json({
            ...recipe,
            ingredients,
            steps,
            allergies,
            assets: { stickers, heroImages, gallery }
        });
    } catch (err) {
        console.error("🔥 getRecipeById error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ==========================================
// COMMENTS
// ==========================================
exports.getRecipeComments = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const [rows] = await db.query(`
            SELECT rc.id, rc.content, rc.user_id AS userId, rc.created_at AS createdAt, u.full_name AS userName, u.avatar
            FROM recipe_comments rc
            JOIN users u ON rc.user_id = u.id
            WHERE rc.recipe_id = ?
            ORDER BY rc.id DESC
        `, [recipeId]);
        res.json(rows);
    } catch (err) {
        console.error("getRecipeComments error:", err);
        res.status(500).json({ message: "Failed to fetch comments", error: err.message });
    }
};

exports.createComment = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const [result] = await db.query(
            `INSERT INTO recipe_comments (recipe_id, user_id, content) VALUES (?, ?, ?)`,
            [recipeId, userId, content]
        );
        res.json({ id: result.insertId, message: "Comment added successfully" });
    } catch (err) {
        console.error("createComment error:", err);
        res.status(500).json({ message: "Failed to create comment", error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [existing] = await db.query(
            `SELECT user_id FROM recipe_comments WHERE id = ?`,
            [commentId]
        );

        if (!existing.length) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({ message: "You can only delete your own comment" });
        }

        await db.query(`DELETE FROM recipe_comments WHERE id = ?`, [commentId]);
        res.json({ message: "Comment deleted" });
    } catch (err) {
        console.error("deleteComment error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ==========================================
// RATINGS
// ==========================================
exports.getRecipeRatings = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const [rows] = await db.query(`
            SELECT r.id, r.rating, r.review, u.full_name AS userName
            FROM recipe_ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.recipe_id = ?
            ORDER BY r.id DESC
        `, [recipeId]);
        res.json(rows);
    } catch (err) {
        console.error("getRecipeRatings error:", err);
        res.status(500).json({ message: "Failed to fetch ratings", error: err.message });
    }
};

exports.getRecipeRatingSummary = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const [rows] = await db.query(`
            SELECT COUNT(*) AS totalRatings, COALESCE(AVG(rating), 0) AS averageRating
            FROM recipe_ratings
            WHERE recipe_id = ?
        `, [recipeId]);

        const [breakdownRows] = await db.query(`
            SELECT rating, COUNT(*) AS count
            FROM recipe_ratings
            WHERE recipe_id = ?
            GROUP BY rating
        `, [recipeId]);

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        breakdownRows.forEach((r) => { breakdown[r.rating] = r.count; });

        res.json({ ...rows[0], breakdown });
    } catch (err) {
        console.error("getRecipeRatingSummary error:", err);
        res.status(500).json({ message: "Failed to fetch rating summary", error: err.message });
    }
};

exports.getMyRating = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [rows] = await db.query(
            `SELECT rating FROM recipe_ratings WHERE recipe_id = ? AND user_id = ?`,
            [recipeId, userId]
        );
        res.json({ rating: rows.length > 0 ? rows[0].rating : null });
    } catch (err) {
        console.error("getMyRating error:", err);
        res.status(500).json({ message: "Server error" });
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

        const [existing] = await db.query(
            `SELECT id FROM recipe_ratings WHERE recipe_id = ? AND user_id = ?`,
            [recipeId, userId]
        );

        if (existing.length > 0) {
            await db.query(
                `UPDATE recipe_ratings SET rating = ?, review = ? WHERE recipe_id = ? AND user_id = ?`,
                [rating, review, recipeId, userId]
            );
        } else {
            await db.query(
                `INSERT INTO recipe_ratings (recipe_id, user_id, rating, review) VALUES (?, ?, ?, ?)`,
                [recipeId, userId, rating, review]
            );
        }

        res.json({ message: "Rating saved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ==========================================
// FAVORITES
// ==========================================
exports.toggleFavorite = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [existing] = await db.query(
            `SELECT id FROM favorite_recipes WHERE recipe_id = ? AND user_id = ?`,
            [recipeId, userId]
        );

        if (existing.length > 0) {
            await db.query(`DELETE FROM favorite_recipes WHERE id = ?`, [existing[0].id]);
            return res.json({ favorited: false });
        }

        await db.query(
            `INSERT INTO favorite_recipes (user_id, recipe_id) VALUES (?, ?)`,
            [userId, recipeId]
        );
        res.json({ favorited: true });
    } catch (err) {
        console.error("toggleFavorite error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyFavorites = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [rows] = await db.query(
            `SELECT r.id FROM favorite_recipes f
             JOIN recipes r ON r.id = f.recipe_id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [userId]
        );
        res.json(rows.map(r => r.id));
    } catch (err) {
        console.error("getMyFavorites error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ==========================================
// CREATE RECIPE (transaction thật)
// ==========================================
exports.createRecipe = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const {
            name, description, imageUrl, calories, monthAge,
            mealTypeId, cookingTime, prepTime, serves,
            protein, fat, carbohydrate,
            ingredients, steps,
        } = req.body;

        if (!name || !calories || !monthAge) {
            return res.status(400).json({ message: "name, calories, monthAge là bắt buộc" });
        }

        const expertId = req.user?.id || null;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO recipes
             (name, description, image_url, expert_id, meal_type_id, cooking_time, prep_time, serves, month_age, calories, protein, fat, carbohydrate)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description || '', imageUrl || '', expertId, mealTypeId || null,
             cookingTime || 0, prepTime || 0, serves || 1, monthAge, calories,
             protein || 0, fat || 0, carbohydrate || 0]
        );
        const recipeId = result.insertId;

        if (Array.isArray(ingredients)) {
            for (const ing of ingredients) {
                if (!ing.name) continue;
                let [existing] = await connection.query(
                    `SELECT id FROM ingredients WHERE name = ?`, [ing.name]
                );
                let ingredientId;
                if (existing.length > 0) {
                    ingredientId = existing[0].id;
                } else {
                    const [inserted] = await connection.query(
                        `INSERT INTO ingredients (name) VALUES (?)`, [ing.name]
                    );
                    ingredientId = inserted.insertId;
                }
                await connection.query(
                    `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)`,
                    [recipeId, ingredientId, ing.quantity || '']
                );
            }
        }

        if (Array.isArray(steps)) {
            for (let i = 0; i < steps.length; i++) {
                if (!steps[i]) continue;
                await connection.query(
                    `INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES (?, ?, ?)`,
                    [recipeId, i + 1, steps[i]]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: "Recipe created", id: recipeId });
    } catch (err) {
        try { await connection.rollback(); } catch {}
        console.error("createRecipe error:", err);
        res.status(500).json({ message: "Failed to create recipe", error: err.message });
    } finally {
        connection.release();
    }
};

// ==========================================
// UPDATE RECIPE
// ==========================================
exports.updateRecipe = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, imageUrl, calories, monthAge, mealTypeId, cookingTime, prepTime, serves, protein, fat, carbohydrate } = req.body;

        const [existing] = await db.query(`SELECT id FROM recipes WHERE id = ?`, [id]);
        if (!existing.length) return res.status(404).json({ message: "Recipe not found" });

        await db.query(
            `UPDATE recipes SET
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                image_url = COALESCE(?, image_url),
                calories = COALESCE(?, calories),
                month_age = COALESCE(?, month_age),
                meal_type_id = COALESCE(?, meal_type_id),
                cooking_time = COALESCE(?, cooking_time),
                prep_time = COALESCE(?, prep_time),
                serves = COALESCE(?, serves),
                protein = COALESCE(?, protein),
                fat = COALESCE(?, fat),
                carbohydrate = COALESCE(?, carbohydrate)
             WHERE id = ?`,
            [name, description, imageUrl, calories, monthAge, mealTypeId, cookingTime, prepTime, serves, protein, fat, carbohydrate, id]
        );

        res.json({ message: "Recipe updated" });
    } catch (err) {
        console.error("updateRecipe error:", err);
        res.status(500).json({ message: "Failed to update recipe", error: err.message });
    }
};

// ==========================================
// DELETE RECIPE
// ==========================================
exports.deleteRecipe = async (req, res) => {
    try {
        const id = req.params.id;

        const [existing] = await db.query(`SELECT id FROM recipes WHERE id = ?`, [id]);
        if (!existing.length) return res.status(404).json({ message: "Recipe not found" });

        await db.query(`DELETE FROM recipe_comments WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM recipe_ratings WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM recipe_assets WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM recipe_allergies WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM recipe_steps WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM recipe_ingredients WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM favorite_recipes WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM meal_plan_items WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM user_recipe_history WHERE recipe_id = ?`, [id]);
        await db.query(`DELETE FROM recipes WHERE id = ?`, [id]);

        res.json({ message: "Recipe deleted" });
    } catch (err) {
        console.error("deleteRecipe error:", err);
        res.status(500).json({ message: "Failed to delete recipe", error: err.message });
    }
};

// ==========================================
// MY RECIPES (Expert content management + feedback stats)
// ==========================================
exports.getMyRecipes = async (req, res) => {
    try {
        const expertId = req.user?.id;
        if (!expertId) {
            return res.status(401).json({ message: "Login required" });
        }

        const [rows] = await db.query(`
            SELECT
                r.*,
                mt.name AS mealType,
                COALESCE(AVG(rr.rating), 0) AS avgRating,
                COUNT(DISTINCT rr.id) AS ratingCount,
                COUNT(DISTINCT rc.id) AS commentCount
            FROM recipes r
            LEFT JOIN meal_types mt ON r.meal_type_id = mt.id
            LEFT JOIN recipe_ratings rr ON rr.recipe_id = r.id
            LEFT JOIN recipe_comments rc ON rc.recipe_id = r.id
            WHERE r.expert_id = ?
            GROUP BY r.id
            ORDER BY r.id DESC
        `, [expertId]);

        res.json(rows);
    } catch (err) {
        console.error("getMyRecipes error:", err);
        res.status(500).json({ message: "Failed to fetch your recipes", error: err.message });
    }
};

// ==========================================
// SEARCH RECIPES
// ==========================================
exports.searchRecipes = async (req, res) => {
    try {
        const { query, mealTypeId, minAge, maxAge } = req.query;

        let sql = `
            SELECT r.*, mt.name AS mealType, u.full_name AS expertName
            FROM recipes r
            LEFT JOIN meal_types mt ON r.meal_type_id = mt.id
            LEFT JOIN users u ON r.expert_id = u.id
            WHERE 1 = 1
        `;
        const params = [];

        if (query) { sql += ` AND r.name LIKE ?`; params.push(`%${query}%`); }
        if (mealTypeId) { sql += ` AND r.meal_type_id = ?`; params.push(mealTypeId); }
        if (minAge) { sql += ` AND r.month_age >= ?`; params.push(minAge); }
        if (maxAge) { sql += ` AND r.month_age <= ?`; params.push(maxAge); }

        sql += ` ORDER BY r.id DESC`;

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("searchRecipes error:", err);
        res.status(500).json({ message: "Failed to search recipes", error: err.message });
    }
};