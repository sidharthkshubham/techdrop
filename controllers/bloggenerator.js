const { bloggen } = require("../lib/bloggen");



exports.generateBlog = async (req, res) => {
  try {
    const title = req.body.title;
    const blog=await bloggen(title)
    console.log("from api",blog)
    res.json({
        blog:blog
    })
    
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};