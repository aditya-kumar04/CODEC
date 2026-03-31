const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin Middleware Error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = adminMiddleware;
