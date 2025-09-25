const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS with proper settings
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://nextping.blog', 'https://www.nextping.blog'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
  })
);

// Add another middleware for manual CORS headers
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'https://nextping.blog', 'https://www.nextping.blog'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Log request details for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/generate', require('./routes/generateblog'));
app.use('/api/automation',require('./routes/automation'));

// Home route
app.use('/', (req, res) => {
  res.json({ message: 'API is running...' })
});

// Test cookies route
app.get('/api/test-cookie', (req, res) => {
  res.cookie('test-cookie', 'cookie-value', {
    httpOnly: true,
    secure: false, // Set to false for local testing
    sameSite: 'none' // Required for cross-site requests
  });
  res.json({ message: 'Cookie set for testing' });
});

// Test CORS and cookies route
app.get('/api/test-cors', (req, res) => {
  console.log('CORS test request received');
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.cookies);
  
  res.cookie('test-cookie', 'cookie-value', {
    httpOnly: true,
    secure: false, // Set to false for local testing
    sameSite: 'none' // Required for cross-site requests
  });
  
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin header',
    cookies: req.cookies || 'No cookies'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
}); 

module.exports = app;