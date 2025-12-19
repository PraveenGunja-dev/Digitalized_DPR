// server/test-p6-fetch-projects.js
// Fetch and display projects from Oracle P6 SOAP services

const axios = require('axios');
const fs = require('fs');

// OAuth token from user
const TOKEN = 'eyJ4NXQjUzI1NiI6IlV6LU1BTlgyS0VncEFpb2I3cEVwQlZWSmtZSzFvV2FRczBacHhMbDI5NWciLCJ4NXQiOiJGNmE4X1lJMENCTEI3LVpkd3RWNjM5bXFqZ0kiLCJraWQiOiJTSUdOSU5HX0tFWSIsImFsZyI6IlJTMjU2In0.eyJjbGllbnRfb2NpZCI6Im9jaWQxLmRvbWFpbmFwcC5vYzEuYXAtbXVtYmFpLTEuYW1hYWFhYWFhcXRwNWJhYTVnaHlqbG92NnJ5d25zYzdta2w2d2ZybTd3cXJiNm9heXh1M3UzZWVsNWFxIiwidXNlcl90eiI6IkFzaWEvS29sa2F0YSIsInN1YiI6ImFnZWwuZm9yZWNhc3RpbmdAYWRhbmkuY29tIiwidXNlcl9sb2NhbGUiOiJlbiIsInNpZGxlIjo0ODAsInVzZXIudGVuYW50Lm5hbWUiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5vcmFjbGVjbG91ZC5jb20vIiwiZG9tYWluX2hvbWUiOiJhcC1tdW1iYWktMSIsImNhX29jaWQiOiJvY2lkMS50ZW5hbmN5Lm9jMS4uYWFhYWFhYWFrejRrZnl3cGVjc3h3dHBqc2tiZ2d5ZGNuNzdidGp2cmpocWVhaGJ5dGZ3dWczeXBnamJxIiwidXNlcl90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsImNsaWVudF9pZCI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2VfQVBQSUQiLCJkb21haW5faWQiOiJvY2lkMS5kb21haW4ub2MxLi5hYWFhYWFhYTRsejVldWQ1bWc2dm82eGdqbG5lNWptbHMzb2x6NjZmZnQ3anRjd2dnYnRsM3RzNnloc3EiLCJzdWJfdHlwZSI6InVzZXIiLCJzY29wZSI6InVybjpvcGM6aWRtOnQuc2VjdXJpdHkuY2xpZW50IHVybjpvcGM6aWRtOnQudXNlci5hdXRobi5mYWN0b3JzIiwidXNlcl9vY2lkIjoib2NpZDEudXNlci5vYzEuLmFhYWFhYWFhdmQ3MnVkNm5maHg1dW4zMmdndnRhM2RibWlwNTJsYTZ4NnJnZmE0bW1yeGZ4bnJ5dGVncSIsImNsaWVudF90ZW5hbnRuYW1lIjoiaWRjcy1kMmFhOWNlNjAxY2Q0ODRhYWU0MzRmOGEyZjAwYTE0NyIsInJlZ2lvbl9uYW1lIjoiYXAtbXVtYmFpLWlkY3MtMSIsInVzZXJfbGFuZyI6ImVuIiwidXNlckFwcFJvbGVzIjpbIkF1dGhlbnRpY2F0ZWQiXSwiZXhwIjoxNzY2MDcwODQxLCJpYXQiOjE3NjYwNjcyNDEsImNsaWVudF9ndWlkIjoiODMxYjBjZTYzYTE5NDk0NmI3MjFiOTYxYjdiZTEyNmYiLCJjbGllbnRfbmFtZSI6IlByaW1hdmVyYVdUU1NfQWRhbmlfU3RhZ2UiLCJ0ZW5hbnQiOiJpZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3IiwianRpIjoiNzE5NTY4N2I2MWMzNGQ1ZDkxYTdlMGI4NmE3MjRhZWMiLCJndHAiOiJybyIsInVzZXJfZGlzcGxheW5hbWUiOiJBZ2VsIGZvcmNhc3RpbmciLCJvcGMiOnRydWUsInN1Yl9tYXBwaW5nYXR0ciI6InVzZXJOYW1lIiwicHJpbVRlbmFudCI6dHJ1ZSwidG9rX3R5cGUiOiJBVCIsImF1ZCI6WyJ1cm46b3BjOmxiYWFzOmxvZ2ljYWxndWlkPWlkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDciLCJodHRwczovL2lkY3MtZDJhYTljZTYwMWNkNDg0YWFlNDM0ZjhhMmYwMGExNDcuYXAtbXVtYmFpLWlkY3MtMS5zZWN1cmUuaWRlbnRpdHkub3JhY2xlY2xvdWQuY29tIiwiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbSJdLCJjYV9uYW1lIjoiYWRhbmkiLCJzdHUiOiJQUklNQVZFUkEiLCJ1c2VyX2lkIjoiYjA2ZGZkMWUwZTIxNDYwNWE1MDA5YzE5ZmI5NThkMmEiLCJkb21haW4iOiJEZWZhdWx0IiwiY2xpZW50QXBwUm9sZXMiOlsiVXNlciBBZG1pbmlzdHJhdG9yIiwiR2xvYmFsIFZpZXdlciIsIkF1dGhlbnRpY2F0ZWQgQ2xpZW50IiwiQ2xvdWQgR2F0ZSJdLCJ0ZW5hbnRfaXNzIjoiaHR0cHM6Ly9pZGNzLWQyYWE5Y2U2MDFjZDQ4NGFhZTQzNGY4YTJmMDBhMTQ3LmlkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbTo0NDMifQ.fAXlvEir-v3xtq3Ewvo8pflz33GdTohkp7Fpq8Kt9JTyBnLle0kbxDOV-DSAepvASQxxqm3J0niGZd9DEKCWZixsRYK5lbQdzDilveV8YEs-ApnFy_4gihaDJhIX3xvRpGpYsvguEIiDW9KcjXr2h-WTHdvD-JAknuI9d_2iPKgVD-H3jA8f98w1vkTyOQ_vs7WNRAMyH7sEVjBbhBn_IVrQcPXPhga-EwYr14NNaO3b6Q821jfvm32XN2hAbfj6-mVgpFNnGu0Kfl3nJR0Rti1gP7shF4zji27ygr47wD_eAVACjT4jsMajZ01j7sRKFklyglVPQFdR7KzbpZpR8g';

