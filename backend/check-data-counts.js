require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function checkData() {
    try {
        const activities = await pool.query('SELECT COUNT(*) as count FROM p6_activities');
        console.log('Activities:', activities.rows[0].count);

        const assignments = await pool.query('SELECT COUNT(*) as count FROM p6_resource_assignments');
        console.log('Assignments:', assignments.rows[0].count);

        const entries = await pool.query('SELECT COUNT(*) as count FROM dpr_supervisor_entries');
        console.log('DPR Entries:', entries.rows[0].count);

        const projects = await pool.query('SELECT COUNT(*) as count FROM p6_projects');
        console.log('Projects:', projects.rows[0].count);

        // Check sample activities with dates
        const sample = await pool.query('SELECT "name", "plannedFinishDate", "actualFinishDate" FROM p6_activities WHERE "plannedFinishDate" IS NOT NULL LIMIT 3');
        console.log('Sample Activities with dates:', sample.rows);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkData();
