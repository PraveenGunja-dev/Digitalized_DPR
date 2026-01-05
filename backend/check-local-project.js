require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5431,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Prvn@3315',
});

async function checkLocalProject() {
    try {
        console.log('--- Checking PROJECT ID 7138 in p6_projects table ---');
        const res = await pool.query('SELECT * FROM p6_projects WHERE "objectId" = 7138');
        console.log(res.rows);

        if (res.rows.length > 0) {
            console.log('\n--- Checking Assignments for Project 7138 ---');
            const pa = await pool.query('SELECT * FROM project_assignments WHERE project_id = 7138');
            console.log(pa.rows);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkLocalProject();
