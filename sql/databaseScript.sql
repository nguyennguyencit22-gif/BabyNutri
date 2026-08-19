-- ==========================================
-- BABY NUTRI SYSTEM - DATABASE MASTER SCRIPT
-- Consolidated Full Schema, Seed Data & All Migrations
-- Course: CSW430 - Mobile Programming
-- ==========================================

CREATE DATABASE IF NOT EXISTS child_nutrition_system;
USE child_nutrition_system;

-- ==========================================
-- DROP TABLES (CLEAN SLATE IN REVERSE DEPENDENCY ORDER)
-- ==========================================
DROP TABLE IF EXISTS chat_ratings;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_conversations;
DROP TABLE IF EXISTS expert_feedback;
DROP TABLE IF EXISTS expert_followers;
DROP TABLE IF EXISTS measurement_settings;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS weaning_tips;
DROP TABLE IF EXISTS weaning_features;
DROP TABLE IF EXISTS journey_items;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_recipe_history;
DROP TABLE IF EXISTS question_messages;
DROP TABLE IF EXISTS qna_messages;
DROP TABLE IF EXISTS question_ratings;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS article_comments;
DROP TABLE IF EXISTS article_ratings;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS article_categories;
DROP TABLE IF EXISTS meal_plan_items;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS favorite_recipes;
DROP TABLE IF EXISTS recipe_comments;
DROP TABLE IF EXISTS recipe_ratings;
DROP TABLE IF EXISTS recipe_assets;
DROP TABLE IF EXISTS recipe_allergies;
DROP TABLE IF EXISTS recipe_steps;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS occasions;
DROP TABLE IF EXISTS dietary_needs;
DROP TABLE IF EXISTS weaning_methods;
DROP TABLE IF EXISTS meal_types;
DROP TABLE IF EXISTS child_growth_records;
DROP TABLE IF EXISTS child_food_preferences;
DROP TABLE IF EXISTS child_known_allergies;
DROP TABLE IF EXISTS child_allergies;
DROP TABLE IF EXISTS allergies;
DROP TABLE IF EXISTS child_invitation_codes;
DROP TABLE IF EXISTS child_caregivers;
DROP TABLE IF EXISTS child_profiles;
DROP TABLE IF EXISTS expert_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- ==========================================
-- 1. ROLES & USERS
-- ==========================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles(id, name) VALUES 
(1, 'Admin'), 
(2, 'Expert'), 
(3, 'Parent');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    role_id INT NOT NULL,
    firebase_uid VARCHAR(255) NULL UNIQUE,
    avatar VARCHAR(500) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO users(id, full_name, email, password, role_id, avatar)
VALUES
(1, 'System Admin', 'admin@gmail.com', '123456', 1, 'https://i.pravatar.cc/200?img=60'),
(2, 'Nguyen Minh Nguyen', 'expert@gmail.com', '123456', 2, 'https://i.pravatar.cc/200?img=68'),
(3, 'John Parent', 'parent@gmail.com', '123456', 3, 'https://i.pravatar.cc/200?img=33'),
(4, 'Troyan Smith', 'troyan.smith@babynutri.com', '123456', 2, 'https://i.pravatar.cc/200?img=12'),
(5, 'James Wolden', 'james.wolden@babynutri.com', '123456', 2, 'https://i.pravatar.cc/200?img=11'),
(6, 'Niki Samantha', 'niki.samantha@babynutri.com', '123456', 2, 'https://i.pravatar.cc/200?img=47'),
(7, 'Khoa Nguyen', 'khoa.nguyenhoang.cit22@eiu.edu.vn', '123456', 1, 'https://i.pravatar.cc/200?img=60');

