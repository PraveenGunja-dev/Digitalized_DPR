// server/discover-p6-schema.js
// Discover Oracle P6 schema and available fields

const axios = require('axios');

const REAL_TOKEN = 'eyJ4NXQjUzI1NiI6IlV6LU1BTlgyS0VncEFpb2I3cEVwQlZWSmtZSzFvV2FRczBacHhMbDI5NWciLCJ4NXQiOiJGNmE4X1lJMENCTEI3LVpkd3RWNjM5bXFqZ0kiLCJraWQiOiJTSUdOSU5HX0tFWSIsImFsZyI6IlJTMjU2In0.eyJjbGllbnRfb2NpZCI6Im9jaWQxLmRvbWFpbmFwcC5vYzEuYXAtbXVtYmFpLTEuYW1hYWFhYWFhcXRwNWJhYTVnaHlqbG92NnJ5d25zYzdta2w2d2ZybTd3cXJiNm9heXh1M3UzZWVsNWFxIiwidXNlcl90eiI6IkFzaWEvS29sa2F0YSIsInN1YiI6ImFnZWwuZm9yZWNhc3RpbmdAYWRhbmkuY29tIiwidXNlcl9sb2NhbGUiOiJlbiIsInNpZGxlIjo0ODAsInVzZXIudGVuYW50Lm5hbWUiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5vcmFjbGVjbG91ZC5jb20vIiwiZG9tYWluX2hvbWUiOiJhcC1tdW1iYWktMSIsImNhX29jaWQiOiJvY2lkMS50ZW5hbmN5Lm9jMS4uYWFhYWFhYWFrejRrZnl3cGVjc3h3dHBqc2tiZ2d5ZGNuNzdidGp2cmpocWVhaGJ5dGZ3dWczeXBnamJxIiwidXNlcl90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsImNsaWVudF9pZCI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2VfQVBQSUQiLCJkb21haW5faWQiOiJvY2lkMS5kb21haW4ub2MxLi5hYWFhYWFhYTRsejVldWQ1bWc2dm82eGdqbG5lNWptbHMzb2x6NjZmZnQ3anRjd2dnYnRsM3RzNnloc3EiLCJzdWJfdHlwZSI6InVzZXIiLCJzY29wZSI6InVybjpvcGM6aWRtOnQuc2VjdXJpdHkuY2xpZW50IHVybjpvcGM6aWRtOnQudXNlci5hdXRobi5mYWN0b3JzIiwidXNlcl9vY2lkIjoib2NpZDEudXNlci5vYzEuLmFhYWFhYWFhdmQ3MnVkNm5maHg1dW4zMmdndnRhM2RibWlwNTJsYTZ4NnJnZmE0bW1yeGZ4bnJ5dGVncSIsImNsaWVudF90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsInJlZ2lvbl9uYW1lIjoiYXAtbXVtYmFpLWlkY3MtMSIsInVzZXJfbGFuZyI6ImVuIiwidXNlckFwcFJvbGVzIjpbIkF1dGhlbnRpY2F0ZWQiXSwiZXhwIjoxNzY2MDUwMjg4LCJpYXQiOjE3NjYwNDY2ODgsImNsaWVudF9ndWlkIjoiODMxYjBjZTYzYTE5NDk0NmI3MjFiOTYxYjdiZTEyNmYiLCJjbGllbnRfbmFtZSI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2UiLCJ0ZW5hbnQiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwianRpIjoiMDBkN2VlNjgzYjNlNDE5OGJjZGY1ZjA3NGJiZTgzNjIiLCJndHAiOiJybyIsInVzZXJfZGlzcGxheW5hbWUiOiJBZ2VsIGZvcmNhc3RpbmciLCJvcGMiOnRydWUsInN1Yl9tYXBwaW5nYXR0ciI6InVzZXJOYW1lIiwicHJpbVRlbmFudCI6dHJ1ZSwidG9rX3R5cGUiOiJBVCIsImF1ZCI6WyJ1cm46b3BjOmxiYWFzOmxvZ2ljYWxndWlkPWlkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDciLCJodHRwczovL2lkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDcuYXAtbXVtYmFpLWlkY3MtMS5zZWN1cmUuaWRlbnRpdHkub3JhY2xlY2xvdWQuY29tIiwiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbSJdLCJjYV9uYW1lIjoiYWRhbmkiLCJzdHUiOiJQUklNQVZFUkEiLCJ1c2VyX2lkIjoiYjA2ZGZkMWUwZTIxNDYwNWE1MDA5YzE5ZmI5NThkMmEiLCJkb21haW4iOiJEZWZhdWx0IiwiY2xpZW50QXBwUm9sZXMiOlsiVXNlciBBZG1pbmlzdHJhdG9yIiwiR2xvYmFsIFZpZXdlciIsIkF1dGhlbnRpY2F0ZWQgQ2xpZW50IiwiQ2xvdWQgR2F0ZSJdLCJ0ZW5hbnRfaXNzIjoiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbTo0NDMifQ.yQ9LrwkWiYT18s9n4NuvVgLyQIKndDwrVcmITzZgy_bawNcGp9D7R40AMZ31mvZCeL52eNXlTKwkKWjdao2yWtGZrhPIybJK9ahjtgZsCucX0iNpT8gBjlAyW7VGY6F5wSQyNKn1JxSuCEqkIiAFO996ibnFN4UDxsrA2af3MmRt8RmeuH6qYo8uF2-Aux8JkerzNaW4z4EUoWbW-SQhXbL1UNJO3ZGesq8tjYaU4uXKdAIyL7L8fUbjCeVr1yPsZziZLa75CSnjXRwmX_cLBMn5pzg7DcKiHkbu6TqjuViIOfJDiDQ46IfLByWgLkB-vPj4TPX1dP48RvMxKGsCuA';
const BASE_URL = 'https://sin1.p6.oraclecloud.com/adani/stage/p6ws';

