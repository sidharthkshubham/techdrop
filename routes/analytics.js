const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getDashboardStats,
  getAudienceAnalytics,
  getContentAnalytics,
  getTimeAnalytics
} = require('../controllers/analyticsController');

// Protect all routes - require authentication and admin role
router.use(protect);
router.use(admin);

// Get dashboard stats
router.get('/dashboard', getDashboardStats);

// Get audience analytics
router.get('/audience', getAudienceAnalytics);

// Get content analytics
router.get('/content', getContentAnalytics);

// Get time analytics
router.get('/time', getTimeAnalytics);

module.exports = router; 