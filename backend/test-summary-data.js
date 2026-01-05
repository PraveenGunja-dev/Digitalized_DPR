// test-summary-data.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function test() {
    try {
        const projectObjectId = 1999; // AGEL_PSS_11
        console.log('Testing data for projectObjectId:', projectObjectId);

        // Query activities with joins (same as dprActivities.js)
        const result = await pool.query(`
            SELECT 
                a."activityObjectId",
                a."activityId",
                a."name",
                a."plannedStartDate",
                a."plannedFinishDate",
                a."actualStartDate",
                a."actualFinishDate",
                a."forecastFinishDate",
                a."status",
                ra."targetQty",
                ra."actualQty",
                ra."remainingQty",
                CASE 
                    WHEN ra."targetQty" > 0 THEN ROUND((ra."actualQty" / ra."targetQty") * 100, 2)
                    ELSE NULL 
                END AS "percentComplete",
                r."name" AS "contractorName",
                r."unitOfMeasure"
            FROM p6_activities a
            LEFT JOIN p6_resource_assignments ra ON a."activityObjectId" = ra."activityObjectId"
            LEFT JOIN p6_resources r ON ra."resourceObjectId" = r."resourceObjectId"
            WHERE a."projectObjectId" = $1
            ORDER BY a."plannedStartDate", a."activityId"
            LIMIT 5
        `, [projectObjectId]);

        console.log('Sample activities with JOIN data:');
        result.rows.forEach(r => {
            console.log(`  - ${r.name || 'NO NAME'} | targetQty: ${r.targetQty} | actualQty: ${r.actualQty} | contractor: ${r.contractorName}`);
        });

        console.log('\nTotal count:', result.rows.length, '(showing first 5)');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        pool.end();
    }
}

test();
