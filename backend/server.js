const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const booksRoutes = require('./routes/books');
const chaptersRoutes = require('./routes/chapters');
const favoritesRoutes = require('./routes/favorites');
const progressRoutes = require('./routes/progress');
const utilityRoutes = require('./routes/utility');
const { initializeDatabase } = require('./database');

const app = express();

// ============================================
// PRODUCTION PORT CONFIGURATION
// ============================================
const PORT = process.env.PORT || 3000;

// ============================================
// CORS CONFIGURATION FOR PRODUCTION
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://keen-palmier-2ab5ea.netlify.app', // Nanti diganti setelah deploy frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/books', booksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api', utilityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Blinkist Clone API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Blinkist Clone API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      books: '/api/books',
      chapters: '/api/chapters',
      favorites: '/api/favorites',
      progress: '/api/progress',
      categories: '/api/categories',
      search: '/api/search',
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Blinkist Clone API running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
