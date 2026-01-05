// check-activities.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function check() {
    try {
        const r = await pool.query('SELECT COUNT(*) FROM p6_activities WHERE "projectObjectId" = $1', [1999]);
        console.log('Activities for projectObjectId 1999:', r.rows[0].count);

        const sample = await pool.query('SELECT "activityId", "name" FROM p6_activities WHERE "projectObjectId" = $1 LIMIT 3', [1999]);
        console.log('Sample activities:');
        console.log(sample.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

check();
