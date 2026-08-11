// @ts-nocheck
const db = require("../db");

// Ensures child_growth_records table exists in MySQL DB
async function ensureGrowthTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS child_growth_records (
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
            )
        `);
    } catch (err) {
        console.error("ensureGrowthTable error:", err);
    }
}

// Auto run table check
ensureGrowthTable();

// Standard WHO Child Growth Standards Data (0 to 60 months / 0 to 5 years)
// Boys & Girls: 3rd percentile (-2SD), 50th percentile (Median P50), 97th percentile (+2SD)
const WHO_STANDARDS = {
    boy: {
        weight: [
            { month: 0, p3: 2.5, p50: 3.3, p97: 4.4 },
            { month: 1, p3: 3.4, p50: 4.5, p97: 5.8 },
            { month: 2, p3: 4.3, p50: 5.6, p97: 7.1 },
            { month: 3, p3: 5.0, p50: 6.4, p97: 8.0 },
            { month: 4, p3: 5.6, p50: 7.0, p97: 8.7 },
            { month: 5, p3: 6.1, p50: 7.5, p97: 9.3 },
            { month: 6, p3: 6.4, p50: 7.9, p97: 9.8 },
            { month: 7, p3: 6.7, p50: 8.3, p97: 10.3 },
            { month: 8, p3: 7.0, p50: 8.6, p97: 10.7 },
            { month: 9, p3: 7.2, p50: 8.9, p97: 11.0 },
            { month: 10, p3: 7.5, p50: 9.2, p97: 11.4 },
            { month: 11, p3: 7.7, p50: 9.4, p97: 11.7 },
            { month: 12, p3: 7.8, p50: 9.6, p97: 12.0 },
            { month: 15, p3: 8.4, p50: 10.3, p97: 12.8 },
            { month: 18, p3: 8.8, p50: 10.9, p97: 13.7 },
            { month: 21, p3: 9.2, p50: 11.5, p97: 14.5 },
            { month: 24, p3: 9.7, p50: 12.2, p97: 15.3 },
            { month: 30, p3: 10.7, p50: 13.3, p97: 16.8 },
            { month: 36, p3: 11.6, p50: 14.3, p97: 18.3 },
            { month: 42, p3: 12.4, p50: 15.3, p97: 19.7 },
            { month: 48, p3: 13.2, p50: 16.3, p97: 21.2 },
            { month: 54, p3: 14.0, p50: 17.3, p97: 22.7 },
            { month: 60, p3: 14.8, p50: 18.3, p97: 24.2 }
        ],
        height: [
            { month: 0, p3: 46.3, p50: 49.9, p97: 53.4 },
            { month: 1, p3: 50.8, p50: 54.7, p97: 58.6 },
            { month: 2, p3: 54.4, p50: 58.4, p97: 62.4 },
            { month: 3, p3: 57.3, p50: 61.4, p97: 65.5 },
            { month: 4, p3: 59.7, p50: 63.9, p97: 68.0 },
            { month: 5, p3: 61.7, p50: 65.9, p97: 70.1 },
            { month: 6, p3: 63.3, p50: 67.6, p97: 71.9 },
            { month: 7, p3: 64.8, p50: 69.2, p97: 73.5 },
            { month: 8, p3: 66.2, p50: 70.6, p97: 75.0 },
            { month: 9, p3: 67.5, p50: 72.0, p97: 76.5 },
            { month: 10, p3: 68.7, p50: 73.3, p97: 77.9 },
            { month: 11, p3: 69.9, p50: 74.5, p97: 79.2 },
            { month: 12, p3: 71.0, p50: 75.7, p97: 80.5 },
            { month: 15, p3: 74.1, p50: 79.1, p97: 84.2 },
            { month: 18, p3: 76.9, p50: 82.3, p97: 87.7 },
            { month: 21, p3: 79.4, p50: 85.1, p97: 90.9 },
            { month: 24, p3: 81.7, p50: 87.8, p97: 93.9 },
            { month: 30, p3: 86.4, p50: 92.8, p97: 99.3 },
            { month: 36, p3: 90.3, p50: 96.9, p97: 103.5 },
            { month: 42, p3: 93.8, p50: 100.6, p97: 107.5 },
            { month: 48, p3: 97.0, p50: 104.0, p97: 111.1 },
            { month: 54, p3: 100.0, p50: 107.2, p97: 114.6 },
            { month: 60, p3: 102.8, p50: 110.3, p97: 117.9 }
        ],
        bmi: [
            { month: 0, p3: 11.2, p50: 13.4, p97: 15.7 },
            { month: 1, p3: 12.8, p50: 14.9, p97: 17.3 },
            { month: 2, p3: 13.7, p50: 16.3, p97: 18.9 },
            { month: 3, p3: 14.2, p50: 16.8, p97: 19.5 },
            { month: 4, p3: 14.4, p50: 17.0, p97: 19.7 },
            { month: 5, p3: 14.5, p50: 17.1, p97: 19.8 },
            { month: 6, p3: 14.5, p50: 17.1, p97: 19.8 },
            { month: 7, p3: 14.4, p50: 17.0, p97: 19.7 },
            { month: 8, p3: 14.3, p50: 16.9, p97: 19.6 },
            { month: 9, p3: 14.2, p50: 16.8, p97: 19.4 },
            { month: 10, p3: 14.2, p50: 16.7, p97: 19.3 },
            { month: 11, p3: 14.1, p50: 16.6, p97: 19.2 },
            { month: 12, p3: 14.0, p50: 16.5, p97: 19.1 },
            { month: 15, p3: 13.8, p50: 16.3, p97: 18.8 },
            { month: 18, p3: 13.6, p50: 16.0, p97: 18.6 },
            { month: 21, p3: 13.5, p50: 15.8, p97: 18.4 },
            { month: 24, p3: 13.4, p50: 15.7, p97: 18.3 },
            { month: 30, p3: 13.2, p50: 15.4, p97: 18.0 },
            { month: 36, p3: 13.0, p50: 15.2, p97: 17.8 },
            { month: 42, p3: 12.9, p50: 15.1, p97: 17.7 },
            { month: 48, p3: 12.8, p50: 15.0, p97: 17.7 },
            { month: 54, p3: 12.7, p50: 15.0, p97: 17.8 },
            { month: 60, p3: 12.6, p50: 15.0, p97: 17.9 }
        ]
    },
    girl: {
        weight: [
            { month: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
            { month: 1, p3: 3.2, p50: 4.2, p97: 5.5 },
            { month: 2, p3: 4.0, p50: 5.1, p97: 6.6 },
            { month: 3, p3: 4.6, p50: 5.8, p97: 7.5 },
            { month: 4, p3: 5.1, p50: 6.4, p97: 8.2 },
            { month: 5, p3: 5.5, p50: 6.9, p97: 8.8 },
            { month: 6, p3: 5.8, p50: 7.3, p97: 9.3 },
            { month: 7, p3: 6.1, p50: 7.6, p97: 9.8 },
            { month: 8, p3: 6.3, p50: 7.9, p97: 10.2 },
            { month: 9, p3: 6.6, p50: 8.2, p97: 10.5 },
            { month: 10, p3: 6.8, p50: 8.5, p97: 10.9 },
            { month: 11, p3: 7.0, p50: 8.7, p97: 11.2 },
            { month: 12, p3: 7.1, p50: 8.9, p97: 11.5 },
            { month: 15, p3: 7.6, p50: 9.6, p97: 12.4 },
            { month: 18, p3: 8.1, p50: 10.2, p97: 13.2 },
            { month: 21, p3: 8.6, p50: 10.9, p97: 14.0 },
            { month: 24, p3: 9.0, p50: 11.5, p97: 14.8 },
            { month: 30, p3: 10.0, p50: 12.6, p97: 16.3 },
            { month: 36, p3: 10.9, p50: 13.9, p97: 18.1 },
            { month: 42, p3: 11.7, p50: 15.0, p97: 19.7 },
            { month: 48, p3: 12.5, p50: 16.1, p97: 21.3 },
            { month: 54, p3: 13.3, p50: 17.2, p97: 22.9 },
            { month: 60, p3: 14.1, p50: 18.2, p97: 24.6 }
        ],
        height: [
            { month: 0, p3: 45.6, p50: 49.1, p97: 52.7 },
            { month: 1, p3: 49.8, p50: 53.7, p97: 57.6 },
            { month: 2, p3: 53.0, p50: 57.1, p97: 61.1 },
            { month: 3, p3: 55.6, p50: 59.8, p97: 64.0 },
            { month: 4, p3: 57.8, p50: 62.1, p97: 66.4 },
            { month: 5, p3: 59.6, p50: 64.0, p97: 68.5 },
            { month: 6, p3: 61.2, p50: 65.7, p97: 70.3 },
            { month: 7, p3: 62.7, p50: 67.3, p97: 71.9 },
            { month: 8, p3: 64.0, p50: 68.7, p97: 73.5 },
            { month: 9, p3: 65.3, p50: 70.1, p97: 75.0 },
            { month: 10, p3: 66.5, p50: 71.5, p97: 76.4 },
            { month: 11, p3: 67.7, p50: 72.8, p97: 77.8 },
            { month: 12, p3: 68.9, p50: 74.0, p97: 79.2 },
            { month: 15, p3: 72.0, p50: 77.5, p97: 83.0 },
            { month: 18, p3: 74.9, p50: 80.7, p97: 86.5 },
            { month: 21, p3: 77.5, p50: 83.6, p97: 89.6 },
            { month: 24, p3: 80.0, p50: 86.4, p97: 92.9 },
            { month: 30, p3: 84.8, p50: 91.4, p97: 98.0 },
            { month: 36, p3: 88.8, p50: 95.6, p97: 102.5 },
            { month: 42, p3: 92.3, p50: 99.4, p97: 106.6 },
            { month: 48, p3: 95.6, p50: 102.9, p97: 110.3 },
            { month: 54, p3: 98.6, p50: 106.2, p97: 113.9 },
            { month: 60, p3: 101.4, p50: 109.4, p97: 117.4 }
        ],
        bmi: [
            { month: 0, p3: 11.0, p50: 13.3, p97: 15.5 },
            { month: 1, p3: 12.5, p50: 14.6, p97: 17.0 },
            { month: 2, p3: 13.4, p50: 15.8, p97: 18.5 },
            { month: 3, p3: 13.8, p50: 16.3, p97: 19.1 },
            { month: 4, p3: 14.0, p50: 16.5, p97: 19.3 },
            { month: 5, p3: 14.0, p50: 16.6, p97: 19.4 },
            { month: 6, p3: 14.0, p50: 16.5, p97: 19.4 },
            { month: 7, p3: 13.9, p50: 16.4, p97: 19.3 },
            { month: 8, p3: 13.8, p50: 16.3, p97: 19.2 },
            { month: 9, p3: 13.8, p50: 16.2, p97: 19.1 },
            { month: 10, p3: 13.7, p50: 16.1, p97: 19.0 },
            { month: 11, p3: 13.6, p50: 16.0, p97: 18.9 },
            { month: 12, p3: 13.5, p50: 15.9, p97: 18.7 },
            { month: 15, p3: 13.3, p50: 15.6, p97: 18.4 },
            { month: 18, p3: 13.1, p50: 15.4, p97: 18.2 },
            { month: 21, p3: 13.0, p50: 15.2, p97: 18.0 },
            { month: 24, p3: 12.9, p50: 15.0, p97: 17.8 },
            { month: 30, p3: 12.7, p50: 14.9, p97: 17.6 },
            { month: 36, p3: 12.6, p50: 14.8, p97: 17.5 },
            { month: 42, p3: 12.5, p50: 14.8, p97: 17.5 },
            { month: 48, p3: 12.4, p50: 14.8, p97: 17.6 },
            { month: 54, p3: 12.3, p50: 14.8, p97: 17.7 },
            { month: 60, p3: 12.2, p50: 14.8, p97: 17.9 }
        ]
    }
};

// Calculate BMI: weight (kg) / (height (m))^2
function calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return Number((weightKg / (heightM * heightM)).toFixed(1));
}

// Calculate growth status based on BMI and age
function determineGrowthStatus(bmi, ageMonths, gender) {
    const normGender = String(gender).toLowerCase().includes('boy') || String(gender).toLowerCase().includes('nam') || String(gender).toLowerCase() === 'male' ? 'boy' : 'girl';
    const bmiData = WHO_STANDARDS[normGender].bmi;
    
    // Find closest WHO age data
    let ref = bmiData.find(d => d.month === ageMonths);
    if (!ref) {
        ref = bmiData.reduce((prev, curr) => 
            Math.abs(curr.month - ageMonths) < Math.abs(prev.month - ageMonths) ? curr : prev
        );
    }

    if (bmi < ref.p3) {
        return 'Underweight';
    } else if (bmi > ref.p97) {
        return 'Overweight';
    } else {
        return 'Healthy Growth';
    }
}

// Helper to calculate age in months from birth date & record date
function getAgeInMonths(dateOfBirth, recordDate) {
    if (!dateOfBirth || !recordDate) return 0;
    const dob = new Date(dateOfBirth);
    const rec = new Date(recordDate);
    
    let months = (rec.getFullYear() - dob.getFullYear()) * 12 + (rec.getMonth() - dob.getMonth());
    if (rec.getDate() < dob.getDate()) {
        months -= 1;
    }
    return Math.max(0, months);
}

// ==========================================
// GET /api/children/:childId/growth
// ==========================================
exports.getGrowthRecords = async (req, res) => {
    try {
        await ensureGrowthTable();
        const { childId } = req.params;

        // 1. Fetch child profile
        const [childRows] = await db.query(
            `SELECT id, name, date_of_birth AS dateOfBirth, gender, weight, height FROM child_profiles WHERE id = ?`,
            [childId]
        );

        if (childRows.length === 0) {
            return res.status(404).json({ message: "Child profile not found." });
        }

        const child = childRows[0];
        const genderKey = String(child.gender).toLowerCase().includes('boy') || String(child.gender).toLowerCase().includes('nam') || String(child.gender).toLowerCase() === 'male' ? 'boy' : 'girl';

        // 2. Fetch growth records
        const [records] = await db.query(
            `SELECT id, child_id AS childId, record_date AS recordDate, weight, height, head_circumference AS headCircumference, bmi, status, notes, created_at AS createdAt
             FROM child_growth_records
             WHERE child_id = ?
             ORDER BY record_date ASC`,
            [childId]
        );

        // Map records with calculated ageInMonths
        const mappedRecords = records.map(rec => {
            const ageMonths = getAgeInMonths(child.dateOfBirth, rec.recordDate);
            return {
                ...rec,
                ageMonths,
                recordDate: String(rec.recordDate).slice(0, 10),
            };
        });

        // 3. Compute latest status
        const latestRecord = mappedRecords.length > 0 ? mappedRecords[mappedRecords.length - 1] : null;
        const currentBMI = latestRecord ? latestRecord.bmi : calculateBMI(child.weight, child.height);
        const currentAgeMonths = getAgeInMonths(child.dateOfBirth, new Date().toISOString().slice(0, 10));
        const currentStatus = latestRecord ? latestRecord.status : determineGrowthStatus(currentBMI, currentAgeMonths, child.gender);

        return res.json({
            child: {
                id: child.id,
                name: child.name,
                dateOfBirth: child.dateOfBirth ? String(child.dateOfBirth).slice(0, 10) : null,
                gender: child.gender,
                currentWeight: child.weight,
                currentHeight: child.height,
                currentBMI,
                currentAgeMonths,
                growthStatus: currentStatus,
            },
            whoStandards: WHO_STANDARDS[genderKey],
            records: mappedRecords,
        });
    } catch (err) {
        console.error("getGrowthRecords error:", err);
        return res.status(500).json({ message: "Failed to fetch growth records" });
    }
};

// ==========================================
// POST /api/children/:childId/growth
// ==========================================
exports.addGrowthRecord = async (req, res) => {
    try {
        await ensureGrowthTable();
        const { childId } = req.params;
        const { recordDate, weight, height, headCircumference, notes } = req.body;

        if (!recordDate || !weight || !height) {
            return res.status(400).json({ message: "recordDate, weight, and height are required." });
        }

        const [childRows] = await db.query(
            `SELECT id, date_of_birth AS dateOfBirth, gender FROM child_profiles WHERE id = ?`,
            [childId]
        );

        if (childRows.length === 0) {
            return res.status(404).json({ message: "Child profile not found." });
        }

        const child = childRows[0];
        const normalizedDate = String(recordDate).slice(0, 10);
        const weightKg = Number(weight);
        const heightCm = Number(height);
        const headCm = headCircumference ? Number(headCircumference) : null;
        
        const bmi = calculateBMI(weightKg, heightCm);
        const ageMonths = getAgeInMonths(child.dateOfBirth, normalizedDate);
        const status = determineGrowthStatus(bmi, ageMonths, child.gender);

        const [result] = await db.query(
            `INSERT INTO child_growth_records (child_id, record_date, weight, height, head_circumference, bmi, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [childId, normalizedDate, weightKg, heightCm, headCm, bmi, status, notes || null]
        );

        // Update child_profiles with latest stats if this is the newest date
        const [latestRows] = await db.query(
            `SELECT record_date FROM child_growth_records WHERE child_id = ? ORDER BY record_date DESC LIMIT 1`,
            [childId]
        );

        if (latestRows.length > 0 && String(latestRows[0].record_date).slice(0, 10) === normalizedDate) {
            await db.query(
                `UPDATE child_profiles SET weight = ?, height = ? WHERE id = ?`,
                [weightKg, heightCm, childId]
            );
        }

        return res.status(201).json({
            id: result.insertId,
            childId: Number(childId),
            recordDate: normalizedDate,
            weight: weightKg,
            height: heightCm,
            headCircumference: headCm,
            bmi,
            status,
            notes: notes || null,
            ageMonths,
        });
    } catch (err) {
        console.error("addGrowthRecord error:", err);
        return res.status(500).json({ message: "Failed to add growth record" });
    }
};

