// @ts-nocheck
const db = require("../db");

const DEFAULT_SETTINGS = {
    useMetric: true,
    weightUnit: "kg",
    volumeUnit: "ml",
    lengthUnit: "cm",
    temperatureUnit: "C",
};

const ALLOWED_UNITS = {
    weightUnit: ["kg", "lb"],
    volumeUnit: ["ml", "us_fl_oz", "uk_fl_oz"],
    lengthUnit: ["cm", "in"],
    temperatureUnit: ["C", "F"],
};

function toResponseShape(row) {
    return {
        useMetric: !!row.use_metric,
        weightUnit: row.weight_unit,
        volumeUnit: row.volume_unit,
        lengthUnit: row.length_unit,
        temperatureUnit: row.temperature_unit,
    };
}

// ==========================================
// GET /api/measurement-settings
// ==========================================
exports.getMeasurementSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query(
            `
            SELECT use_metric, weight_unit, volume_unit, length_unit, temperature_unit
            FROM measurement_settings
            WHERE user_id = ?
            `,
            [userId]
        );

        if (rows.length === 0) {
            return res.json(DEFAULT_SETTINGS);
        }

        return res.json(toResponseShape(rows[0]));
    } catch (err) {
        console.error("getMeasurementSettings error:", err);
        return res.status(500).json({
            message: "Failed to fetch measurement settings",
        });
    }
};

// ==========================================
// PUT /api/measurement-settings
// ==========================================
exports.updateMeasurementSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            useMetric = DEFAULT_SETTINGS.useMetric,
            weightUnit = DEFAULT_SETTINGS.weightUnit,
            volumeUnit = DEFAULT_SETTINGS.volumeUnit,
            lengthUnit = DEFAULT_SETTINGS.lengthUnit,
            temperatureUnit = DEFAULT_SETTINGS.temperatureUnit,
        } = req.body;

        for (const [field, allowedValues] of Object.entries(ALLOWED_UNITS)) {
            const value = req.body[field] ?? DEFAULT_SETTINGS[field];

            if (!allowedValues.includes(value)) {
                return res.status(400).json({
                    message: `Invalid value for ${field}.`,
                    allowedValues,
                });
            }
        }

        await db.query(
            `
            INSERT INTO measurement_settings
                (user_id, use_metric, weight_unit, volume_unit, length_unit, temperature_unit)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                use_metric = VALUES(use_metric),
                weight_unit = VALUES(weight_unit),
                volume_unit = VALUES(volume_unit),
                length_unit = VALUES(length_unit),
                temperature_unit = VALUES(temperature_unit)
            `,
            [
                userId,
                !!useMetric,
                weightUnit,
                volumeUnit,
                lengthUnit,
                temperatureUnit,
            ]
        );

        return res.json({
            useMetric: !!useMetric,
            weightUnit,
            volumeUnit,
            lengthUnit,
            temperatureUnit,
        });
    } catch (err) {
        console.error("updateMeasurementSettings error:", err);
        return res.status(500).json({
            message: "Failed to update measurement settings",
        });
    }
};