const PROJECT_SERVICE_URL = 'https://sin1.p6.oraclecloud.com/adani/stage/p6ws/services/ProjectService';

function parseProjectsFromXml(xml) {
    const projects = [];

    // Match Project elements with or without namespace prefix
    const projectRegex = /<(?:ns\d+:|[^:]+:|)Project\s*(?:xmlns[^>]*)?>[\s\S]*?<\/(?:ns\d+:|[^:]+:|)Project>/gi;
    const projectMatches = xml.match(projectRegex) || [];

    console.log(`Found ${projectMatches.length} Project elements in response`);

    for (const projectXml of projectMatches) {
        const project = {};

        // Extract field values - handles namespaced elements
        const fieldRegex = /<(?:ns\d+:|[^:]+:|)(\w+)(?:\s[^>]*)?>([^<]*)<\/(?:ns\d+:|[^:]+:|)\1>/gi;
        let match;

        while ((match = fieldRegex.exec(projectXml)) !== null) {
            const [, fieldName, value] = match;
            if (fieldName.toLowerCase() !== 'project') {
                project[fieldName] = value;
            }
        }

        if (Object.keys(project).length > 0) {
            projects.push(project);
        }
    }

    return projects;
}

async function fetchProjects() {
    console.log('='.repeat(80));
    console.log('Fetching Projects from Oracle P6 SOAP Services');
    console.log('='.repeat(80));
    console.log('');

    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:v2="http://xmlns.oracle.com/Primavera/P6/WS/Project/V2">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:ReadProjects>
      <Field>ObjectId</Field>
      <Field>Id</Field>
      <Field>Name</Field>
      <Field>Status</Field>
      <Field>StartDate</Field>
      <Field>FinishDate</Field>
      <Field>PlannedStartDate</Field>
      <Field>Description</Field>
      <Field>LocationName</Field>
      <Field>ParentEPSName</Field>
    </v2:ReadProjects>
  </soapenv:Body>
</soapenv:Envelope>`;

    try {
        console.log('Sending SOAP request...');

        const response = await axios.post(PROJECT_SERVICE_URL, envelope, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'ReadProjects',
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'text/xml, application/xml'
            },
            timeout: 60000
        });

        console.log('Response received. Status:', response.status);

        // Save raw response for debugging
        fs.writeFileSync('p6-projects-response.xml', response.data);
        console.log('Raw response saved to p6-projects-response.xml');
        console.log('');

        // Parse projects
        const projects = parseProjectsFromXml(response.data);

        console.log('='.repeat(80));
        console.log(`SUCCESS! Retrieved ${projects.length} projects`);
        console.log('='.repeat(80));
        console.log('');

        if (projects.length > 0) {
            // Display first 10 projects
            console.log('Projects (first 10):');
            console.log('-'.repeat(80));

            projects.slice(0, 10).forEach((project, index) => {
                console.log(`\n${index + 1}. ${project.Name || 'N/A'}`);
                console.log(`   ID: ${project.Id || 'N/A'}`);
                console.log(`   ObjectId: ${project.ObjectId || 'N/A'}`);
                console.log(`   Status: ${project.Status || 'N/A'}`);
                console.log(`   Start: ${project.StartDate || project.PlannedStartDate || 'N/A'}`);
                console.log(`   Finish: ${project.FinishDate || 'N/A'}`);
                console.log(`   Location: ${project.LocationName || 'N/A'}`);
                console.log(`   EPS: ${project.ParentEPSName || 'N/A'}`);
            });

            if (projects.length > 10) {
                console.log(`\n... and ${projects.length - 10} more projects`);
            }

            // Save parsed projects as JSON
            fs.writeFileSync('p6-projects.json', JSON.stringify(projects, null, 2));
            console.log('\nParsed projects saved to p6-projects.json');

        } else {
            console.log('No projects found. Looking at raw response...');
            console.log(response.data.substring(0, 1500));
        }

    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data?.substring?.(0, 1000));
        }
    }
}

fetchProjects();
