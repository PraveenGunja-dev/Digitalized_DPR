// server/run-p6-schema.js
// Script to execute P6 data schema

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5431,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
});

async function runSchema() {
    console.log('Connecting to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);

    try {
        // Read the SQL file
        const schemaPath = path.join(__dirname, 'database', 'p6-data-schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('\nExecuting P6 data schema...');

        // Execute the SQL
        await pool.query(sql);

        console.log('\n✅ P6 data schema executed successfully!');

        // Verify tables were created
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'p6_%'
            ORDER BY table_name
        `);

        console.log('\nP6 Tables in database:');
        result.rows.forEach(row => {
            console.log('  - ' + row.table_name);
        });

    } catch (error) {
        console.error('Error executing schema:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runSchema();
