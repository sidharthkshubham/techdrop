const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Array of users to seed
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Connect to database
connectDB();

// Seed function
const seedUsers = async () => {
  try {
    // First clear all existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert the new users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedUsers(); 