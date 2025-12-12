const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

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

// Function to list all projects
async function listProjects() {
  try {
    const result = await pool.query(`
      SELECT id, name, location, status, progress, plan_start, plan_end 
      FROM projects 
      ORDER BY id
    `);
    
    console.log(`Total projects: ${result.rows.length}`);
    console.log('Projects list:');
    console.log('=====================================');
    
    result.rows.forEach((project, index) => {
      console.log(`${index + 1}. ID: ${project.id}`);
      console.log(`   Name: ${project.name}`);
      console.log(`   Location: ${project.location}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Progress: ${project.progress}%`);
      console.log(`   Plan Start: ${project.plan_start.toISOString().split('T')[0]}`);
      console.log(`   Plan End: ${project.plan_end.toISOString().split('T')[0]}`);
      console.log('-------------------------------------');
    });
    
    // Close the pool
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error listing projects:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the function
listProjects();