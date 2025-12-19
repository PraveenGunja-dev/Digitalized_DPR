// server/test-oracle-p6-connection.js
// Test script for Oracle P6 API connection and token generation

const { testConnection, generateToken } = require('./services/oracleP6AuthService');
const { apiClient } = require('./services/oracleP6ApiClient');

async function testOracleP6Connection() {
    console.log('='.repeat(60));
    console.log('Oracle P6 API Connection Test');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Step 1: Test token generation
        console.log('Step 1: Testing token generation...');
        const tokenData = await generateToken();
        console.log('✓ Token generated successfully');
        console.log('  - Access Token:', tokenData.accessToken.substring(0, 50) + '...');
        console.log('  - Expires In:', tokenData.expiresIn, 'seconds');
        console.log('  - Expires At:', new Date(tokenData.expiresAt).toISOString());
        console.log('');

        // Step 2: Test API connection
        console.log('Step 2: Testing API connection...');
        const isConnected = await testConnection();
        if (isConnected) {
            console.log('✓ Oracle P6 API connection successful');
        } else {
            console.log('✗ Oracle P6 API connection failed');
        }
        console.log('');

        // Step 3: Try to discover available endpoints
        console.log('Step 3: Discovering available endpoints...');
        const endpoints = [
            '/project',
            '/projects',
            '/api/project',
            '/api/projects',
            '/restapi/project',
            '/p6ws/project',
            '/activity',
            '/activities'
        ];

        console.log('Testing endpoints:');
        for (const endpoint of endpoints) {
            try {
                await apiClient.get(endpoint);
                console.log(`  ✓ ${endpoint} - Available`);
            } catch (error) {
                console.log(`  ✗ ${endpoint} - Not available (${error.message.substring(0, 50)}...)`);
            }
        }
        console.log('');

        console.log('='.repeat(60));
        console.log('Test completed successfully!');
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('='.repeat(60));
        console.error('Test failed with error:');
        console.error(error.message);
        console.error('='.repeat(60));

        if (error.response) {
            console.error('');
            console.error('Response details:');
            console.error('  Status:', error.response.status);
            console.error('  Data:', JSON.stringify(error.response.data, null, 2));
        }

        process.exit(1);
    }
}

// Run the test
testOracleP6Connection();
