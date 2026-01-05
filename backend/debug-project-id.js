require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function findProject() {
    try {
        const searchId = 7138;

        console.log(`Searching for project ID: ${searchId}`);

        // Check projects table
        const localRes = await pool.query('SELECT * FROM projects WHERE id = $1', [searchId]);
        console.log(`Found in 'projects' table: ${localRes.rows.length}`);
        if (localRes.rows.length > 0) console.log(localRes.rows[0]);

        // Check p6_projects table by objectId
        const p6ObjRes = await pool.query('SELECT * FROM p6_projects WHERE "objectId" = $1', [searchId]);
        console.log(`Found in 'p6_projects' table (by objectId): ${p6ObjRes.rows.length}`);
        if (p6ObjRes.rows.length > 0) console.log(p6ObjRes.rows[0]);

        // Check p6_projects table by Id (string identifier)
        // Note: 'Id' column might be case sensitive or named differently, checking common names
        // Checking previous schema or queries might help, but let's try generic first or look at p6_projects columns

        const columnsRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'p6_projects'
    `);
        const columns = columnsRes.rows.map(r => r.column_name);
        console.log('p6_projects columns:', columns);

        if (columns.includes('Id')) {
            const p6IdRes = await pool.query('SELECT * FROM p6_projects WHERE "Id" = $1', [searchId.toString()]);
            console.log(`Found in 'p6_projects' table (by Id column): ${p6IdRes.rows.length}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

findProject();
