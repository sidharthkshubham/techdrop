const express = require('express');
const { savetitle, gettitle, deletetitle } = require('../controllers/savefuturetitle');
const { scheduler } = require('../controllers/scheduler');
const { testBloggen } = require('../controllers/test');
const router = express.Router();


// Register route
router.post('/title',savetitle );
router.get('/title',gettitle );
router.delete('/title/:id',deletetitle );


//scheduler 
router.get('/scheduler',scheduler );
router.get('/test',testBloggen
)

module.exports = router; 