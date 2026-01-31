const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.token;

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      isAuthenticated: false 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid token.',
      isAuthenticated: false 
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
