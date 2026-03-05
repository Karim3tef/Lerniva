import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'غير مسموح' });
    }
    next();
  };
};
