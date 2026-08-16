const db = require('./db');

async function createQnaMessagesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS qna_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        sender_id INT NOT NULL,
        sender_role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Successfully created qna_messages table");

    // Insert sample message if question 1 exists
    await db.query(`
      INSERT IGNORE INTO qna_messages (id, question_id, sender_id, sender_role, content)
      VALUES (1, 1, 2, 'expert', 'Yes, yogurt is safe for babies over 6 months.');
    `);
    console.log("Sample chat message inserted");
  } catch (err) {
    console.error("Error creating qna_messages table:", err);
  } finally {
    process.exit(0);
  }
}

createQnaMessagesTable();
