// server/fetch-and-store-projects.cjs
// Fetch projects from Oracle P6 and store them in the local database

const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import the P6 services
const { restClient } = require('./services/oracleP6RestClient');
const { syncProjectsFromP6 } = require('./services/oracleP6SyncService');

async function fetchAndStoreProjects() {
  try {
    console.log('='.repeat(80));
    console.log('Fetching and Storing Projects from Oracle P6');
    console.log('='.repeat(80));
    console.log('');
    
    // Set the token from environment
    const token = process.env.ORACLE_P6_AUTH_TOKEN;
    if (!token) {
      throw new Error('ORACLE_P6_AUTH_TOKEN not found in environment variables');
    }
    
    restClient.setToken(token);
    console.log('✓ Token set successfully');
    
    // Create database pool
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');
    
    // Sync projects from P6 to database
    console.log('\nStarting project sync from P6...');
    const syncResult = await syncProjectsFromP6(pool, token);
    
    console.log('\n' + '='.repeat(80));
    console.log('SYNC COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log(`Total projects from P6: ${syncResult.totalFromP6}`);
    console.log(`Inserted: ${syncResult.inserted}`);
    console.log(`Updated: ${syncResult.updated}`);
    console.log(`Errors: ${syncResult.errors}`);
    console.log(`Synced at: ${syncResult.syncedAt}`);
    
    // Display the synced projects
    if (syncResult.totalFromP6 > 0) {
      console.log('\nFetching synced projects from database...');
      const projectsResult = await pool.query(
        'SELECT object_id, p6_id, name, status FROM p6_projects ORDER BY name LIMIT 10'
      );
      
      console.log('\nFirst 10 synced projects:');
      console.log('-'.repeat(80));
      projectsResult.rows.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (ID: ${project.p6_id}, ObjectID: ${project.object_id}, Status: ${project.status})`);
      });
      
      if (projectsResult.rows.length < syncResult.totalFromP6) {
        console.log(`... and ${syncResult.totalFromP6 - projectsResult.rows.length} more projects`);
      }
    }
    
    await pool.end();
    console.log('\n✓ Database connection closed');
    console.log('\n🎉 Project sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in fetchAndStoreProjects:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the function
fetchAndStoreProjects();