const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate requests using JWT
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Prefer httpOnly cookie; Bearer remains as a legacy fallback only
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
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

    // Normalize id for controllers that compare with req.user.id
    req.user.id = req.user._id.toString();

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

/**
 * Optional auth — attaches req.user when a valid token is present,
 * but never blocks the request when missing/invalid.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user && user.isActive !== false) {
      user.id = user._id.toString();
      req.user = user;
    }
  } catch {
    // ignore — treat as anonymous
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  optionalAuth,
};