const db = require('./db');

async function createTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS child_invitation_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        child_id INT NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        status ENUM('active', 'used', 'expired') DEFAULT 'active',
        created_by INT NOT NULL,
        used_by INT NULL,
        used_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('child_invitation_codes table created successfully!');
  process.exit(0);
}

createTable().catch((err) => {
  console.error('Error creating table:', err);
  process.exit(1);
});