// ==========================================
// PUT /api/children/:childId/growth/:recordId
// ==========================================
exports.updateGrowthRecord = async (req, res) => {
    try {
        const { childId, recordId } = req.params;
        const { recordDate, weight, height, headCircumference, notes } = req.body;

        const [childRows] = await db.query(
            `SELECT id, date_of_birth AS dateOfBirth, gender FROM child_profiles WHERE id = ?`,
            [childId]
        );

        if (childRows.length === 0) {
            return res.status(404).json({ message: "Child profile not found." });
        }

        const child = childRows[0];
        const normalizedDate = String(recordDate).slice(0, 10);
        const weightKg = Number(weight);
        const heightCm = Number(height);
        const headCm = headCircumference ? Number(headCircumference) : null;

        const bmi = calculateBMI(weightKg, heightCm);
        const ageMonths = getAgeInMonths(child.dateOfBirth, normalizedDate);
        const status = determineGrowthStatus(bmi, ageMonths, child.gender);

        await db.query(
            `UPDATE child_growth_records 
             SET record_date = ?, weight = ?, height = ?, head_circumference = ?, bmi = ?, status = ?, notes = ?
             WHERE id = ? AND child_id = ?`,
            [normalizedDate, weightKg, heightCm, headCm, bmi, status, notes || null, recordId, childId]
        );

        // Update child_profiles if this is the newest record
        const [latestRows] = await db.query(
            `SELECT record_date, weight, height FROM child_growth_records WHERE child_id = ? ORDER BY record_date DESC LIMIT 1`,
            [childId]
        );

        if (latestRows.length > 0) {
            await db.query(
                `UPDATE child_profiles SET weight = ?, height = ? WHERE id = ?`,
                [latestRows[0].weight, latestRows[0].height, childId]
            );
        }

        return res.json({
            id: Number(recordId),
            childId: Number(childId),
            recordDate: normalizedDate,
            weight: weightKg,
            height: heightCm,
            headCircumference: headCm,
            bmi,
            status,
            notes: notes || null,
            ageMonths,
        });
    } catch (err) {
        console.error("updateGrowthRecord error:", err);
        return res.status(500).json({ message: "Failed to update growth record" });
    }
};

// ==========================================
// DELETE /api/children/:childId/growth/:recordId
// ==========================================
exports.deleteGrowthRecord = async (req, res) => {
    try {
        const { childId, recordId } = req.params;

        await db.query(
            `DELETE FROM child_growth_records WHERE id = ? AND child_id = ?`,
            [recordId, childId]
        );

        // Update child_profiles with latest remaining record if available
        const [latestRows] = await db.query(
            `SELECT weight, height FROM child_growth_records WHERE child_id = ? ORDER BY record_date DESC LIMIT 1`,
            [childId]
        );

        if (latestRows.length > 0) {
            await db.query(
                `UPDATE child_profiles SET weight = ?, height = ? WHERE id = ?`,
                [latestRows[0].weight, latestRows[0].height, childId]
            );
        }

        return res.json({ message: "Growth record deleted successfully" });
    } catch (err) {
        console.error("deleteGrowthRecord error:", err);
        return res.status(500).json({ message: "Failed to delete growth record" });
    }
};
