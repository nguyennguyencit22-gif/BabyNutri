-- ==========================================
-- MIGRATION: extend child_profiles to hold
-- everything the mobile questionnaire/profile
-- forms collect, and add child-scoped tables
-- for the app's own allergy tags + food prefs.
--
-- NOTE: `allergies` / `child_allergies` already exist and are used to tag
-- RECIPES as suitable/unsuitable for a diet (e.g. "Egg Free"), consumed by
-- the parent dashboard today. The mobile questionnaire asks a different
-- question ("does your child have any allergies?") with a different
-- vocabulary ("Egg Allergy", "Peanut Allergy", ...), so it gets its own
-- table (`child_known_allergies`) instead of overloading the recipe one.
-- ==========================================
USE child_nutrition_system;

ALTER TABLE child_profiles
ADD COLUMN profile_color VARCHAR(20) NULL,
ADD COLUMN weight_unit VARCHAR(10) NULL DEFAULT 'kg',
ADD COLUMN height_unit VARCHAR(10) NULL DEFAULT 'cm',
ADD COLUMN nutrition_goal VARCHAR(255) NULL;

CREATE TABLE IF NOT EXISTS child_known_allergies (
    child_id INT NOT NULL,
    allergy_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (child_id, allergy_name),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS child_food_preferences (
    child_id INT NOT NULL,
    food_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (child_id, food_name),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);
