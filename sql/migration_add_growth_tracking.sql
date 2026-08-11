-- Migration: Add Growth Tracking Table for Baby Nutri
CREATE TABLE IF NOT EXISTS child_growth_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    record_date DATE NOT NULL,
    weight FLOAT NOT NULL,           -- in kg
    height FLOAT NOT NULL,           -- in cm
    head_circumference FLOAT NULL,   -- in cm (optional)
    bmi FLOAT NOT NULL,              -- weight / ((height/100)^2)
    status VARCHAR(50) DEFAULT 'Healthy Growth',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

-- Seed initial growth tracking sample data for existing child profile (Emma, child_id = 1)
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
