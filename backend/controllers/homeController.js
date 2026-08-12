// @ts-nocheck
const db = require("../db");

// ==========================================
// GET HOME PAGE DATA (aggregated)
// ==========================================
exports.getHomeData = async (req, res) => {
    try {
        const [categoryRows] = await db.query(`
            SELECT id, name
            FROM meal_types
            ORDER BY id ASC
        `);

        const [recipeRows] = await db.query(`
            SELECT
                r.id,
                r.name AS title,
                r.image_url AS image,
                (r.prep_time + r.cooking_time) AS timeMinutes,
                COALESCE(rt.averageRating, 0) AS averageRating,
                COALESCE(rt.ratingCount, 0) AS ratingCount,
                fv.favoriteCount AS favoriteCount
            FROM recipes r
            INNER JOIN (
                SELECT recipe_id, COUNT(*) AS favoriteCount
                FROM favorite_recipes
                GROUP BY recipe_id
            ) fv ON fv.recipe_id = r.id
            LEFT JOIN (
                SELECT recipe_id, AVG(rating) AS averageRating, COUNT(*) AS ratingCount
                FROM recipe_ratings
                GROUP BY recipe_id
            ) rt ON rt.recipe_id = r.id
            ORDER BY fv.favoriteCount DESC, averageRating DESC, r.id DESC
            LIMIT 10
        `);

        const [expertRows] = await db.query(`
            SELECT
                u.id,
                u.full_name AS name,
                ep.specialization AS role,
                u.avatar AS image
            FROM expert_profiles ep
            JOIN users u ON u.id = ep.expert_id
            WHERE ep.is_verified = TRUE
            ORDER BY u.id ASC
        `);

        const [journeyRows] = await db.query(`
            SELECT id, age_label AS age, title, description, color_month AS colorMonth, image_key AS imageKey, article_id AS articleId
            FROM journey_items
            ORDER BY sort_order ASC, id ASC
        `);

        const [weaningRows] = await db.query(`
            SELECT id, text
            FROM weaning_features
            ORDER BY sort_order ASC, id ASC
        `);

        res.json({
            popularCategories: categoryRows.map((c) => c.name),
            popularRecipes: recipeRows.map((r) => ({
                id: r.id,
                title: r.title,
                time: `${r.timeMinutes} mins`,
                image: r.image,
                rating: Number(Number(r.averageRating).toFixed(1)),
                ratingCount: r.ratingCount,
                favoriteCount: r.favoriteCount,
            })),
            experts: expertRows.map((e) => ({
                id: e.id,
                name: e.name,
                role: e.role,
                image: e.image,
            })),
            journeyItems: journeyRows,
            weaningFeatures: weaningRows.map((w) => w.text),
        });
    } catch (err) {
        console.error("getHomeData error:", err);
        res.status(500).json({
            message: "Failed to fetch home data",
            error: err.message,
        });
    }
};
