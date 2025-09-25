const express = require('express');
const { savetitle, gettitle } = require('../controllers/savefuturetitle');
const router = express.Router();


// Register route
router.post('/title',savetitle );
router.get('/title',gettitle );


module.exports = router; 