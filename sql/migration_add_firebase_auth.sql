-- ==========================================
-- MIGRATION: link users to Firebase accounts
-- ==========================================
USE child_nutrition_system;

ALTER TABLE users
ADD COLUMN firebase_uid VARCHAR(255) NULL UNIQUE;

-- Firebase-created accounts don't have a local bcrypt password.
ALTER TABLE users
MODIFY COLUMN password VARCHAR(255) NULL;
