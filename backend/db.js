require("dotenv").config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    dateStrings: true,
});

async function ensureColumn(connection, tableName, columnName, definition) {
    try {
        const [rows] = await connection.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [process.env.DB_NAME, tableName, columnName]
        );
        if (rows.length === 0) {
            await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
            console.log(`[DB] Added column ${columnName} to ${tableName}`);
        }
    } catch (err) {
        console.warn(`[DB] Notice checking column ${tableName}.${columnName}:`, err.message);
    }
}

async function testDatabaseConnection() {
    const connection = await pool.getConnection();

    try {
        await connection.query('SELECT 1');
        console.log('MySQL connected successfully.');

        // 1. Ensure lookup tables exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS meal_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE
            )
        `);
        await connection.query(`
            INSERT IGNORE INTO meal_types (id, name) VALUES
            (1, 'Breakfast'), (2, 'Lunch'), (3, 'Dinner'), (4, 'Snack')
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS weaning_methods (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE
            )
        `);
        await connection.query(`
            INSERT IGNORE INTO weaning_methods (id, name) VALUES
            (1, 'Puree'), (2, 'Mashed'), (3, 'Baby-Led Weaning'), (4, 'Finger Food')
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS dietary_needs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE
            )
        `);
        await connection.query(`
            INSERT IGNORE INTO dietary_needs (id, name) VALUES
            (1, 'Dairy-Free'), (2, 'Gluten-Free'), (3, 'Egg-Free'), (4, 'Nut-Free'), (5, 'Vegetarian')
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS occasions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE
            )
        `);
        await connection.query(`
            INSERT IGNORE INTO occasions (id, name) VALUES
            (1, 'Everyday'), (2, 'First Foods'), (3, 'Meal Prep'), (4, 'On-the-Go'), (5, 'Special Occasion')
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS article_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE
            )
        `);
        await connection.query(`
            INSERT IGNORE INTO article_categories (id, name) VALUES
            (1, 'Nutrition Tips'), (2, 'Weaning Guide'), (3, 'Recipes & Meals'), (4, 'Health & Safety'), (5, 'Development')
        `);

        // 2. Ensure columns in recipes table
        await ensureColumn(connection, 'recipes', 'weaning_method', 'VARCHAR(100) DEFAULT NULL');
        await ensureColumn(connection, 'recipes', 'dietary_needs', 'VARCHAR(100) DEFAULT NULL');
        await ensureColumn(connection, 'recipes', 'occasion', 'VARCHAR(100) DEFAULT NULL');
        await ensureColumn(connection, 'recipes', 'weaning_method_id', 'INT DEFAULT NULL');
        await ensureColumn(connection, 'recipes', 'dietary_needs_id', 'INT DEFAULT NULL');
        await ensureColumn(connection, 'recipes', 'occasion_id', 'INT DEFAULT NULL');
        await ensureColumn(connection, 'recipes', 'cooking_time', 'INT DEFAULT 15');
        await ensureColumn(connection, 'recipes', 'prep_time', 'INT DEFAULT 10');
        await ensureColumn(connection, 'recipes', 'serves', 'INT DEFAULT 1');
        await ensureColumn(connection, 'recipes', 'protein', 'INT DEFAULT 0');
        await ensureColumn(connection, 'recipes', 'fat', 'INT DEFAULT 0');
        await ensureColumn(connection, 'recipes', 'carbohydrate', 'INT DEFAULT 0');

        // 3. Ensure columns in articles table
        await ensureColumn(connection, 'articles', 'category', 'VARCHAR(100) DEFAULT NULL');
        await ensureColumn(connection, 'articles', 'category_id', 'INT DEFAULT NULL');
        await ensureColumn(connection, 'articles', 'target_age', 'VARCHAR(50) DEFAULT NULL');
        await ensureColumn(connection, 'articles', 'reading_time', 'VARCHAR(50) DEFAULT NULL');
        await ensureColumn(connection, 'articles', 'tags', 'VARCHAR(500) DEFAULT NULL');

        // 4. Ensure recipe_steps has image_url
        await ensureColumn(connection, 'recipe_steps', 'image_url', 'VARCHAR(500) DEFAULT NULL');

        // 5. Ensure caregiver & chat tables exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS child_caregivers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                child_id INT NOT NULL,
                user_id INT NOT NULL,
                permission ENUM('owner','editor') NOT NULL DEFAULT 'editor',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_child_user (child_id, user_id),
                FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            INSERT IGNORE INTO child_caregivers (child_id, user_id, permission)
            SELECT id, parent_id, 'owner' FROM child_profiles WHERE parent_id IS NOT NULL
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                parent_id INT NOT NULL,
                expert_id INT NOT NULL,
                status ENUM('active','ended') DEFAULT 'active',
                last_message TEXT,
                last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                conversation_id INT NOT NULL,
                sender_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS chat_ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                conversation_id INT NOT NULL,
                parent_id INT NOT NULL,
                rating TINYINT NOT NULL,
                review TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

    } catch (err) {
        console.warn('[DB] Auto-migration error:', err.message);
    } finally {
        connection.release();
    }
}

module.exports = pool;
module.exports.testDatabaseConnection = testDatabaseConnection;