// test-resource-query.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function test() {
    try {
        console.log('Testing Resource API query...\n');

        const projectId = 1981; // Test project ID (from previous tests)

        const query = `
          SELECT DISTINCT
            pr."resourceObjectId",
            pr."name",
            pr."resourceType",
            pr."unitOfMeasure"
          FROM p6_resources pr
          JOIN p6_resource_assignments pra ON pr."resourceObjectId" = pra."resourceObjectId"
          WHERE pra."projectObjectId" = $1
          ORDER BY pr."name"
        `;

        const result = await pool.query(query, [projectId]);

        console.log('Query returned', result.rows.length, 'resources');
        console.log('\nSample resources:');
        result.rows.slice(0, 5).forEach(r => {
            console.log(`  - ${r.name} (${r.resourceType})`);
        });

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

test();
