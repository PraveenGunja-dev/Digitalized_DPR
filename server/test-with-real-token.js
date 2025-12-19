// server/test-with-real-token.js
// Test Oracle P6 API with the real JWT token provided by user

const axios = require('axios');

// Real JWT token from Oracle P6
const REAL_TOKEN = 'eyJ4NXQjUzI1NiI6IlV6LU1BTlgyS0VncEFpb2I3cEVwQlZWSmtZSzFvV2FRczBacHhMbDI5NWciLCJ4NXQiOiJGNmE4X1lJMENCTEI3LVpkd3RWNjM5bXFqZ0kiLCJraWQiOiJTSUdOSU5HX0tFWSIsImFsZyI6IlJTMjU2In0.eyJjbGllbnRfb2NpZCI6Im9jaWQxLmRvbWFpbmFwcC5vYzEuYXAtbXVtYmFpLTEuYW1hYWFhYWFhcXRwNWJhYTVnaHlqbG92NnJ5d25zYzdta2w2d2ZybTd3cXJiNm9heXh1M3UzZWVsNWFxIiwidXNlcl90eiI6IkFzaWEvS29sa2F0YSIsInN1YiI6ImFnZWwuZm9yZWNhc3RpbmdAYWRhbmkuY29tIiwidXNlcl9sb2NhbGUiOiJlbiIsInNpZGxlIjo0ODAsInVzZXIudGVuYW50Lm5hbWUiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5vcmFjbGVjbG91ZC5jb20vIiwiZG9tYWluX2hvbWUiOiJhcC1tdW1iYWktMSIsImNhX29jaWQiOiJvY2lkMS50ZW5hbmN5Lm9jMS4uYWFhYWFhYWFrejRrZnl3cGVjc3h3dHBqc2tiZ2d5ZGNuNzdidGp2cmpocWVhaGJ5dGZ3dWczeXBnamJxIiwidXNlcl90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsImNsaWVudF9pZCI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2VfQVBQSUQiLCJkb21haW5faWQiOiJvY2lkMS5kb21haW4ub2MxLi5hYWFhYWFhYTRsejVldWQ1bWc2dm82eGdqbG5lNWptbHMzb2x6NjZmZnQ3anRjd2dnYnRsM3RzNnloc3EiLCJzdWJfdHlwZSI6InVzZXIiLCJzY29wZSI6InVybjpvcGM6aWRtOnQuc2VjdXJpdHkuY2xpZW50IHVybjpvcGM6aWRtOnQudXNlci5hdXRobi5mYWN0b3JzIiwidXNlcl9vY2lkIjoib2NpZDEudXNlci5vYzEuLmFhYWFhYWFhdmQ3MnVkNm5maHg1dW4zMmdndnRhM2RibWlwNTJsYTZ4NnJnZmE0bW1yeGZ4bnJ5dGVncSIsImNsaWVudF90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsInJlZ2lvbl9uYW1lIjoiYXAtbXVtYmFpLWlkY3MtMSIsInVzZXJfbGFuZyI6ImVuIiwidXNlckFwcFJvbGVzIjpbIkF1dGhlbnRpY2F0ZWQiXSwiZXhwIjoxNzY2MDUwMjg4LCJpYXQiOjE3NjYwNDY2ODgsImNsaWVudF9ndWlkIjoiODMxYjBjZTYzYTE5NDk0NmI3MjFiOTYxYjdiZTEyNmYiLCJjbGllbnRfbmFtZSI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2UiLCJ0ZW5hbnQiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwianRpIjoiMDBkN2VlNjgzYjNlNDE5OGJjZGY1ZjA3NGJiZTgzNjIiLCJndHAiOiJybyIsInVzZXJfZGlzcGxheW5hbWUiOiJBZ2VsIGZvcmNhc3RpbmciLCJvcGMiOnRydWUsInN1Yl9tYXBwaW5nYXR0ciI6InVzZXJOYW1lIiwicHJpbVRlbmFudCI6dHJ1ZSwidG9rX3R5cGUiOiJBVCIsImF1ZCI6WyJ1cm46b3BjOmxiYWFzOmxvZ2ljYWxndWlkPWlkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDciLCJodHRwczovL2lkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDcuYXAtbXVtYmFpLWlkY3MtMS5zZWN1cmUuaWRlbnRpdHkub3JhY2xlY2xvdWQuY29tIiwiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbSJdLCJjYV9uYW1lIjoiYWRhbmkiLCJzdHUiOiJQUklNQVZFUkEiLCJ1c2VyX2lkIjoiYjA2ZGZkMWUwZTIxNDYwNWE1MDA5YzE5ZmI5NThkMmEiLCJkb21haW4iOiJEZWZhdWx0IiwiY2xpZW50QXBwUm9sZXMiOlsiVXNlciBBZG1pbmlzdHJhdG9yIiwiR2xvYmFsIFZpZXdlciIsIkF1dGhlbnRpY2F0ZWQgQ2xpZW50IiwiQ2xvdWQgR2F0ZSJdLCJ0ZW5hbnRfaXNzIjoiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbTo0NDMifQ.yQ9LrwkWiYT18s9n4NuvVgLyQIKndDwrVcmITzZgy_bawNcGp9D7R40AMZ31mvZCeL52eNXlTKwkKWjdao2yWtGZrhPIybJK9ahjtgZsCucX0iNpT8gBjlAyW7VGY6F5wSQyNKn1JxSuCEqkIiAFO996ibnFN4UDxsrA2af3MmRt8RmeuH6qYo8uF2-Aux8JkerzNaW4z4EUoWbW-SQhXbL1UNJO3ZGesq8tjYaU4uXKdAIyL7L8fUbjCeVr1yPsZziZLa75CSnjXRwmX_cLBMn5pzg7DcKiHkbu6TqjuViIOfJDiDQ46IfLByWgLkB-vPj4TPX1dP48RvMxKGsCuA';

