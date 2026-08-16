const db = require('./db');

async function createTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS article_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_article_rating (article_id, user_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS article_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('article_ratings & article_comments tables created successfully!');
  process.exit(0);
}

createTables().catch((err) => {
  console.error('Error creating article rating/comment tables:', err);
  process.exit(1);
});
