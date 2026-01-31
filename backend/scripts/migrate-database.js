require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../blinkist.db');

console.log('🔄 Starting database migration...');
console.log('Database path:', DB_PATH);
console.log('═══════════════════════════════════════');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to database');
  }
});

// Promisify database methods
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function migrateDatabase() {
  try {
    // 1. Create users table
    console.log('📋 Creating users table...');
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

    // 2. Check if books table exists
    const booksTableExists = await get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='books'
    `);

    if (booksTableExists) {
      // Add PDF columns to books if they don't exist
      console.log('📋 Updating books table...');
      
      const columnsToAdd = [
        'pdfPath TEXT',
        'pdfFileName TEXT',
        'pdfSize INTEGER',
        'pageCount INTEGER DEFAULT 0'
      ];

      for (const column of columnsToAdd) {
        const columnName = column.split(' ')[0];
        try {
          await run(`ALTER TABLE books ADD COLUMN ${column}`);
          console.log(`✅ Added column: books.${columnName}`);
        } catch (err) {
          if (err.message.includes('duplicate column')) {
            console.log(`✓  Column exists: books.${columnName}`);
          } else {
            console.log(`⚠️  Skip column: books.${columnName}`);
          }
        }
      }
    }

    // 3. Check if chapters table exists
    const chaptersTableExists = await get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='chapters'
    `);

    if (chaptersTableExists) {
      // Add PDF columns to chapters if they don't exist
      console.log('📋 Updating chapters table...');
      
      const columnsToAdd = [
        'pdfPath TEXT',
        'pdfFileName TEXT',
        'pdfSize INTEGER'
      ];

      for (const column of columnsToAdd) {
        const columnName = column.split(' ')[0];
        try {
          await run(`ALTER TABLE chapters ADD COLUMN ${column}`);
          console.log(`✅ Added column: chapters.${columnName}`);
        } catch (err) {
          if (err.message.includes('duplicate column')) {
            console.log(`✓  Column exists: chapters.${columnName}`);
          } else {
            console.log(`⚠️  Skip column: chapters.${columnName}`);
          }
        }
      }
    }

    // 4. Create default admin if not exists
    console.log('📋 Checking admin user...');
    const adminExists = await get('SELECT * FROM users WHERE role = ?', ['admin']);

    if (!adminExists) {
      console.log('📋 Creating default admin user...');
      
      const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
      const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@bookblinks.com';
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await run(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, 'admin')
      `, [username, email, hashedPassword]);

      console.log('✅ Admin user created');
      console.log('═══════════════════════════════════════');
      console.log(`Username: ${username}`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('═══════════════════════════════════════');
    } else {
      console.log('✓  Admin user already exists');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ Migration completed successfully!');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
