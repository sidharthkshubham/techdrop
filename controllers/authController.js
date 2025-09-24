const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'user' // Default to 'user' if not specified
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookies with proper settings for cross-origin requests
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to false for local development
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'none' // Required for cross-origin requests
    };
    
    res.cookie('token', token, cookieOptions);

    // Also set user info in a cookie for middleware access
    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.cookie('user', JSON.stringify(userInfo), {
      ...cookieOptions,
      httpOnly: false // Allow JavaScript access for role-based UI
    });

    res.status(201).json({
      success: true,
      token,
      user: userInfo,
      redirect: user.role === 'admin' ? '/admin' : '/'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Log authentication success with role information
    console.log(`User authenticated successfully: ${user.email} (Role: ${user.role})`);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Determine if we're in production based on the request origin
    const isProduction = req.headers.origin && (
      req.headers.origin.includes('nextping.blog') || 
      !req.headers.origin.includes('localhost')
    );
    
    console.log('Environment detection - Production:', isProduction, 'Origin:', req.headers.origin);

    // Set cookies with proper settings for cross-origin requests
    const cookieOptions = {
      httpOnly: true, 
      secure: isProduction, // True in production, false in development
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/' // Ensure cookie is available across all paths
    };
    
    // Log cookie settings
    console.log('Setting cookies with options:', cookieOptions);
    
    // Set token cookie
    res.cookie('token', token, cookieOptions);

    // Prepare user info
    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // Set user info cookie with JavaScript access allowed
    res.cookie('user', JSON.stringify(userInfo), {
      ...cookieOptions,
      httpOnly: false // Allow JavaScript access for role-based UI
    });

    // Log what we're sending back
    console.log('Sending auth response with:', {
      success: true,
      token: token ? `${token.substring(0, 20)}...` : 'none',
      user: userInfo,
      redirect: user.role === 'admin' ? '/admin' : '/'
    });

    // Send response
    res.json({
      success: true,
      token,
      user: userInfo,
      redirect: user.role === 'admin' ? '/admin' : '/'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      redirect: user.role === 'admin' ? '/admin' : '/'
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    console.log('Logout request received');
    
    // Determine if we're in production based on the request origin
    const isProduction = req.headers.origin && (
      req.headers.origin.includes('nextping.blog') || 
      !req.headers.origin.includes('localhost')
    );
    
    console.log('Environment detection - Production:', isProduction, 'Origin:', req.headers.origin);
    
    // Clear cookies with same options used when setting them
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // True in production, false in development
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
      path: '/'
    };
    
    console.log('Clearing cookies with options:', cookieOptions);
    
    // Clear both cookies
    res.clearCookie('token', cookieOptions);
    res.clearCookie('user', {
      ...cookieOptions,
      httpOnly: false
    });
    
    console.log('Cookies cleared successfully');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 