async function discoverSchema() {
    console.log('='.repeat(80));
    console.log('Discovering Oracle P6 Schema');
    console.log('='.repeat(80));
    console.log('');

    const headers = {
        'Authorization': `Bearer ${REAL_TOKEN}`,
        'Accept': 'application/json'
    };

    // Try different schema/metadata endpoints
    const schemaEndpoints = [
        '/restapi/project/fields',
        '/restapi/metadata/project',
        '/restapi/project/$metadata',
        '/restapi/$metadata',
        '/metadata/project',
        '/restapi/project?fields=help',
        '/restapi/project?describe=true'
    ];

    console.log('Trying schema/metadata endpoints...\n');

    for (const endpoint of schemaEndpoints) {
        try {
            console.log(`Testing: ${endpoint}`);
            const response = await axios.get(`${BASE_URL}${endpoint}`, { headers, timeout: 10000 });

            console.log('✓ SUCCESS!');
            console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 2000));
            console.log('');
            console.log('='.repeat(80));
            return;

        } catch (error) {
            if (error.response) {
                console.log(`✗ HTTP ${error.response.status}`);
            } else {
                console.log(`✗ ${error.message}`);
            }
        }
    }

    console.log('\nNo schema endpoint found. Trying to fetch a single project with minimal fields...\n');

    // Try to get just one project with a single field to see the response structure
    const minimalQueries = [
        '?limit=1&fields=Id',
        '?limit=1&fields=Name',
        '?limit=1&fields=ProjectId',
        '?limit=1',
        '?start=0&limit=1&fields=Id'
    ];

    for (const query of minimalQueries) {
        try {
            console.log(`Testing: /restapi/project${query}`);
            const response = await axios.get(`${BASE_URL}/restapi/project${query}`, { headers, timeout: 10000 });

            console.log('✓ SUCCESS!');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            console.log('');
            console.log('='.repeat(80));
            console.log('Found working query!');
            console.log('='.repeat(80));
            return;

        } catch (error) {
            if (error.response) {
                console.log(`✗ HTTP ${error.response.status}`);
                if (error.response.data) {
                    console.log('Error:', JSON.stringify(error.response.data).substring(0, 200));
                }
            } else {
                console.log(`✗ ${error.message}`);
            }
            console.log('');
        }
    }

    console.log('Could not discover schema or fetch projects.');
}

discoverSchema();
