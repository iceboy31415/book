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

const { initializeDatabase } = require('./database');

const app = express();

// ============================================
// PORT CONFIGURATION
// ============================================
const PORT = process.env.PORT || 3000;

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'https://keen-palmier-2ab5ea.netlify.app',
  process.env.FRONTEND_URL,
];

// Add production frontend URL if exists
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // For development, allow all localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // For production, be strict
    if (process.env.NODE_ENV === 'production') {
      const msg = 'CORS policy does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    // Default: allow
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================
// MIDDLEWARE
// ============================================

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// Serve static files (uploaded PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Initialize database
initializeDatabase();

// ============================================
// API ROUTES
// ============================================

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/utility', utilityRoutes);

// Protected routes (require authentication for write operations)
app.use('/api/books', booksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/upload', uploadRoutes);

// User-specific routes (no auth required for reading)
app.use('/api/favorites', favoritesRoutes);
app.use('/api/progress', progressRoutes);

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
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'GET /api/auth/verify',
        logout: 'POST /api/auth/logout',
      },
      books: '/api/books',
      chapters: '/api/chapters',
      favorites: '/api/favorites',
      progress: '/api/progress',
      upload: '/api/upload',
      categories: '/api/categories',
      search: '/api/search',
    },
    documentation: 'https://github.com/yourusername/bookblinks',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BookBlinks API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'BookBlinks API',
    version: '1.0.0',
    description: 'Book summaries and reading progress API with admin authentication',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register (admin only)',
        verify: 'GET /api/auth/verify',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
        changePassword: 'PUT /api/auth/change-password',
      },
      books: {
        list: 'GET /api/books',
        get: 'GET /api/books/:id',
        create: 'POST /api/books (protected)',
        update: 'PUT /api/books/:id (protected)',
        delete: 'DELETE /api/books/:id (protected)',
        byCategory: 'GET /api/books/category/:category',
      },
      chapters: {
        byBook: 'GET /api/chapters/book/:bookId',
        get: 'GET /api/chapters/:id',
        create: 'POST /api/chapters (protected)',
        update: 'PUT /api/chapters/:id (protected)',
        delete: 'DELETE /api/chapters/:id (protected)',
      },
      upload: {
        pdf: 'POST /api/upload/pdf (protected)',
        viewPdf: 'GET /api/upload/pdf/:bookId',
        chapterPdf: 'POST /api/upload/chapter-pdf (protected)',
        viewChapterPdf: 'GET /api/upload/chapter-pdf/:chapterId',
      },
      favorites: {
        list: 'GET /api/favorites/:deviceId',
        check: 'GET /api/favorites/:deviceId/:bookId',
        add: 'POST /api/favorites',
        remove: 'DELETE /api/favorites/:deviceId/:bookId',
      },
      progress: {
        list: 'GET /api/progress/:deviceId',
        byBook: 'GET /api/progress/:deviceId/:bookId',
        update: 'POST /api/progress',
      },
      utility: {
        categories: 'GET /api/categories',
        search: 'GET /api/search?q=query',
      },
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: err.message,
    });
  }
  
  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message,
    });
  }
  
  // Other errors
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong!',
    timestamp: new Date().toISOString(),
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
  console.log(`📚 API Base: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📖 Documentation: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 Authentication enabled');
  console.log('📄 PDF upload enabled for books and chapters');
  console.log('═══════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
