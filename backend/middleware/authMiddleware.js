const jwt = require('jsonwebtoken');

// 1. Checks if the user is logged in at all
exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Crack open the digital ID card (JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded; // Attach the user's data (id, role) to the request
    next(); // Let them pass
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

// 2. NEW: Checks if the user has the correct role
// We use a "factory function" that returns a middleware
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if the user's role is in the list of allowed roles
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. You must be one of: ${allowedRoles.join(', ')}`
      });
    }
    next(); // They have the right role, let them pass
  };
};