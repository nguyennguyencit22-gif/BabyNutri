-- ==========================================
-- MIGRATION: multiple parents/caregivers per
-- baby profile, via a proper join table instead
-- of the single child_profiles.parent_id column.
--
-- child_profiles.parent_id is KEPT as-is (marks
-- who originally created the profile / the
-- "Primary parent" for display purposes), but
-- access control moves to child_caregivers.
-- ==========================================
USE child_nutrition_system;

ALTER TABLE child_profiles
ADD COLUMN profile_code VARCHAR(30) UNIQUE NULL;

CREATE TABLE IF NOT EXISTS child_caregivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    user_id INT NOT NULL,
    permission ENUM('owner','editor') NOT NULL DEFAULT 'editor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_child_user (child_id, user_id),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- One-time-use codes, separate from profile_code, precisely so a leaked
-- code can't be used to join forever — see child_invitation_codes.status.
CREATE TABLE IF NOT EXISTS child_invitation_codes (
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

-- Backfill: every existing child_profiles row becomes owned by its
-- current parent_id, so nothing that already worked breaks.
INSERT IGNORE INTO child_caregivers (child_id, user_id, permission)
SELECT id, parent_id, 'owner'
FROM child_profiles
WHERE parent_id IS NOT NULL;

-- Backfill profile_code for any pre-existing rows that don't have one yet.
UPDATE child_profiles
SET profile_code = CONCAT('BN-', UPPER(SUBSTRING(MD5(RAND()), 1, 6)))
WHERE profile_code IS NULL;
