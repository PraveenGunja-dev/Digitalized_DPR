const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkMmsRfiTables() {
  try {
    console.log('Checking for MMS & RFI tables...');
    
    // Check if mms_rfi_dynamic_columns table exists
    const mmsRfiColumnsResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'mms_rfi_dynamic_columns'
    `);
    
    if (mmsRfiColumnsResult.rows.length > 0) {
      console.log('✓ mms_rfi_dynamic_columns table exists');
      
      // Check the structure of the table
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'mms_rfi_dynamic_columns' 
        ORDER BY ordinal_position
      `);
      
      console.log('Columns in mms_rfi_dynamic_columns:');
      columnsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    } else {
      console.log('✗ mms_rfi_dynamic_columns table does not exist');
    }
    
    // Check if mms_rfi_entries table exists
    const mmsRfiEntriesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'mms_rfi_entries'
    `);
    
    if (mmsRfiEntriesResult.rows.length > 0) {
      console.log('✓ mms_rfi_entries table exists');
      
      // Check the structure of the table
      const entriesResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'mms_rfi_entries' 
        ORDER BY ordinal_position
      `);
      
      console.log('Columns in mms_rfi_entries:');
      entriesResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    } else {
      console.log('✗ mms_rfi_entries table does not exist');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkMmsRfiTables();