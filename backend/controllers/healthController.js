// @ts-nocheck

const pool = require('../db');

async function getHealth(req, res) {
    try {
        const [rows] = await pool.query(
            'SELECT DATABASE() AS databaseName, NOW() AS serverTime',
        );

        return res.status(200).json({
            success: true,
            message: 'BabyNutri backend is running.',
            data: rows[0],
        });
    } catch (error) {
        console.error('Health check error:', error);

        return res.status(500).json({
            success: false,
            message: 'Database connection failed.',
        });
    }
}

module.exports = {
    getHealth,
};