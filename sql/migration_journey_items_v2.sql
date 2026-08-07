-- ==========================================
-- MIGRATION: expand journey_items to match the
-- badge images already bundled in MobileApp/public/images
-- ==========================================
USE child_nutrition_system;

ALTER TABLE journey_items
ADD COLUMN image_key VARCHAR(50) DEFAULT NULL;

DELETE FROM journey_items;

INSERT INTO journey_items(age_label,title,description,color_month,image_key,sort_order)
VALUES
('Starting\nsoon','Starting soon','Getting ready for weaning tips, a handy checklist and more.','#1F8FC4','startingSoon-Seedstick',1),
('First\ntastes','First tastes','Getting ready for weaning tips, a handy checklist and more.','#C4265E','firstTastes-Seedstick',2),
('6+\nmonths','From 6 months','Getting ready for weaning tips, a handy checklist and more.','#A31578','6Months-Seedstick',3),
('7+\nmonths','From 7 months','Getting ready for weaning tips, a handy checklist and more.','#7C63A3','7Months-Seedstick',4),
('10+\nmonths','From 10 months','Getting ready for weaning tips, a handy checklist and more.','#1F7A3D','10Months-Seedstick',5),
('12+\nmonths','From 12 months','Getting ready for weaning tips, a handy checklist and more.','#80C700','12Months-Seedstick',6);
