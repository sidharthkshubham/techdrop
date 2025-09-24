const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

// Get current user
router.get('/me', protect, getCurrentUser);

module.exports = router; 