-- ==========================================
-- 2. EXPERT PROFILES, FOLLOWERS & FEEDBACK
-- ==========================================
CREATE TABLE expert_profiles (
    expert_id INT PRIMARY KEY,
    information TEXT,
    certificate VARCHAR(255),
    specialization VARCHAR(255),
    experience_year INT,
    is_verified BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO expert_profiles (expert_id, information, certificate, specialization, experience_year, is_verified)
VALUES 
(2, 'Experienced pediatric nutrition specialist', 'Certified Nutritionist', 'Child Nutrition', 8, TRUE),
(4, 'Registered dietitian focused on infant nutrition', 'Registered Dietitian', 'Nutritionist', 6, TRUE),
(5, 'Pediatrician specializing in early childhood health', 'Board Certified Pediatrician', 'Pediatrician', 10, TRUE),
(6, 'Helps families build healthy weaning routines', 'Certified Nutrition Coach', 'Dietitian', 5, TRUE),
(7, 'Pediatric Nutrition Expert', 'Certified Nutritionist', 'Child Nutrition', 5, TRUE);

CREATE TABLE expert_followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    expert_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_follow (user_id, expert_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO expert_followers (user_id, expert_id) VALUES
(3, 2),
(3, 4);

CREATE TABLE expert_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    expert_id INT NOT NULL,
    rating TINYINT NOT NULL DEFAULT 5,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO expert_feedback (user_id, expert_id, rating, feedback) VALUES
(3, 2, 5, 'Very helpful guidance on starting weaning!'),
(3, 4, 5, 'Excellent advice for dealing with picky eaters.');

-- ==========================================
-- 3. CHILD PROFILES, CAREGIVERS & GROWTH
-- ==========================================
CREATE TABLE child_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    name VARCHAR(255),
    date_of_birth DATE,
    weight FLOAT,
    weight_unit VARCHAR(10) DEFAULT 'kg',
    height FLOAT,
    height_unit VARCHAR(10) DEFAULT 'cm',
    gender VARCHAR(20),
    image_url VARCHAR(500),
    profile_color VARCHAR(20),
    nutrition_goal VARCHAR(255),
    profile_code VARCHAR(30) UNIQUE,

    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO child_profiles
    (id, parent_id, name, date_of_birth, weight, weight_unit, height, height_unit, gender, image_url, profile_color, nutrition_goal, profile_code)
VALUES 
(1, 3, 'Emma', '2024-05-01', 8.5, 'kg', 72.0, 'cm', 'Female', '/images/child1.webp', '#FF6B4A', 'Healthy Growth & Weaning', 'BN-EMMA01');

CREATE TABLE child_caregivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    user_id INT NOT NULL,
    permission ENUM('owner','editor') NOT NULL DEFAULT 'editor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_child_user (child_id, user_id),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO child_caregivers (child_id, user_id, permission)
VALUES (1, 3, 'owner');

CREATE TABLE child_invitation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_by INT NOT NULL,
    status ENUM('active','used') NOT NULL DEFAULT 'active',
    used_by INT NULL,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (used_by) REFERENCES users(id)
);

CREATE TABLE allergies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO allergies(id, name) VALUES 
(1, 'Egg Free'), 
(2, 'Nut Free'), 
(3, 'Soya Free'), 
(4, 'Vegetarian'),
(5, 'Dairy Free'),
(6, 'Gluten Free');

CREATE TABLE child_allergies (
    child_id INT,
    allergy_id INT,
    PRIMARY KEY(child_id, allergy_id),

    FOREIGN KEY(child_id) REFERENCES child_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY(allergy_id) REFERENCES allergies(id) ON DELETE CASCADE
);

CREATE TABLE child_known_allergies (
    child_id INT NOT NULL,
    allergy_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (child_id, allergy_name),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

INSERT INTO child_known_allergies (child_id, allergy_name) VALUES
(1, 'Peanut Allergy');

CREATE TABLE child_food_preferences (
    child_id INT NOT NULL,
    food_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (child_id, food_name),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

INSERT INTO child_food_preferences (child_id, food_name) VALUES
(1, 'Avocado'),
(1, 'Sweet Potato');

CREATE TABLE child_growth_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    record_date DATE NOT NULL,
    weight FLOAT NOT NULL,
    height FLOAT NOT NULL,
    head_circumference FLOAT NULL,
    bmi FLOAT NOT NULL,
    status VARCHAR(50) DEFAULT 'Healthy Growth',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

INSERT INTO child_growth_records (child_id, record_date, weight, height, head_circumference, bmi, status, notes)
VALUES 
(1, '2024-05-01', 3.3, 50.0, 34.5, 13.2, 'Healthy Growth', 'Birth measurement'),
(1, '2024-06-01', 4.4, 54.0, 36.5, 15.1, 'Healthy Growth', '1 month checkup'),
(1, '2024-07-01', 5.5, 58.0, 38.5, 16.3, 'Healthy Growth', '2 months checkup'),
(1, '2024-08-01', 6.3, 61.5, 40.0, 16.6, 'Healthy Growth', '3 months checkup'),
(1, '2024-09-01', 7.0, 64.0, 41.2, 17.1, 'Healthy Growth', '4 months checkup'),
(1, '2024-10-01', 7.6, 66.5, 42.1, 17.2, 'Healthy Growth', '5 months checkup'),
(1, '2024-11-01', 8.1, 68.5, 43.0, 17.3, 'Healthy Growth', '6 months checkup'),
(1, '2024-12-01', 8.5, 72.0, 44.0, 16.4, 'Healthy Growth', 'Latest checkup');

-- ==========================================
-- 4. LOOKUP TABLES & CATEGORIES
-- ==========================================
CREATE TABLE meal_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

INSERT INTO meal_types(id, name) VALUES 
(1, 'Breakfast'), 
(2, 'Lunch'), 
(3, 'Dinner'), 
(4, 'Snack');

CREATE TABLE weaning_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

INSERT INTO weaning_methods(id, name) VALUES 
(1, 'Puree'), 
(2, 'Mashed'), 
(3, 'Baby-Led Weaning'), 
(4, 'Finger Food');

CREATE TABLE dietary_needs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

INSERT INTO dietary_needs(id, name) VALUES 
(1, 'Dairy-Free'), 
(2, 'Gluten-Free'), 
(3, 'Egg-Free'), 
(4, 'Nut-Free'), 
(5, 'Vegetarian');

CREATE TABLE occasions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

INSERT INTO occasions(id, name) VALUES 
(1, 'Everyday'), 
(2, 'First Foods'), 
(3, 'Meal Prep'), 
(4, 'On-the-Go'), 
(5, 'Special Occasion');

CREATE TABLE article_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

INSERT INTO article_categories(id, name) VALUES 
(1, 'Nutrition Tips'), 
(2, 'Weaning Guide'), 
(3, 'Recipes & Meals'), 
(4, 'Health & Safety'), 
(5, 'Development');

-- ==========================================
-- 5. RECIPES, INGREDIENTS & STEPS
-- ==========================================
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500),
    expert_id INT,
    meal_type_id INT,
    cooking_time INT DEFAULT 15,
    prep_time INT DEFAULT 10,
    serves INT DEFAULT 1,
    month_age INT DEFAULT 6,
    calories INT DEFAULT 0,
    protein INT DEFAULT 0,
    fat INT DEFAULT 0,
    carbohydrate INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    weaning_method VARCHAR(100),
    dietary_needs VARCHAR(100),
    occasion VARCHAR(100),
    weaning_method_id INT DEFAULT NULL,
    dietary_needs_id INT DEFAULT NULL,
    occasion_id INT DEFAULT NULL,

    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(id) ON DELETE SET NULL,
    FOREIGN KEY (weaning_method_id) REFERENCES weaning_methods(id) ON DELETE SET NULL,
    FOREIGN KEY (dietary_needs_id) REFERENCES dietary_needs(id) ON DELETE SET NULL,
    FOREIGN KEY (occasion_id) REFERENCES occasions(id) ON DELETE SET NULL
);

INSERT INTO recipes (id, name, description, image_url, expert_id, cooking_time, prep_time, serves, month_age, meal_type_id, calories, protein, fat, carbohydrate)
VALUES
(1, 'Bright Starts Brekkie Bowl', 'Perfect for hot summer days, refreshing fruit and yogurt blend.', 'https://images.unsplash.com/photo-1682622110332-d50f50b7146d', 2, 0, 5, 1, 7, 2, 180, 5, 4, 30),
(2, 'Three Ways With Yummy Yogurt Pots', 'Yogurt is one of our go-to nutrient-dense snacks.', 'https://images.unsplash.com/photo-1753173302910-8470505e6994', 2, 0, 5, 1, 7, 4, 150, 6, 3, 22),
(3, 'Rise + Shine Scrambly Eggs', 'These speedy scrambly eggs provide great protein and soft texture.', 'https://images.unsplash.com/photo-1687630433865-f86f07be989a', 2, 0, 5, 1, 7, 1, 210, 12, 14, 2),
(4, 'Broc N Roll Cheesy Chive Pasta', 'Ready in just 15 minutes, rich in vitamins and calcium.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624', 2, 10, 5, 1, 7, 3, 260, 9, 8, 38),
(5, 'My First Chicken Curry', 'A gentle introduction to mild warming spices and protein.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398', 2, 15, 5, 1, 7, 4, 290, 18, 10, 32),
(6, 'My First Chicken Curry Alt', 'Alternative mild chicken blend with coconut and soft rice.', 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7', 2, 15, 5, 1, 7, 2, 290, 18, 10, 32);

CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

INSERT INTO ingredients(id, name) VALUES
(1, 'Banana'), (2, 'Strawberries'), (3, 'Yogurt'), (4, 'Ice cubes'),
(5, 'Blueberries'), (6, 'Banana slices'), (7, 'Honey'),
(8, 'Eggs'), (9, 'Butter'), (10, 'Milk'), (11, 'Cheese'),
(12, 'Pasta'), (13, 'Broccoli'), (14, 'Fresh chives'),
(15, 'Chicken breast'), (16, 'Coconut milk'), (17, 'Mild curry powder'), (18, 'Rice');

CREATE TABLE recipe_ingredients (
    recipe_id INT,
    ingredient_id INT,
    quantity VARCHAR(100),
    PRIMARY KEY(recipe_id, ingredient_id),

    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

INSERT INTO recipe_ingredients VALUES
(1,1,'1 Banana'),(1,2,'1 Cup Strawberries'),(1,3,'1/2 Cup Yogurt'),(1,4,'Ice cubes'),
(2,3,'1 Cup Yogurt'),(2,5,'Handful'),(2,6,'Slices'),(2,7,'1 tsp'),
(3,8,'2'),(3,9,'1 tbsp'),(3,10,'2 tbsp'),(3,11,'50g'),
(4,12,'100g'),(4,13,'50g'),(4,11,'50g'),(4,14,'1 tbsp'),
(5,15,'200g'),(5,16,'200ml'),(5,17,'1 tsp'),(5,18,'1 cup'),
(6,15,'200g'),(6,16,'200ml'),(6,17,'1 tsp'),(6,18,'1 cup');

CREATE TABLE recipe_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT,
    step_number INT,
    description TEXT,
    image_url VARCHAR(500),

    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

INSERT INTO recipe_steps(recipe_id, step_number, description) VALUES
(1,1,'Cut fruits into small pieces'), (1,2,'Blend all ingredients'), (1,3,'Pour into molds'), (1,4,'Freeze for 4 hours'),
(2,1,'Prepare yogurt bowls'), (2,2,'Add toppings'), (2,3,'Mix gently'), (2,4,'Serve immediately'),
(3,1,'Whisk eggs and milk'), (3,2,'Heat butter'), (3,3,'Cook slowly'), (3,4,'Add cheese'),
(4,1,'Cook pasta'), (4,2,'Steam broccoli'), (4,3,'Mix cheese'), (4,4,'Add chives'),
(5,1,'Cook chicken'), (5,2,'Add coconut milk'), (5,3,'Simmer'), (5,4,'Serve with rice'),
(6,1,'Cook chicken'), (6,2,'Add coconut milk'), (6,3,'Simmer'), (6,4,'Serve with rice');

CREATE TABLE recipe_allergies (
    recipe_id INT,
    allergy_id INT,
    PRIMARY KEY(recipe_id, allergy_id),

    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(allergy_id) REFERENCES allergies(id) ON DELETE CASCADE
);

INSERT INTO recipe_allergies VALUES 
(1,4), 
(2,4), 
(3,1), 
(4,4);

CREATE TABLE recipe_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT,
    type VARCHAR(50),
    image_url VARCHAR(500),

    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. FAVORITES, RATINGS & COMMENTS
-- ==========================================
CREATE TABLE favorite_recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_fav (user_id, recipe_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

INSERT INTO favorite_recipes(user_id, recipe_id)
VALUES 
(3,1), 
(3,2), 
(3,4), 
(3,5);

CREATE TABLE recipe_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL,
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_recipe_rate (recipe_id, user_id),
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO recipe_ratings(recipe_id, user_id, rating, review)
VALUES (1, 3, 5, 'Great recipe! Emma loved the fruit blend.');

CREATE TABLE recipe_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO recipe_comments(recipe_id, user_id, content)
VALUES (1, 3, 'Very healthy and easy to make in under 5 minutes!');

-- ==========================================
-- 7. MEAL PLANS
-- ==========================================
CREATE TABLE meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT,
    child_id INT,
    week_start DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

INSERT INTO meal_plans(id, parent_id, child_id, week_start)
VALUES (1, 3, 1, '2026-06-01');

CREATE TABLE meal_plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id INT,
    recipe_id INT,
    day_of_week VARCHAR(20),
    meal_type_id INT,
    portion VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planned',

    FOREIGN KEY(meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(meal_type_id) REFERENCES meal_types(id) ON DELETE SET NULL
);

INSERT INTO meal_plan_items(meal_plan_id, recipe_id, day_of_week, meal_type_id, portion, status)
VALUES 
(1, 1, 'Monday', 1, '1 bowl', 'planned'),
(1, 4, 'Monday', 2, '1 plate', 'planned'),
(1, 3, 'Tuesday', 1, '1 portion', 'planned');

-- ==========================================
-- 8. ARTICLES, RATINGS & COMMENTS
-- ==========================================
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expert_id INT DEFAULT NULL,
    title VARCHAR(255),
    summary VARCHAR(500) DEFAULT NULL,
    content TEXT,
    image_url VARCHAR(500),
    published_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100) DEFAULT NULL,
    category_id INT DEFAULT NULL,
    target_age VARCHAR(50) DEFAULT NULL,
    reading_time VARCHAR(50) DEFAULT NULL,
    tags VARCHAR(500) DEFAULT NULL,

    FOREIGN KEY(expert_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO articles(id, expert_id, title, summary, content, image_url, category, target_age, reading_time)
VALUES
(1, 2, 'Starting Soon: Getting Ready to Wean', 'Getting ready to start weaning: readiness signs, first foods, and how to begin.', 'Around 6 months, most babies show they''re ready to start exploring food alongside milk feeds. Look out for a few signs together: your baby can sit up with support and hold their head steady, they''ve lost the tongue-thrust reflex that used to push food back out, and they''re showing real interest in what''s on your plate.\n\nThere''s no need to rush. Start with just one meal a day, offered when your baby is happy and not overtired — mid-morning often works well. Iron-rich first foods are a great place to begin, since a baby''s iron stores start to run low around this age: try well-cooked and mashed or pureed vegetables like sweet potato and carrot, ripe banana or avocado, or plain baby rice mixed with breast milk or formula.\n\nOffer one new food at a time and wait two to three days before introducing another, so it''s easy to spot any reaction. Texture matters less than the experience at first — some babies take to purees straight away, others prefer to explore soft finger foods with their hands. Follow your baby''s lead, keep meals relaxed and mess-friendly, and remember milk is still their main source of nutrition for now.', 'https://images.unsplash.com/photo-1547592180-85f173990554', 'Weaning Guide', '4-6 Months', '4 min read'),
(2, 2, 'Your Baby''s First Tastes', 'What the very first spoon-feeds look like and how to make them stress-free.', 'The first tastes are really about discovery, not nutrition — milk is still doing the heavy lifting. Offer a teaspoon or two of a single smooth puree once a day, and don''t worry if most of it ends up on the bib rather than in your baby''s mouth. That''s completely normal.\n\nGood first foods to try one at a time: baby rice mixed with milk, mashed ripe banana, cooked and pureed sweet potato, carrot, parsnip or apple, or mashed avocado. Keep each new food on its own for a couple of days before moving to the next, so you can easily notice if anything doesn''t agree with your baby.\n\nA gag here and there is normal and different from choking — babies have a strong gag reflex further forward in their mouth than adults, which actually helps protect them while they learn to manage new textures. Sit your baby upright, stay with them the whole time, and let mealtimes be unhurried. Some days they''ll eat a lot, other days barely anything — appetite varies a lot at this stage, and that''s fine.', 'https://images.unsplash.com/photo-1687630433865-f86f07be989a', 'Weaning Guide', '6 Months', '3 min read'),
(3, 2, 'Exploring Food From 6 Months', 'Widening the variety, introducing allergens early, and thicker textures.', 'By now your baby has probably got the hang of a spoon and finished their first few single foods. This is a great time to start widening the variety and combining flavours — try mixing two vegetables together, or a vegetable with a fruit.\n\nCurrent guidance recommends introducing common allergens like well-cooked egg, peanut (as a smooth, thinned peanut butter), and dairy in cooking one at a time from around 6 months, rather than delaying them — this can actually help reduce the chance of a food allergy developing. Introduce each one in a small amount at home, during the day, so you can watch for any reaction, and keep offering it regularly once it''s tolerated.\n\nTextures can start moving from smooth purees to soft mashed food with a few gentle lumps — this helps babies build the chewing and tongue-moving skills they''ll need for finger foods soon. Iron-rich foods (meat, lentils, fortified cereals) are still important daily. You can start building up towards two small meals a day, alongside regular milk feeds.', 'https://images.unsplash.com/photo-1682622110332-d50f50b7146d', 'Nutrition Tips', '6-7 Months', '5 min read'),
(4, 2, 'Building Confidence From 7 Months', 'Finger foods, more texture, and moving towards three meals a day.', 'Around 7 months many babies are ready to start picking up food themselves. Soft finger foods are perfect for this — think steamed vegetable sticks (carrot, broccoli, sweet potato), ripe soft fruit like pear or banana, or toast fingers. Cut pieces about the size and shape of an adult finger so they''re easy to hold and gum, and always stay within arm''s reach while your baby eats.\n\nYou can keep offering spoon-fed purees and mashed meals alongside finger foods — there''s no need to choose one approach over the other. Textures can get chunkier now: mashed with soft lumps, minced meat, or well-cooked pasta shapes.\n\nThis is also a good time to introduce a wider range of herbs and mild spices to build up your baby''s palate, and to offer cooled boiled water in an open or free-flow cup with meals. Aim to build towards three small meals a day by the end of this stage, always alongside regular breast milk or formula feeds.', 'https://images.unsplash.com/photo-1753173302910-8470505e6994', 'Development', '7-9 Months', '4 min read'),
(5, 2, 'New Adventures From 10 Months', 'Chopped family foods, growing independence, and simple snacks.', 'Most babies are becoming much more capable eaters by 10 months — chewing, moving food around their mouth, and often trying hard to use a spoon themselves (even if a lot still ends up on the floor!). You can move from mashed and minced food towards soft chopped pieces, closer to what the rest of the family eats.\n\nLet your baby practise self-feeding as much as possible, even if it''s slower and messier — it''s how they build coordination and confidence. A weaning spoon in each of your hands (one for them, one for you) can help meals move along while still letting them lead.\n\nThree meals a day is typical now, plus one or two simple snacks if your baby seems hungry between meals — things like soft fruit, a rice cake, or a small piece of cheese work well. Keep offering a variety of textures and flavours, including foods with a bit of chew to them, and keep an eye on portion sizes growing gradually alongside their appetite.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624', 'Recipes & Meals', '10-12 Months', '4 min read'),
(6, 2, 'Almost There: From 12 Months', 'Moving onto family food, whole milk, and finishing the weaning journey.', 'Happy first birthday! By 12 months, food should be your baby''s main source of nutrition, with milk playing a supporting role rather than the main one. You can now offer whole cow''s milk as a drink (rather than as formula or breast milk), alongside a wide variety of table food.\n\nMost toddlers this age can manage three meals and two to three small snacks a day, eating pretty much the same meals as the rest of the family — just holding back on added salt, sugar, and honey, and being mindful of whole nuts and other choking hazards. Chopped, diced, or soft-cooked pieces work well, and many babies are getting better at using a spoon or fork themselves.\n\nAppetite can vary a lot day to day at this age, which is completely normal — toddlers are good at eating what they need over a week even if one day looks like barely anything. Keep mealtimes relaxed, offer a wide range of foods without pressure, and celebrate how far you''ve both come since those very first tastes.', 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7', 'Nutrition Tips', '12+ Months', '5 min read');

CREATE TABLE article_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_article_rate (article_id, user_id),
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO article_ratings(article_id, user_id, rating, review)
VALUES (1, 3, 5, 'Super clear and informative guide for new parents!');

CREATE TABLE article_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO article_comments(article_id, user_id, content)
VALUES (1, 3, 'Thank you doctor! This helped us start solid food smoothly.');

-- ==========================================
-- 9. QUESTIONS, ANSWERS & REALTIME Q&A CHAT
-- ==========================================
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT,
    expert_id INT,
    title VARCHAR(255),
    content TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(expert_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO questions(id, parent_id, expert_id, title, content, status)
VALUES (1, 3, 2, 'Can my baby eat yogurt at 7 months?', 'My child Emma is 7 months old, is whole milk Greek yogurt safe?', 'Answered');

CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    expert_id INT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY(expert_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO answers(id, question_id, expert_id, content)
VALUES (1, 1, 2, 'Yes, plain whole-milk yogurt is completely safe and nutritious for babies over 6 months.');

CREATE TABLE question_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_question_rating (question_id, user_id),
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO question_ratings(question_id, user_id, rating, review)
VALUES (1, 3, 5, 'Quick and reassuring answer, thank you!');

CREATE TABLE qna_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE question_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 10. USER ACTIVITY & NOTIFICATIONS
-- ==========================================
CREATE TABLE user_recipe_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    recipe_id INT,
    action VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'general',
    ref_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO notifications(user_id, title, message, is_read, type)
VALUES 
(3, 'Welcome to BabyNutri!', 'Explore recipes, growth tracking and consult with experts.', FALSE, 'general'),
(3, 'Doctor Replied', 'Dr. Nguyen answered your question regarding yogurt.', FALSE, 'qna');

-- ==========================================
-- 11. HOME JOURNEY & WEANING CONTENT
-- ==========================================
CREATE TABLE journey_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age_label VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    color_month VARCHAR(50) DEFAULT '#FF6B4A',
    image_key VARCHAR(100) DEFAULT 'startingSoon-Seedstick',
    article_id INT DEFAULT NULL,
    sort_order INT DEFAULT 1,

    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
);

INSERT INTO journey_items(id, age_label, title, description, color_month, image_key, sort_order, article_id)
VALUES
(1, 'Starting\nsoon', 'Starting soon', 'Getting ready for weaning tips, a handy checklist and more.', '#1F8FC4', 'startingSoon-Seedstick', 1, 1),
(2, 'First\ntastes', 'First tastes', 'Getting ready for weaning tips, a handy checklist and more.', '#C4265E', 'firstTastes-Seedstick', 2, 2),
(3, '6+\nmonths', 'From 6 months', 'Getting ready for weaning tips, a handy checklist and more.', '#A31578', '6Months-Seedstick', 3, 3),
(4, '7+\nmonths', 'From 7 months', 'Getting ready for weaning tips, a handy checklist and more.', '#7C63A3', '7Months-Seedstick', 4, 4),
(5, '10+\nmonths', 'From 10 months', 'Getting ready for weaning tips, a handy checklist and more.', '#1F7A3D', '10Months-Seedstick', 5, 5),
(6, '12+\nmonths', 'From 12 months', 'Getting ready for weaning tips, a handy checklist and more.', '#80C700', '12Months-Seedstick', 6, 6);

CREATE TABLE weaning_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

INSERT INTO weaning_features(text, sort_order)
VALUES
('What to expect at every stage', 1),
('Top tips from nutritionists', 2),
('Yummy recipes', 3),
('...and much more!', 4);

CREATE TABLE weaning_tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL
);

INSERT INTO weaning_tips (text) VALUES
('Start with smooth single vegetables like sweet potato or carrot.'),
('Introduce one common allergen at a time to monitor tolerance.'),
('Never add honey or added salt to food for babies under 12 months.'),
('Allow baby to touch and explore food texture freely during mealtimes.');

-- ==========================================
-- 12. USER & MEASUREMENT SETTINGS
-- ==========================================
CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    use_metric BOOLEAN DEFAULT TRUE,
    weight_unit ENUM('kg','lb') DEFAULT 'kg',
    volume_unit ENUM('ml','us_fl_oz','uk_fl_oz') DEFAULT 'ml',
    length_unit ENUM('cm','in') DEFAULT 'cm',
    temperature_unit ENUM('c','f') DEFAULT 'c',
    language VARCHAR(10) DEFAULT 'en',
    theme ENUM('system','light','dark') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO user_settings(user_id, use_metric, weight_unit, volume_unit, length_unit, temperature_unit)
VALUES (3, TRUE, 'kg', 'ml', 'cm', 'c');

CREATE TABLE measurement_settings (
    user_id INT PRIMARY KEY,
    use_metric BOOLEAN DEFAULT TRUE,
    weight_unit VARCHAR(10) DEFAULT 'kg',
    volume_unit VARCHAR(10) DEFAULT 'ml',
    length_unit VARCHAR(10) DEFAULT 'cm',
    temperature_unit VARCHAR(10) DEFAULT 'C',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO measurement_settings (user_id, use_metric, weight_unit, volume_unit, length_unit, temperature_unit)
VALUES (3, TRUE, 'kg', 'ml', 'cm', 'C');

-- ==========================================
-- 13. EXPERT LIVE CHAT & CONVERSATIONS
-- ==========================================
CREATE TABLE chat_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    expert_id INT NOT NULL,
    status ENUM('active','ended') DEFAULT 'active',
    last_message TEXT,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO chat_conversations (id, parent_id, expert_id, status, last_message)
VALUES (1, 3, 2, 'active', 'Hello Dr. Nguyen, I would like to consult about Emma meal plan.');

CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO chat_messages (conversation_id, sender_id, content) VALUES
(1, 3, 'Hello Dr. Nguyen, I would like to consult about Emma meal plan.'),
(1, 2, 'Hello John, sure! What are you currently feeding Emma?');

CREATE TABLE chat_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    parent_id INT NOT NULL,
    rating TINYINT NOT NULL,
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO chat_ratings(conversation_id, parent_id, rating, review)
VALUES (1, 3, 5, 'Dr. Nguyen was extremely attentive and helpful!');
