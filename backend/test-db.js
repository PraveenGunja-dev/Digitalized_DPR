require('dotenv').config();
const pool = require('./db');

async function testConnection() {
    try {
        console.log('Testing connection...');
        const result = await pool.query('SELECT NOW()');
        console.log('Connection successful:', result.rows[0]);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await pool.end();
    }
}

testConnection();
