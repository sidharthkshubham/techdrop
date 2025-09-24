const express = require('express');
const { generateBlog } = require('../controllers/bloggenerator');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect ,generateBlog);

module.exports=router