const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Titleschema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: { type: String, enum: ["pending", "used"], default: "pending" },
  
});


module.exports = mongoose.model('Title', Titleschema); 