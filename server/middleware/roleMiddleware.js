const { User } = require('../models');

const authorizeRoles = (...roles) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { authorizeRoles }; 