// check-location.js
require('dotenv').config();
const pool = require('./db');

async function check() {
    try {
        // Check if location column exists
        const cols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'p6_projects'
            ORDER BY ordinal_position
        `);
        console.log('p6_projects columns:', cols.rows.map(r => r.column_name));

        // Check sample project data
        const sample = await pool.query(`
            SELECT "objectId", "projectId", "name" 
            FROM p6_projects 
            LIMIT 2
        `);
        console.log('\nSample projects:', sample.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
