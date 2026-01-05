// verify-synced-data.js
const pool = require('./db');

async function verify() {
    try {
        console.log('===========================================');
        console.log('P6 SYNCED DATA VERIFICATION');
        console.log('===========================================\n');

        // Count records
        const counts = await Promise.all([
            pool.query('SELECT COUNT(*) FROM p6_projects'),
            pool.query('SELECT COUNT(*) FROM p6_wbs'),
            pool.query('SELECT COUNT(*) FROM p6_activities'),
            pool.query('SELECT COUNT(*) FROM p6_resources'),
            pool.query('SELECT COUNT(*) FROM p6_resource_assignments')
        ]);

        console.log('Record counts:');
        console.log('  - Projects:', counts[0].rows[0].count);
        console.log('  - WBS:', counts[1].rows[0].count);
        console.log('  - Activities:', counts[2].rows[0].count);
        console.log('  - Resources:', counts[3].rows[0].count);
        console.log('  - Resource Assignments:', counts[4].rows[0].count);

        // Sample activities with resource assignments
        console.log('\n--- Sample Activities with Resource Data ---');
        const joined = await pool.query(`
            SELECT 
                a."activityId",
                a."name" as activity,
                a."plannedStartDate",
                a."actualStartDate",
                a."status",
                ra."targetQty",
                ra."actualQty",
                ra."remainingQty",
                r."name" as contractor,
                r."resourceType",
                CASE WHEN ra."targetQty" > 0 THEN ROUND((ra."actualQty" / ra."targetQty") * 100, 2) ELSE NULL END as "percentComplete"
            FROM p6_activities a
            LEFT JOIN p6_resource_assignments ra ON a."activityObjectId" = ra."activityObjectId"
            LEFT JOIN p6_resources r ON ra."resourceObjectId" = r."resourceObjectId"
            WHERE ra."targetQty" IS NOT NULL AND ra."targetQty" > 0
            LIMIT 5
        `);

        joined.rows.forEach(row => {
            console.log(`\n  Activity: ${row.activityId} - ${row.activity}`);
            console.log(`    Status: ${row.status}`);
            console.log(`    Planned Start: ${row.plannedStartDate}`);
            console.log(`    Target Qty: ${row.targetQty}, Actual Qty: ${row.actualQty}`);
            console.log(`    % Complete: ${row.percentComplete}%`);
            console.log(`    Contractor: ${row.contractor} (${row.resourceType})`);
        });

        // Report missing fields
        console.log('\n===========================================');
        console.log('FIELDS THAT DID NOT GET SYNCED FROM P6:');
        console.log('===========================================');
        console.log('');
        console.log('1. forecastFinishDate - P6 activity endpoint does not return this');
        console.log('2. unitOfMeasure - Not in standard P6 resource endpoint');
        console.log('3. Block Capacity, SPV Number, Block, Phase - WBS UDFs (not synced)');
        console.log('4. Priority, Plot, New Block Nom - Activity Codes (not synced)');
        console.log('5. Scope, Front, Remarks, Hold Due to WTG - Activity UDFs (not synced)');
        console.log('');
        console.log('These fields require separate UDF and Activity Code sync endpoints.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

verify();
