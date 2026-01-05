// final-check.js - Final database verification
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function check() {
    try {
        console.log('=== FINAL P6 SYNC STATUS ===\n');

        const counts = await Promise.all([
            pool.query('SELECT COUNT(*) FROM p6_projects'),
            pool.query('SELECT COUNT(*) FROM p6_wbs'),
            pool.query('SELECT COUNT(*) FROM p6_activities'),
            pool.query('SELECT COUNT(*) FROM p6_resources'),
            pool.query('SELECT COUNT(*) FROM p6_resource_assignments')
        ]);

        console.log('Database Counts:');
        console.log('  Projects:', counts[0].rows[0].count);
        console.log('  WBS:', counts[1].rows[0].count);
        console.log('  Activities:', counts[2].rows[0].count);
        console.log('  Resources:', counts[3].rows[0].count);
        console.log('  Resource Assignments:', counts[4].rows[0].count);

        // Sample activity with resource data
        const sample = await pool.query(`
            SELECT 
                a."activityId",
                a."name",
                ra."targetQty",
                ra."actualQty",
                r."name" as contractor
            FROM p6_activities a
            LEFT JOIN p6_resource_assignments ra ON a."activityObjectId" = ra."activityObjectId"
            LEFT JOIN p6_resources r ON ra."resourceObjectId" = r."resourceObjectId"
            WHERE ra."targetQty" IS NOT NULL
            LIMIT 2
        `);

        console.log('\nSample Activities with Resource Data:');
        sample.rows.forEach(r => {
            console.log(`  - ${r.activityId}: targetQty=${r.targetQty}, contractor=${r.contractor || 'N/A'}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

check();
