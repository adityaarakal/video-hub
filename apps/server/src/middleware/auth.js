const jwt = require('jsonwebtoken');
const Database = require('../utils/database');

const JWT_SECRET = process.env.JWT_SECRET || 'videohub-secret-key-change-in-production';
const userDb = new Database('users');

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = userDb.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  // First authenticate the user
  authenticate(req, res, () => {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

module.exports = {
  authenticate,
  requireAdmin
};

