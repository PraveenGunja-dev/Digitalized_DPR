// debug-activities.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function debug() {
    try {
        console.log('=== DEBUGGING ACTIVITIES ===\n');

        // Check counts
        const actCount = await pool.query('SELECT COUNT(*) FROM p6_activities');
        console.log('Activities in DB:', actCount.rows[0].count);

        const raCount = await pool.query('SELECT COUNT(*) FROM p6_resource_assignments');
        console.log('Resource Assignments in DB:', raCount.rows[0].count);

        // Sample activities
        console.log('\nSample Activities:');
        const sample = await pool.query(`
            SELECT "activityObjectId", "activityId", "name", "projectObjectId"
            FROM p6_activities
            LIMIT 3
        `);
        sample.rows.forEach(r => console.log(r));

        // Test the join query used by dprActivities.js
        console.log('\nTesting API Query (with JOINs):');
        const joined = await pool.query(`
            SELECT 
                a."activityObjectId",
                a."activityId",
                a."name",
                ra."targetQty",
                ra."actualQty",
                r."name" as "contractorName"
            FROM p6_activities a
            LEFT JOIN p6_resource_assignments ra ON a."activityObjectId" = ra."activityObjectId"
            LEFT JOIN p6_resources r ON ra."resourceObjectId" = r."resourceObjectId"
            WHERE a."projectObjectId" = 1981
            LIMIT 3
        `);
        console.log('Joined query results:', joined.rows);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

debug();
