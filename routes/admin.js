const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// Test admin route
router.get('/dashboard', protect, admin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: req.user
  });
});

// Get all users (admin only)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await require('../models/User').find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 