require('dotenv').config();
const { db, run, get, query } = require('../database');

async function migrateDatabase() {
  console.log('🔄 Starting database migration...');
  console.log('═══════════════════════════════════════');

  try {
    // Check if users table exists
    const tableExists = await get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);

    if (!tableExists) {
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
      
      console.log('✅ Users table created');
    } else {
      console.log('✅ Users table already exists');
    }

    // Check and add missing columns to books table
    console.log('📋 Checking books table columns...');
    
    const booksColumns = [
      { name: 'pdfPath', type: 'TEXT' },
      { name: 'pdfFileName', type: 'TEXT' },
      { name: 'pdfSize', type: 'INTEGER' },
      { name: 'pageCount', type: 'INTEGER DEFAULT 0' }
    ];

    for (const column of booksColumns) {
      try {
        await run(`ALTER TABLE books ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Added column: books.${column.name}`);
      } catch (err) {
        if (err.message.includes('duplicate column')) {
          console.log(`✓  Column already exists: books.${column.name}`);
        } else {
          throw err;
        }
      }
    }

    // Check and add missing columns to chapters table
    console.log('📋 Checking chapters table columns...');
    
    const chaptersColumns = [
      { name: 'pdfPath', type: 'TEXT' },
      { name: 'pdfFileName', type: 'TEXT' },
      { name: 'pdfSize', type: 'INTEGER' }
    ];

    for (const column of chaptersColumns) {
      try {
        await run(`ALTER TABLE chapters ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Added column: chapters.${column.name}`);
      } catch (err) {
        if (err.message.includes('duplicate column')) {
          console.log(`✓  Column already exists: chapters.${column.name}`);
        } else {
          throw err;
        }
      }
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ Database migration completed successfully!');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDatabase().then(() => {
  console.log('Done!');
  process.exit(0);
});
