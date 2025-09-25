const { bloggen } = require("../lib/bloggen");



exports.generateBlog = async (req, res) => {
  try {
    const title = req.body.title;
    if(!title){
        console.log("title is not provided")
      res.status(400).json({
        success: false,
        message: 'Title is required'
      })
      return;
    }
    const blog=await bloggen(title)
    res.json({
        blog
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
exports.generateblogimg=async (req, res) => {
  try {
    const title = req.body.title;
    if(!title){
        console.log("title is not provided")
      res.status(400).json({
        success: false,
        message: 'Title is required'
      })
      return;
    }
    const blog=await bloggen(title)
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