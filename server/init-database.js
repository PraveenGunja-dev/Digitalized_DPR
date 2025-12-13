const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Function to initialize the database
async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read the main schema file
    const mainSchema = fs.readFileSync(path.resolve(__dirname, 'database/schema.sql'), 'utf8');
    
    // Read the MMS & RFI dynamic columns schema file
    const mmsRfiSchema = fs.readFileSync(path.resolve(__dirname, 'database/mms_rfi_dynamic_columns_schema.sql'), 'utf8');
    
    // Combine schemas
    const combinedSchema = mainSchema + '\n' + mmsRfiSchema;
    
    // Split the schema into individual statements
    const statements = combinedSchema.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim() !== '') {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('Database initialized successfully!');
    
    // Close the pool
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error initializing database:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the function
initDatabase();