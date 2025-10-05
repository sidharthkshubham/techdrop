const { bloggen } = require("../lib/bloggen");
const { generateImage } = require("../lib/blogimg");

exports.generateBlog = async (req, res) => {
  try {
    const title = req.body.title;
    
    if (!title) {
      console.log("❌ Title is not provided");
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    console.log("🚀 Generating blog for title:", title);
    
    const blog = await bloggen(title);
    
    if (blog.error) {
      console.error("❌ Blog generation failed:", blog.error);
      return res.status(500).json({
        success: false,
        message: 'Blog generation failed',
        error: blog.error,
        details: blog.details || blog.missing || blog.endpoint
      });
    }
    
    console.log("✅ Blog generated successfully");
    res.json({
      success: true,
      blog: blog
    });
    
  } catch (error) {
    console.error('❌ Error in generateBlog controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

exports.generateblogimg = async (req, res) => {
  try {
    const title = req.body.title;
    console.log("🚀 Request received to generate blog image for title:", title);

    let blog;
    try {
      blog = await generateImage(title);
      if (!blog) {
        throw new Error("No response received from image generator");
      }
    } catch (genError) {
      console.error("❌ Image generation failed:", genError);
      return res.status(502).json({
        success: false,
        message: 'Image generation service failed',
        error: genError.message
      });
    }
   
    console.log("✅ Blog image generated successfully");
    res.json({
      success: true,
      blog
    });
    
  } catch (error) {
    console.error('❌ Unhandled error in generateblogimg controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred while generating blog image',
      error: error.message
    });
  }
};