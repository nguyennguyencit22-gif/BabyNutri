-- ==========================================
-- MIGRATION: Home page content (run once against
-- an existing child_nutrition_system database)
-- ==========================================
USE child_nutrition_system;

CREATE TABLE IF NOT EXISTS journey_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age_label VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    color_month VARCHAR(20),
    sort_order INT DEFAULT 0
);

INSERT INTO journey_items(age_label,title,description,color_month,sort_order)
VALUES
('12+\nmonths','From 12 months','Getting ready for weaning tips, a handy checklist and more.','#80C700',1),
('6+\nmonths','From 6 months','Explore simple weaning tips and useful nutrition guidance.','#A31578',2);

CREATE TABLE IF NOT EXISTS weaning_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

INSERT INTO weaning_features(text,sort_order)
VALUES
('What to expect at every stage',1),
('Top tips from nutritionists',2),
('Yummy recipes',3),
('...and much more!',4);

-- Extra verified experts so the home page has more than one card
INSERT INTO users(full_name,email,password,role_id)
VALUES
('Troyan Smith','troyan.smith@babynutri.com','123456',2),
('James Wolden','james.wolden@babynutri.com','123456',2),
('Niki Samantha','niki.samantha@babynutri.com','123456',2);

INSERT INTO expert_profiles(expert_id,information,certificate,specialization,experience_year,is_verified)
SELECT id, 'Registered dietitian focused on infant nutrition','Registered Dietitian','Nutritionist',6,TRUE FROM users WHERE email = 'troyan.smith@babynutri.com'
UNION ALL
SELECT id, 'Pediatrician specializing in early childhood health','Board Certified Pediatrician','Pediatrician',10,TRUE FROM users WHERE email = 'james.wolden@babynutri.com'
UNION ALL
SELECT id, 'Helps families build healthy weaning routines','Certified Nutrition Coach','Dietitian',5,TRUE FROM users WHERE email = 'niki.samantha@babynutri.com';

UPDATE expert_profiles SET is_verified = TRUE WHERE expert_id = 2;

UPDATE users SET avatar = 'https://i.pravatar.cc/200?img=68' WHERE id = 2;
UPDATE users SET avatar = 'https://i.pravatar.cc/200?img=12' WHERE email = 'troyan.smith@babynutri.com';
UPDATE users SET avatar = 'https://i.pravatar.cc/200?img=11' WHERE email = 'james.wolden@babynutri.com';
UPDATE users SET avatar = 'https://i.pravatar.cc/200?img=47' WHERE email = 'niki.samantha@babynutri.com';

-- Replace placeholder local image paths with real hosted images
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' WHERE id IN (1,4);
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1547592180-85f173990554' WHERE id IN (2,5);
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398' WHERE id IN (3,6);
