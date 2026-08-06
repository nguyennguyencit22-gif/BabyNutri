-- ==========================================
-- MIGRATION: seed a few more favorites so the
-- Home "Popular recipes" section (driven by
-- favorite_recipes) has more than a single item
-- ==========================================
USE child_nutrition_system;

INSERT INTO favorite_recipes(user_id, recipe_id)
VALUES
(3, 2),
(3, 4),
(3, 5);
