const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - will persist in Railway volume
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'blinkist.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', DB_PATH);
  }
});

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    // ============================================
    // USERS TABLE
    // ============================================
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
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('✅ Users table ready');
      }
    });

    // ============================================
    // BOOKS TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT,
        coverImage TEXT,
        category TEXT,
        totalChapters INTEGER DEFAULT 0,
        pdfPath TEXT,
        pdfFileName TEXT,
        pdfSize INTEGER,
        pageCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating books table:', err.message);
      } else {
        console.log('✅ Books table ready');
      }
    });

    // ============================================
    // CHAPTERS TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookId INTEGER NOT NULL,
        chapterNumber INTEGER NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        readTimeMinutes INTEGER DEFAULT 5,
        pdfPath TEXT,
        pdfFileName TEXT,
        pdfSize INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE(bookId, chapterNumber)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating chapters table:', err.message);
      } else {
        console.log('✅ Chapters table ready');
      }
    });

    // ============================================
    // FAVORITES TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        bookId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE(deviceId, bookId)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating favorites table:', err.message);
      } else {
        console.log('✅ Favorites table ready');
      }
    });

    // ============================================
    // READING PROGRESS TABLE
    // ============================================
    db.run(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        bookId INTEGER NOT NULL,
        chaptersRead TEXT DEFAULT '[]',
        lastReadChapter INTEGER DEFAULT 0,
        percentComplete REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE(deviceId, bookId)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating reading_progress table:', err.message);
      } else {
        console.log('✅ Reading progress table ready');
      }
    });
  });

  console.log('✅ Database tables initialized successfully');
};

// Helper function to run queries
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Helper function to get single row
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Get error:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to run insert/update/delete
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Run error:', err.message);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  query,
  get,
  run,
};
