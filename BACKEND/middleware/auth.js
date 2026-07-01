const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate requests using JWT
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Format: Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database (excluding passwordHash)
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found / Authorization denied',
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          status: 'error',
          message: 'This account has been deactivated',
        });
      }

      next();
    } catch (err) {
      console.error('Auth verification error:', err.message);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token provided',
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied: Admin role required',
    });
  }
};

module.exports = {
  protect,
  adminOnly,
};
