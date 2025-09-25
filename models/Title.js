const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Titleschema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
});


module.exports = mongoose.model('Title', Titleschema); 