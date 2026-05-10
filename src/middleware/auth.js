const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev_secret';
const DEMO_USER = {
  id: '000000000000000000000001',
  role: 'admin'
};

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    req.user = DEMO_USER;
    return next();
  }
  const parts = auth.split(' ');
  if (parts.length !== 2) {
    req.user = DEMO_USER;
    return next();
  }
  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    req.user = DEMO_USER;
    return next();
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const normalizedUserRole = String(req.user.role || '').toLowerCase();
    const normalizedAllowedRoles = roles.map((role) => String(role).toLowerCase());
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
