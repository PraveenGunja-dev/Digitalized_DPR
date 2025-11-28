// server/route-test.js
// Test script to verify all routes are working

const axios = require('axios');

async function testAllRoutes() {
  console.log('Testing all API routes...\n');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // Test 1: Root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get(`${baseURL}/`);
    console.log('   ✓ Root endpoint accessible');
    console.log(`   Message: ${rootResponse.data.message}\n`);
    
    // Test 2: Health endpoint
    console.log('2. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('   ✓ Health endpoint accessible');
    console.log(`   Status: ${healthResponse.data.message}\n`);
    
    // Test 3: Traditional auth login
    console.log('3. Testing traditional auth login...');
    try {
      const authLoginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'admin@adani.com',
        password: 'admin123'
      });
      console.log('   ✓ Traditional auth login working');
      const token = authLoginResponse.data.accessToken;
      console.log(`   Token received: ${token ? 'Yes' : 'No'}\n`);
      
      // Test 4: Oracle P6 style project endpoints with auth
      console.log('4. Testing Oracle P6 style project endpoints with auth...');
      try {
        const projectsResponse = await axios.get(`${baseURL}/project`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('   ✓ Oracle P6 style project endpoint accessible');
        console.log(`   Projects count: ${Array.isArray(projectsResponse.data) ? projectsResponse.data.length : 'Unknown'}\n`);
      } catch (error) {
        console.log('   ! Error accessing project endpoint:', error.response?.data?.message || error.message);
      }
      
      // Test 5: Oracle P6 style activity endpoints with auth
      console.log('5. Testing Oracle P6 style activity endpoints with auth...');
      try {
        const activitiesResponse = await axios.get(`${baseURL}/activity`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('   ✓ Oracle P6 style activity endpoint accessible');
        console.log(`   Response: ${activitiesResponse.data.message}\n`);
      } catch (error) {
        console.log('   ! Error accessing activity endpoint:', error.response?.data?.message || error.message);
      }
      
      // Test 6: Project assignment endpoints with auth
      console.log('6. Testing project assignment endpoints with auth...');
      try {
        const assignmentResponse = await axios.get(`${baseURL}/project-assignment/assigned`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('   ✓ Project assignment endpoint accessible');
        console.log(`   Assigned projects count: ${Array.isArray(assignmentResponse.data) ? assignmentResponse.data.length : 'Unknown'}\n`);
      } catch (error) {
        console.log('   ! Error accessing project assignment endpoint:', error.response?.data?.message || error.message);
      }
      
    } catch (error) {
      console.log('   ! Traditional auth login failed:', error.response?.data?.message || error.message);
    }
    
    // Test 7: 404 for non-existent route
    console.log('7. Testing 404 for non-existent route...');
    try {
      await axios.get(`${baseURL}/non-existent-route`);
      console.log('   ! Unexpected: Non-existent route should return 404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('   ✓ 404 correctly returned for non-existent route');
        console.log(`   Message: ${error.response.data.message}\n`);
      } else {
        console.log('   ! Unexpected error:', error.message);
      }
    }
    
    console.log('Route testing completed successfully!');
    
  } catch (error) {
    console.error('Error during route testing:', error.message);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAllRoutes();
}

module.exports = { testAllRoutes };