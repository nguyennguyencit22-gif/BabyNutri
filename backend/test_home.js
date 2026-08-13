const db = require('./db');

async function testHomeData() {
  console.log('--- TESTING GET HOME DATA ---');
  try {
    const [categoryRows] = await db.query('SELECT id, name FROM meal_types ORDER BY id ASC');
    console.log('Categories:', categoryRows.length);

    const [recipeRows] = await db.query(`
        SELECT
            r.id,
            r.name AS title,
            r.image_url AS image,
            (r.prep_time + r.cooking_time) AS timeMinutes,
            COALESCE(rt.averageRating, 0) AS averageRating,
            COALESCE(rt.ratingCount, 0) AS ratingCount,
            COALESCE(fv.favoriteCount, 0) AS favoriteCount
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
    console.log('Recipes:', recipeRows.length);

    const [journeyRows] = await db.query('SELECT * FROM journey_items');
    console.log('Journey items:', journeyRows.length);

    const [weaningRows] = await db.query('SELECT * FROM weaning_features');
    console.log('Weaning features:', weaningRows.length);

    console.log('ALL SUCCESSFUL!');
  } catch (err) {
    console.error('HOME DATA ERROR:', err);
  }
  process.exit(0);
}
testHomeData();
