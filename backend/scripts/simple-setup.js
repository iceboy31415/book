// Simple setup script for production
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../blinkist.db');

const db = new sqlite3.Database(DB_PATH);

db.serialize(async () => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, async (err) => {
    if (err) {
      console.error('Error creating users table:', err);
      return;
    }

    // Check if admin exists
    db.get('SELECT * FROM users LIMIT 1', async (err, row) => {
      if (err) {
        console.error('Error checking users:', err);
        return;
      }

      if (!row) {
        // Create admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        db.run(`
          INSERT INTO users (username, email, password, role)
          VALUES (?, ?, ?, 'admin')
        `, ['admin', 'admin@bookblinks.com', hashedPassword], (err) => {
          if (err) {
            console.error('Error creating admin:', err);
          } else {
            console.log('✅ Admin created: admin / admin123');
          }
          db.close();
        });
      } else {
        console.log('✅ Admin already exists');
        db.close();
      }
    });
  });
});
