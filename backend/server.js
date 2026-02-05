require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

// Import routes
const booksRoutes = require('./routes/books');
const chaptersRoutes = require('./routes/chapters');
const favoritesRoutes = require('./routes/favorites');
const progressRoutes = require('./routes/progress');
const utilityRoutes = require('./routes/utility');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');

const { initializeDatabase, run, get } = require('./database');

const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'https://ikda-mi.netlify.app',
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Initialize database
initializeDatabase();

// Auto-create admin user (improved)
setTimeout(async () => {
  try {
    const bcrypt = require('bcryptjs');
    
    const adminExists = await get('SELECT * FROM users WHERE role = ?', ['admin']).catch(() => null);
    
    if (!adminExists) {
      console.log('📋 Creating default admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await run(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, 'admin')
      `, ['admin', 'admin@bookblinks.com', hashedPassword]);
      
      console.log('✅ Admin user created');
      console.log('═══════════════════════════════════════');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('═══════════════════════════════════════');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.log('⚠️  Admin creation skipped:', err.message);
  }
}, 5000); // Increased to 5 seconds

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', utilityRoutes);

// ============================================
// ROOT & HEALTH ENDPOINTS
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BookBlinks API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      setup: '/api/setup-admin-now',
      auth: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
        logout: 'POST /api/auth/logout',
      },
      books: '/api/books',
      chapters: '/api/chapters',
      upload: '/api/upload',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BookBlinks API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// SETUP ADMIN ENDPOINT (TEMPORARY)
// ============================================
app.get('/api/setup-admin-now', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'blinkist.db');
    
    console.log('🔧 Setup admin requested');
    console.log('Database path:', dbPath);
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err.message);
      } else {
        console.log('✅ Database connected');
      }
    });

    // Check if admin exists
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], async (err, row) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        db.close();
        return res.status(500).json({ 
          status: 'error',
          error: err.message 
        });
      }

      if (row) {
        console.log('✅ Admin already exists:', row.username);
        db.close();
        return res.json({ 
          status: 'exists',
          message: 'Admin already exists',
          username: row.username,
          email: row.email,
          role: row.role
        });
      }

      // Create admin
      console.log('📝 Creating new admin user...');
      
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);

        db.run(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          ['admin', 'admin@bookblinks.com', hash, 'admin'],
          function(err) {
            if (err) {
              console.error('❌ Insert error:', err.message);
              db.close();
              return res.status(500).json({ 
                status: 'error',
                error: err.message 
              });
            }

            console.log('✅ Admin created successfully! ID:', this.lastID);
            db.close();
            
            res.json({
              status: 'success',
              message: '✅ Admin created successfully!',
              credentials: {
                id: this.lastID,
                username: 'admin',
                email: 'admin@bookblinks.com',
                password: 'admin123'
              },
              note: 'Please change password after first login'
            });
          }
        );
      } catch (hashError) {
        console.error('❌ Hash error:', hashError.message);
        db.close();
        res.status(500).json({
          status: 'error',
          error: hashError.message
        });
      }
    });
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// ============================================
// DEBUG ENDPOINT (TEMPORARY)
// ============================================
app.get('/api/debug-db', async (req, res) => {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'blinkist.db');
    
    const db = new sqlite3.Database(dbPath);

    // Check if users table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, table) => {
      if (err) {
        db.close();
        return res.json({ 
          status: 'error',
          error: err.message 
        });
      }

      if (!table) {
        db.close();
        return res.json({ 
          status: 'error',
          message: 'Users table does not exist!',
          dbPath: dbPath
        });
      }

      // Count users
      db.get('SELECT COUNT(*) as count FROM users', (err, count) => {
        if (err) {
          db.close();
          return res.json({ 
            status: 'error',
            error: err.message 
          });
        }

        // Get all users (without passwords)
        db.all('SELECT id, username, email, role, createdAt FROM users', (err, users) => {
          db.close();
          
          if (err) {
            return res.json({ 
              status: 'error',
              error: err.message 
            });
          }

          res.json({
            status: 'ok',
            dbPath: dbPath,
            tableExists: true,
            userCount: count.count,
            users: users
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// ============================================
// ERROR HANDLERS (MUST BE LAST!)
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: err.message,
    });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message,
    });
  }
  
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong!',
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📚 BookBlinks API Server Started');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 Setup: http://localhost:${PORT}/api/setup-admin-now`);
  console.log('═══════════════════════════════════════════════════════');
});

module.exports = app;
