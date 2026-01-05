require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5431,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Prvn@3315',
});

async function findProject() {
    try {
        const search = '%ASSIGN%';
        console.log(`Searching for projects matching: ${search}`);

        const local = await pool.query('SELECT * FROM projects WHERE name ILIKE $1', [search]);
        console.log('Local Projects:', local.rows);

        const p6 = await pool.query('SELECT * FROM p6_projects WHERE "name" ILIKE $1', [search]);
        console.log('P6 Projects:', p6.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

findProject();
