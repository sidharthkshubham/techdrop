const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// API base URL
const API_URL = process.env.API_URL || 'http://localhost:8000/api';

// CORS Origin for testing
const ORIGIN = 'http://localhost:3000';

// Test data
const testCases = [
  {
    description: 'Admin Login',
    credentials: {
      email: 'admin@example.com',
      password: 'password123'
    },
    expectedRole: 'admin',
    expectedRedirect: '/admin'
  },
  {
    description: 'User Login',
    credentials: {
      email: 'user@example.com',
      password: 'password123'
    },
    expectedRole: 'user',
    expectedRedirect: '/'
  }
];

// Main test function
const runTests = async () => {
  console.log('Starting API tests...\n');
  let passed = 0;
  let failed = 0;

  try {
    // First test CORS specifically
    console.log('Testing CORS configuration...');
    
    const corsApi = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Origin': ORIGIN,
      }
    });
    
    try {
      const corsResponse = await corsApi.get('/test-cors');
      console.log('✅ CORS test passed:');
      console.log(`   Origin detected by server: ${corsResponse.data.origin}`);
      console.log(`   Cookie set: ${corsResponse.headers['set-cookie'] ? 'Yes' : 'No'}\n`);
    } catch (corsError) {
      console.log('❌ CORS test failed:');
      if (corsError.response) {
        console.log(`   Status: ${corsError.response.status}`);
        console.log(`   Message: ${corsError.response.data?.message || 'No message'}`);
      } else {
        console.log(`   Error: ${corsError.message}`);
      }
      console.log('\n');
    }
  } catch (error) {
    console.log('❌ CORS setup test failed:', error.message);
  }

  // Create axios instance for auth tests
  const api = axios.create({
    baseURL: API_URL,
    withCredentials: false, // Changed to false for testing
    headers: {
      'Content-Type': 'application/json',
    }
  });

  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.description}`);
      
      // Test login API
      const response = await api.post('/auth/login', test.credentials);
      
      // Check if login was successful
      if (response.status !== 200) {
        throw new Error(`Login failed with status ${response.status}`);
      }
      
      // Verify the response contains token and user data
      if (!response.data.token) {
        throw new Error('Response missing token');
      }
      
      if (!response.data.user) {
        throw new Error('Response missing user data');
      }
      
      // Verify user role
      if (response.data.user.role !== test.expectedRole) {
        throw new Error(`Expected role '${test.expectedRole}' but got '${response.data.user.role}'`);
      }
      
      // Verify redirect URL
      if (response.data.redirect !== test.expectedRedirect) {
        throw new Error(`Expected redirect to '${test.expectedRedirect}' but got '${response.data.redirect}'`);
      }
      
      // Get authentication token
      const token = response.data.token;
      
      // Test authenticated endpoint
      const meResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (meResponse.status !== 200) {
        throw new Error(`Auth verification failed with status ${meResponse.status}`);
      }
      
      console.log(`✅ ${test.description}: PASSED`);
      console.log(`   User: ${response.data.user.email} (${response.data.user.role})`);
      console.log(`   Redirect: ${response.data.redirect}\n`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.description}: FAILED`);
      if (error.response) {
        console.log(`   Error: Status ${error.response.status} - ${error.response.data.message || error.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('\n');
      failed++;
    }
  }
  
  // Print summary
  console.log('Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${testCases.length}\n`);
  
  if (failed === 0) {
    console.log('All tests passed successfully! 🎉');
  } else {
    console.log('Some tests failed. Please check the errors above.');
  }
};

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error.message);
  process.exit(1);
}); 