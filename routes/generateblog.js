const express = require('express');
const { generateBlog } = require('../controllers/bloggenerator');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/',generateBlog);

router.get('/getenv',(req,res)=>{
    res.json({
        endpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: !!process.env.AZURE_OPENAI_API_KEY,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT
      });
})

module.exports=router