// server/test-refresh-token.js
// Test script to verify refresh token functionality

const axios = require('axios');

async function testRefreshToken() {
  console.log('Testing refresh token functionality...\n');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // Test 1: Login to get tokens
    console.log('1. Testing login to get tokens...');
    const loginResponse = await axios.post(`${baseURL}/login`, {
      email: 'admin@adani.com',
      password: 'admin123'
    });
    
    console.log('   ✓ Login successful');
    console.log(`   Access Token: ${loginResponse.data.accessToken ? 'Present' : 'Missing'}`);
    console.log(`   Refresh Token: ${loginResponse.data.refreshToken ? 'Present' : 'Missing'}\n`);
    
    const { accessToken, refreshToken } = loginResponse.data;
    
    // Test 2: Use access token for authenticated request
    console.log('2. Testing authenticated request with access token...');
    try {
      const profileResponse = await axios.get(`${baseURL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('   ✓ Authenticated request successful');
      console.log(`   User: ${profileResponse.data.user.Name}\n`);
    } catch (error) {
      console.log('   ! Authenticated request failed\n');
    }
    
    // Test 3: Refresh token
    console.log('3. Testing token refresh...');
    try {
      const refreshResponse = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken
      });
      
      console.log('   ✓ Token refresh successful');
      console.log(`   New Access Token: ${refreshResponse.data.accessToken ? 'Present' : 'Missing'}`);
      console.log(`   New Refresh Token: ${refreshResponse.data.refreshToken ? 'Present' : 'Missing'}\n`);
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
      
      // Test 4: Use new access token
      console.log('4. Testing authenticated request with new access token...');
      try {
        const profileResponse = await axios.get(`${baseURL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${newAccessToken}` }
        });
        console.log('   ✓ Authenticated request with new token successful');
        console.log(`   User: ${profileResponse.data.user.Name}\n`);
      } catch (error) {
        console.log('   ! Authenticated request with new token failed\n');
      }
      
    } catch (error) {
      console.log('   ! Token refresh failed:', error.response?.data?.message || error.message);
      console.log('   This is expected if the server is not running or credentials are incorrect\n');
    }
    
    // Test 5: Logout
    console.log('5. Testing logout...');
    try {
      await axios.post(`${baseURL}/logout`, {
        refreshToken
      });
      console.log('   ✓ Logout successful\n');
    } catch (error) {
      console.log('   ! Logout failed:', error.response?.data?.message || error.message);
      console.log('   This is expected if the server is not running\n');
    }
    
    console.log('Refresh token functionality test completed.');
    
  } catch (error) {
    console.error('Error during refresh token test:', error.response?.data?.message || error.message);
    console.log('\nNote: This test requires the server to be running and valid credentials.');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testRefreshToken();
}

module.exports = { testRefreshToken };