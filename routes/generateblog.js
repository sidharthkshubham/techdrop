const express = require('express');
const { generateBlog } = require('../controllers/bloggenerator');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', generateBlog);

// Enhanced environment check
router.get('/getenv', (req, res) => {
  const config = {
    endpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: !!process.env.AZURE_OPENAI_API_KEY,
    apiVersion: !!process.env.AZURE_OPENAI_API_VERSION,
    deployment: !!process.env.AZURE_OPENAI_DEPLOYMENT,
    endpointValue: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersionValue: process.env.AZURE_OPENAI_API_VERSION,
    deploymentValue: process.env.AZURE_OPENAI_DEPLOYMENT
  };
  
  console.log("Environment check:", config);
  res.json(config);
});

// Test Azure OpenAI connection
router.get('/test-connection', async (req, res) => {
  try {
    const { bloggen } = require('../lib/bloggen');
    const result = await bloggen("Test blog title");
    
    res.json({
      success: true,
      result: result,
      message: "Connection test completed"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Connection test failed"
    });
  }
});

module.exports = router;