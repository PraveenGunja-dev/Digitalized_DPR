// quick-verify.js - Check if data is queryable
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function verify() {
    try {
        console.log('Checking P6 data...\n');

        // Count records
        const projects = await pool.query('SELECT COUNT(*) FROM p6_projects');
        console.log('Projects:', projects.rows[0].count);

        const activities = await pool.query('SELECT COUNT(*) FROM p6_activities');
        console.log('Activities:', activities.rows[0].count);

        const wbs = await pool.query('SELECT COUNT(*) FROM p6_wbs');
        console.log('WBS:', wbs.rows[0].count);

        const resources = await pool.query('SELECT COUNT(*) FROM p6_resources');
        console.log('Resources:', resources.rows[0].count);

        const ra = await pool.query('SELECT COUNT(*) FROM p6_resource_assignments');
        console.log('Resource Assignments:', ra.rows[0].count);

        // Test the query used by projectsController
        console.log('\nTesting projectsController query...');
        const testQuery = await pool.query(`
            SELECT 
              "objectId" AS "ObjectId", 
              "name" AS "Name", 
              "status" AS "Status"
            FROM p6_projects
            LIMIT 3
        `);
        console.log('Query result:', testQuery.rows);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

verify();
