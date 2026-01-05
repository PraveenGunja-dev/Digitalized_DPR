// check-udfs.js - Check UDF sync results
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function check() {
    try {
        console.log('=== UDF & ACTIVITY CODE SYNC RESULTS ===\n');

        // Count UDFs
        const actUdf = await pool.query('SELECT COUNT(*) FROM p6_activity_udf_values');
        console.log('Activity UDF Values:', actUdf.rows[0].count);

        const wbsUdf = await pool.query('SELECT COUNT(*) FROM p6_wbs_udf_values');
        console.log('WBS UDF Values:', wbsUdf.rows[0].count);

        const codeTypes = await pool.query('SELECT COUNT(*) FROM p6_activity_code_types');
        console.log('Activity Code Types:', codeTypes.rows[0].count);

        const codes = await pool.query('SELECT COUNT(*) FROM p6_activity_codes');
        console.log('Activity Codes:', codes.rows[0].count);

        const codeAssign = await pool.query('SELECT COUNT(*) FROM p6_activity_code_assignments');
        console.log('Activity Code Assignments:', codeAssign.rows[0].count);

        // Sample activity UDFs
        console.log('\n--- Sample Activity UDFs ---');
        const sampleActUdf = await pool.query(`
            SELECT "udfTypeTitle", COUNT(*) as count
            FROM p6_activity_udf_values
            GROUP BY "udfTypeTitle"
            ORDER BY count DESC
            LIMIT 10
        `);
        sampleActUdf.rows.forEach(r => console.log(`  ${r.udfTypeTitle}: ${r.count}`));

        // Sample WBS UDFs
        console.log('\n--- Sample WBS UDFs ---');
        const sampleWbsUdf = await pool.query(`
            SELECT "udfTypeTitle", COUNT(*) as count
            FROM p6_wbs_udf_values
            GROUP BY "udfTypeTitle"
            ORDER BY count DESC
            LIMIT 10
        `);
        sampleWbsUdf.rows.forEach(r => console.log(`  ${r.udfTypeTitle}: ${r.count}`));

        // Sample Activity Code Types
        console.log('\n--- Activity Code Types ---');
        const sampleCodeTypes = await pool.query(`
            SELECT "name", "scope"
            FROM p6_activity_code_types
            LIMIT 10
        `);
        sampleCodeTypes.rows.forEach(r => console.log(`  ${r.name} (${r.scope})`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

check();
