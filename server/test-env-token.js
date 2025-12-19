// server/test-env-token.js
// Test the token from the .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');

async function testEnvToken() {
    console.log('='.repeat(60));
    console.log('Testing Oracle P6 Token from .env file');
    console.log('='.repeat(60));

    const token = process.env.ORACLE_P6_AUTH_TOKEN;

    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Token first 30 chars:', token?.substring(0, 30) || 'N/A');
    console.log('');

    if (!token) {
        console.log('ERROR: ORACLE_P6_AUTH_TOKEN not found in .env');
        console.log('Make sure the .env file has the token without spaces around =');
        console.log('Example: ORACLE_P6_AUTH_TOKEN=eyJ...');
        return;
    }

    // Test with P6 API
    const url = 'https://sin1.p6.oraclecloud.com/adani/stage/p6ws/restapi/project?Fields=ObjectId,Id,Name';
    console.log('Testing API:', url);

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            timeout: 30000
        });

        console.log('SUCCESS! Status:', response.status);
        console.log('Projects retrieved:', response.data?.length || 0);
        if (response.data?.length > 0) {
            console.log('First project:', JSON.stringify(response.data[0], null, 2));
        }
    } catch (error) {
        console.log('ERROR:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data)?.substring(0, 200));
        }
    }
}

testEnvToken();
