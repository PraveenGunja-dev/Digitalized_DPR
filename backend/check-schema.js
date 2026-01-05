// check-schema.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function check() {
    try {
        const r = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'p6_activities' 
            ORDER BY ordinal_position
        `);
        console.log('p6_activities columns:');
        r.rows.forEach(row => console.log(' -', row.column_name));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

check();
