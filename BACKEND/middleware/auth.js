const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate requests using JWT
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Prefer Bearer over cookie so a fresh login isn't overwritten by a stale cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 3. If no token exists
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, no token provided',
      });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Get user from database (excluding passwordHash)
    req.user = await User.findById(decoded.id).select('-passwordHash');

    // 6. User not found
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // 7. Check if account is active
    if (req.user.isActive === false) {
      return res.status(403).json({
        status: 'error',
        message: 'This account has been deactivated',
      });
    }

    // Continue to next middleware
    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);

    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, token failed',
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    status: 'error',
    message: 'Access denied: Admin role required',
  });
};

module.exports = {
  protect,
  adminOnly,
};