const BASE_URL = 'https://sin1.p6.oraclecloud.com/adani/stage/p6ws';

async function testWithRealToken() {
    console.log('='.repeat(80));
    console.log('Testing Oracle P6 API with Real JWT Token');
    console.log('='.repeat(80));
    console.log('');

    // Decode JWT to see expiration
    try {
        const payload = JSON.parse(Buffer.from(REAL_TOKEN.split('.')[1], 'base64').toString());
        console.log('Token Information:');
        console.log('  User:', payload.user_displayname || payload.sub);
        console.log('  Client:', payload.client_name);
        console.log('  Issued At:', new Date(payload.iat * 1000).toISOString());
        console.log('  Expires At:', new Date(payload.exp * 1000).toISOString());
        console.log('  Time Until Expiry:', Math.floor((payload.exp * 1000 - Date.now()) / 1000 / 60), 'minutes');
        console.log('');
    } catch (e) {
        console.log('Could not decode token:', e.message);
    }

    // Test different endpoints
    const endpoints = [
        '/project',
        '/projects',
        '/api/project',
        '/api/projects',
        '/restapi/project',
        '/p6ws/project',
        '/p6/project',
        '/activity',
        '/activities',
        '/wbs',
        '/resource',
        '/resources'
    ];

    console.log('Testing API Endpoints:');
    console.log('-'.repeat(80));

    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${REAL_TOKEN}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log(`✓ ${endpoint}`);
            console.log(`  Status: ${response.status}`);
            console.log(`  Response Type: ${typeof response.data}`);

            if (Array.isArray(response.data)) {
                console.log(`  Records: ${response.data.length}`);
                if (response.data.length > 0) {
                    console.log(`  Sample Keys:`, Object.keys(response.data[0]).slice(0, 5).join(', '));
                }
            } else if (typeof response.data === 'object') {
                console.log(`  Keys:`, Object.keys(response.data).slice(0, 10).join(', '));
            }
            console.log('');

            // Save first successful response for analysis
            if (!global.firstSuccessfulResponse) {
                global.firstSuccessfulResponse = {
                    endpoint,
                    data: response.data
                };
            }

        } catch (error) {
            if (error.response) {
                console.log(`✗ ${endpoint} - HTTP ${error.response.status}`);
                if (error.response.status !== 404) {
                    console.log(`  Error:`, error.response.data);
                }
            } else if (error.code === 'ECONNABORTED') {
                console.log(`✗ ${endpoint} - Timeout`);
            } else {
                console.log(`✗ ${endpoint} - ${error.message}`);
            }
        }
    }

    console.log('');
    console.log('='.repeat(80));

    if (global.firstSuccessfulResponse) {
        console.log('First Successful Response:');
        console.log('Endpoint:', global.firstSuccessfulResponse.endpoint);
        console.log('Data:', JSON.stringify(global.firstSuccessfulResponse.data, null, 2).substring(0, 1000));
        console.log('');
    }

    console.log('Test completed!');
    console.log('='.repeat(80));
}

testWithRealToken().catch(console.error);
