const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getBlogs);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/category/:category', blogController.getBlogsByCategory);
router.get('/tag/:tag', blogController.getBlogsByTag);
router.get('/:slug', blogController.getBlog);

// Protected routes (require authentication)
router.post('/', protect, blogController.createBlog);
router.put('/:id', protect, blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);

// Admin only routes
router.get('/admin/all', protect, admin, blogController.getAllBlogs); // Including drafts
router.get('/admin/:id', protect, admin, blogController.getBlogById); // Get blog by ID
router.put('/admin/:id/status', protect, admin, blogController.updateBlogStatus);
router.put('/admin/:id/feature', protect, admin, blogController.toggleFeature);

module.exports = router; 