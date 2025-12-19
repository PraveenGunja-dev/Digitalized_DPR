// server/test-p6-with-params.js
// Test Oracle P6 RESTAPI with query parameters

const axios = require('axios');

const REAL_TOKEN = 'eyJ4NXQjUzI1NiI6IlV6LU1BTlgyS0VncEFpb2I3cEVwQlZWSmtZSzFvV2FRczBacHhMbDI5NWciLCJ4NXQiOiJGNmE4X1lJMENCTEI3LVpkd3RWNjM5bXFqZ0kiLCJraWQiOiJTSUdOSU5HX0tFWSIsImFsZyI6IlJTMjU2In0.eyJjbGllbnRfb2NpZCI6Im9jaWQxLmRvbWFpbmFwcC5vYzEuYXAtbXVtYmFpLTEuYW1hYWFhYWFhcXRwNWJhYTVnaHlqbG92NnJ5d25zYzdta2w2d2ZybTd3cXJiNm9heXh1M3UzZWVsNWFxIiwidXNlcl90eiI6IkFzaWEvS29sa2F0YSIsInN1YiI6ImFnZWwuZm9yZWNhc3RpbmdAYWRhbmkuY29tIiwidXNlcl9sb2NhbGUiOiJlbiIsInNpZGxlIjo0ODAsInVzZXIudGVuYW50Lm5hbWUiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5vcmFjbGVjbG91ZC5jb20vIiwiZG9tYWluX2hvbWUiOiJhcC1tdW1iYWktMSIsImNhX29jaWQiOiJvY2lkMS50ZW5hbmN5Lm9jMS4uYWFhYWFhYWFrejRrZnl3cGVjc3h3dHBqc2tiZ2d5ZGNuNzdidGp2cmpocWVhaGJ5dGZ3dWczeXBnamJxIiwidXNlcl90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsImNsaWVudF9pZCI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2VfQVBQSUQiLCJkb21haW5faWQiOiJvY2lkMS5kb21haW4ub2MxLi5hYWFhYWFhYTRsejVldWQ1bWc2dm82eGdqbG5lNWptbHMzb2x6NjZmZnQ3anRjd2dnYnRsM3RzNnloc3EiLCJzdWJfdHlwZSI6InVzZXIiLCJzY29wZSI6InVybjpvcGM6aWRtOnQuc2VjdXJpdHkuY2xpZW50IHVybjpvcGM6aWRtOnQudXNlci5hdXRobi5mYWN0b3JzIiwidXNlcl9vY2lkIjoib2NpZDEudXNlci5vYzEuLmFhYWFhYWFhdmQ3MnVkNm5maHg1dW4zMmdndnRhM2RibWlwNTJsYTZ4NnJnZmE0bW1yeGZ4bnJ5dGVncSIsImNsaWVudF90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsInJlZ2lvbl9uYW1lIjoiYXAtbXVtYmFpLWlkY3MtMSIsInVzZXJfbGFuZyI6ImVuIiwidXNlckFwcFJvbGVzIjpbIkF1dGhlbnRpY2F0ZWQiXSwiZXhwIjoxNzY2MDUwMjg4LCJpYXQiOjE3NjYwNDY2ODgsImNsaWVudF9ndWlkIjoiODMxYjBjZTYzYTE5NDk0NmI3MjFiOTYxYjdiZTEyNmYiLCJjbGllbnRfbmFtZSI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2UiLCJ0ZW5hbnQiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwianRpIjoiMDBkN2VlNjgzYjNlNDE5OGJjZGY1ZjA3NGJiZTgzNjIiLCJndHAiOiJybyIsInVzZXJfZGlzcGxheW5hbWUiOiJBZ2VsIGZvcmNhc3RpbmciLCJvcGMiOnRydWUsInN1Yl9tYXBwaW5nYXR0ciI6InVzZXJOYW1lIiwicHJpbVRlbmFudCI6dHJ1ZSwidG9rX3R5cGUiOiJBVCIsImF1ZCI6WyJ1cm46b3BjOmxiYWFzOmxvZ2ljYWxndWlkPWlkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDciLCJodHRwczovL2lkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDcuYXAtbXVtYmFpLWlkY3MtMS5zZWN1cmUuaWRlbnRpdHkub3JhY2xlY2xvdWQuY29tIiwiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbSJdLCJjYV9uYW1lIjoiYWRhbmkiLCJzdHUiOiJQUklNQVZFUkEiLCJ1c2VyX2lkIjoiYjA2ZGZkMWUwZTIxNDYwNWE1MDA5YzE5ZmI5NThkMmEiLCJkb21haW4iOiJEZWZhdWx0IiwiY2xpZW50QXBwUm9sZXMiOlsiVXNlciBBZG1pbmlzdHJhdG9yIiwiR2xvYmFsIFZpZXdlciIsIkF1dGhlbnRpY2F0ZWQgQ2xpZW50IiwiQ2xvdWQgR2F0ZSJdLCJ0ZW5hbnRfaXNzIjoiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbTo0NDMifQ.yQ9LrwkWiYT18s9n4NuvVgLyQIKndDwrVcmITzZgy_bawNcGp9D7R40AMZ31mvZCeL52eNXlTKwkKWjdao2yWtGZrhPIybJK9ahjtgZsCucX0iNpT8gBjlAyW7VGY6F5wSQyNKn1JxSuCEqkIiAFO996ibnFN4UDxsrA2af3MmRt8RmeuH6qYo8uF2-Aux8JkerzNaW4z4EUoWbW-SQhXbL1UNJO3ZGesq8tjYaU4uXKdAIyL7L8fUbjCeVr1yPsZziZLa75CSnjXRwmX_cLBMn5pzg7DcKiHkbu6TqjuViIOfJDiDQ46IfLByWgLkB-vPj4TPX1dP48RvMxKGsCuA';
const BASE_URL = 'https://sin1.p6.oraclecloud.com/adani/stage/p6ws';

async function testWithParams() {
    console.log('Testing Oracle P6 RESTAPI with query parameters...\n');

    // Oracle P6 RESTAPI requires field selection in query parameters
    // Common patterns: ?fields=Id,Name or ?$select=Id,Name
    const queryVariations = [
        '?fields=ObjectId,Name,Id',
        '?fields=*',
        '?$select=ObjectId,Name',
        '?$select=*',
        '?filter=',
        '?limit=10',
        '?fields=ObjectId,Name,Status,PlannedStartDate,PlannedFinishDate'
    ];

    for (const query of queryVariations) {
        try {
            console.log(`Testing: /restapi/project${query}`);
            const response = await axios.get(`${BASE_URL}/restapi/project${query}`, {
                headers: {
                    'Authorization': `Bearer ${REAL_TOKEN}`,
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            console.log('✓ SUCCESS!');
            console.log('Status:', response.status);
            console.log('Data preview:', JSON.stringify(response.data).substring(0, 300));
            console.log('');
            console.log('WORKING QUERY:', query);
            console.log('='.repeat(80));
            break;

        } catch (error) {
            if (error.response) {
                console.log(`✗ Failed - HTTP ${error.response.status}`);
                if (error.response.status !== 400) {
                    console.log('Error:', JSON.stringify(error.response.data).substring(0, 200));
                }
            } else {
                console.log(`✗ Failed - ${error.message}`);
            }
            console.log('');
        }
    }
}

testWithParams();
