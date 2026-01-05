require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5431,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Prvn@3315',
});

async function checkProjectData() {
    try {
        // 1. Check p6_projects for any project, or specific one
        console.log('--- Checking p6_projects sample ---');
        const p6Res = await pool.query('SELECT "objectId", "name", "plannedStartDate", "lastSyncAt" FROM p6_projects LIMIT 5');
        console.log(p6Res.rows);

        // 2. Check project_assignments
        console.log('\n--- Checking project_assignments ---');
        const assignRes = await pool.query('SELECT * FROM project_assignments LIMIT 5');
        console.log(assignRes.rows);

        // 3. Try joining them
        if (assignRes.rows.length > 0 && p6Res.rows.length > 0) {
            console.log('\n--- Checking Join p6_projects and project_assignments ---');
            const joinRes = await pool.query(`
        SELECT p."name", pa.user_id, pa.project_id
        FROM project_assignments pa
        JOIN p6_projects p ON p."objectId"::text = pa.project_id::text
        LIMIT 5
      `);
            console.log('Join Result:', joinRes.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkProjectData();
