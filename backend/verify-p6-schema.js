// Verify camelCase column names
const pool = require('./db');

async function verify() {
    try {
        // Check resource_assignments columns
        const columns = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'p6_resource_assignments'
            ORDER BY ordinal_position
        `);

        console.log('p6_resource_assignments columns (should be camelCase):');
        columns.rows.forEach(row => console.log('  -', row.column_name));

        // Check activities columns
        const actCols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'p6_activities'
            ORDER BY ordinal_position
        `);

        console.log('\np6_activities columns:');
        actCols.rows.forEach(row => console.log('  -', row.column_name));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

verify();
