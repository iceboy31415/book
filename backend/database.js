const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'blinkist.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Books table
    db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT,
        coverImage TEXT,
        category TEXT,
        totalChapters INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chapters/Blinks table
    db.run(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookId INTEGER NOT NULL,
        chapterNumber INTEGER NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        readTimeMinutes INTEGER DEFAULT 5,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
      )
    `);

    // Favorites table
    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        bookId INTEGER NOT NULL,
        savedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE(deviceId, bookId)
      )
    `);

    // Reading Progress table
    db.run(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        bookId INTEGER NOT NULL,
        chaptersRead TEXT DEFAULT '[]',
        lastReadChapter INTEGER,
        percentComplete REAL DEFAULT 0,
        completedAt DATETIME,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE(deviceId, bookId)
      )
    `);

    console.log('Database tables initialized successfully');
  });
};

// Helper functions for database operations
const dbHelpers = {
  // Generic query function
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Generic get function
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Generic run function
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

module.exports = { db, initializeDatabase, dbHelpers };
