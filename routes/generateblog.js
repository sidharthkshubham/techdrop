const express = require('express');
const { generateBlog } = require('../controllers/bloggenerator');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/',generateBlog);

module.exports=router