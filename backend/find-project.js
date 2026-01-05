// find-project.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function find() {
    try {
        const r = await pool.query(`
            SELECT "objectId", "projectId", "name" 
            FROM p6_projects 
            WHERE "name" LIKE '%PSS_11%' OR "projectId" LIKE '%PSS%'
            LIMIT 5
        `);
        console.log('Matching projects:');
        console.log(r.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

find();
