const Blog = require('../models/Blog');
const User = require('../models/User');

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;
    const sort = req.query.sort || '-publishDate';

    let query = { status: 'Published' };
    
    // Add filters if provided
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Blog.countDocuments(query);
    
    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: blogs
    });
  } catch (error) {
    console.error('Error getting blogs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const blogs = await Blog.find({ 
      status: 'Published',
      featured: true 
    })
      .sort('-publishDate')
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    console.error('Error getting featured blogs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
exports.getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const total = await Blog.countDocuments({ 
      status: 'Published',
      category 
    });
    
    const blogs = await Blog.find({ 
      status: 'Published',
      category 
    })
      .sort('-publishDate')
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: blogs
    });
  } catch (error) {
    console.error('Error getting blogs by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get blogs by tag
// @route   GET /api/blogs/tag/:tag
// @access  Public
exports.getBlogsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const total = await Blog.countDocuments({ 
      status: 'Published',
      tags: { $in: [tag] } 
    });
    
    const blogs = await Blog.find({ 
      status: 'Published',
      tags: { $in: [tag] } 
    })
      .sort('-publishDate')
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: blogs
    });
  } catch (error) {
    console.error('Error getting blogs by tag:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get a single blog
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ 
      slug,
      status: 'Published'
    }).populate({
      path: 'author',
      select: 'name email'
    });
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    // Find related blogs
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      status: 'Published',
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
      .sort('-publishDate')
      .limit(3)
      .populate({
        path: 'author',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      data: blog,
      relatedBlogs
    });
  } catch (error) {
    console.error('Error getting blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private
exports.createBlog = async (req, res) => {
  try {
    // Add author to req.body
    req.body.author = req.user.id;
    
    // Create blog
    const blog = await Blog.create(req.body);
    
    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Make sure user is the blog author or an admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to update this blog' 
      });
    }
    
    // Update blog
    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'author',
      select: 'name email'
    });
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private
exports.deleteBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Make sure user is the blog author or an admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to delete this blog' 
      });
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all blogs (including drafts) - admin only
// @route   GET /api/blogs/admin/all
// @access  Private/Admin
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const status = req.query.status;
    const search = req.query.search;
    const sort = req.query.sort || '-createdAt';

    let query = {};
    
    // Add filters if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Blog.countDocuments(query);
    
    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: blogs
    });
  } catch (error) {
    console.error('Error getting all blogs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update blog status
// @route   PUT /api/blogs/admin/:id/status
// @access  Private/Admin
exports.updateBlogStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Draft', 'Published', 'Scheduled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid status' 
      });
    }
    
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Set publishDate to now if status is changed to Published
    if (status === 'Published' && blog.status !== 'Published') {
      blog.publishDate = Date.now();
    }
    
    blog.status = status;
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle blog featured status
// @route   PUT /api/blogs/admin/:id/feature
// @access  Private/Admin
exports.toggleFeature = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    blog.featured = !blog.featured;
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error toggling blog feature status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get a single blog by ID (for admin)
// @route   GET /api/blogs/admin/:id
// @access  Private/Admin
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate({
      path: 'author',
      select: 'name email'
    });
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error getting blog by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
}; 