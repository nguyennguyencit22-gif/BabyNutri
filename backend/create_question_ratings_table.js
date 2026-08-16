const db = require('./db');

async function createQuestionRatingsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS question_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_question_rating (question_id, user_id),
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Successfully created question_ratings table");

    await db.query(`
      INSERT IGNORE INTO question_ratings (question_id, user_id, rating, review)
      VALUES (1, 3, 5, 'Very helpful answer from doctor!');
    `);
    console.log("Sample question rating inserted");
  } catch (err) {
    console.error("Error creating question_ratings table:", err);
  } finally {
    process.exit(0);
  }
}

createQuestionRatingsTable();
