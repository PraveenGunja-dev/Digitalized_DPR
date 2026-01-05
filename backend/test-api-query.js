// test-api-query.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function test() {
    try {
        console.log('Testing API query...\n');

        const projectObjectId = 1981; // Test project

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
                a."wbsObjectId",
                a."projectObjectId",
                ra."targetQty",
                ra."actualQty",
                ra."remainingQty",
                ra."actualUnits",
                ra."remainingUnits",
                CASE 
                    WHEN ra."targetQty" > 0 THEN ROUND((ra."actualQty" / ra."targetQty") * 100, 2)
                    ELSE NULL 
                END AS "percentComplete",
                r."name" AS "contractorName",
                r."unitOfMeasure",
                r."resourceType",
                w."name" AS "wbsName",
                w."code" AS "wbsCode"
            FROM p6_activities a
            LEFT JOIN p6_resource_assignments ra ON a."activityObjectId" = ra."activityObjectId"
            LEFT JOIN p6_resources r ON ra."resourceObjectId" = r."resourceObjectId"
            LEFT JOIN p6_wbs w ON a."wbsObjectId" = w."wbsObjectId"
            WHERE a."projectObjectId" = $1
            ORDER BY a."plannedStartDate", a."activityId"
            LIMIT 5
        `, [projectObjectId]);

        console.log('Query returned', result.rows.length, 'rows');
        console.log('\nSample data:');
        result.rows.forEach(r => {
            console.log(`  - ${r.activityId}: ${r.name}`);
            console.log(`    targetQty: ${r.targetQty}, actualQty: ${r.actualQty}, % Complete: ${r.percentComplete}%`);
            console.log(`    contractor: ${r.contractorName}`);
        });

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

test();
