const express = require('express');
const { generateBlog } = require('../controllers/bloggenerator');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', generateBlog);

// Enhanced environment check
router.get('/getenv', (req, res) => {
  // Clean environment variables by removing extra quotes
  const cleanEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/^["']|["']$/g, '');
  const cleanApiKey = process.env.AZURE_OPENAI_API_KEY?.replace(/^["']|["']$/g, '');
  const cleanApiVersion = process.env.AZURE_OPENAI_API_VERSION?.replace(/^["']|["']$/g, '');
  const cleanDeployment = process.env.AZURE_OPENAI_DEPLOYMENT?.replace(/^["']|["']$/g, '');
  
  const config = {
    endpoint: !!cleanEndpoint,
    apiKey: !!cleanApiKey,
    apiVersion: !!cleanApiVersion,
    deployment: !!cleanDeployment,
    rawEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    cleanEndpoint: cleanEndpoint,
    rawApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    cleanApiVersion: cleanApiVersion,
    rawDeployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    cleanDeployment: cleanDeployment
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