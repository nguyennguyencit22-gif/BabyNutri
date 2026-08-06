-- ==========================================
-- MIGRATION: per-user measurement unit settings
-- (Weight / Volume / Length / Temperature)
-- ==========================================
USE child_nutrition_system;

CREATE TABLE IF NOT EXISTS measurement_settings (
    user_id INT PRIMARY KEY,
    use_metric BOOLEAN DEFAULT TRUE,
    weight_unit VARCHAR(10) DEFAULT 'kg',
    volume_unit VARCHAR(10) DEFAULT 'ml',
    length_unit VARCHAR(10) DEFAULT 'cm',
    temperature_unit VARCHAR(10) DEFAULT 'C',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
