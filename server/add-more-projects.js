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

// Function to count existing projects
async function countExistingProjects() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM projects');
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting projects:', error);
    return 0;
  }
}

// Function to create multiple dummy projects
async function createMultipleDummyProjects() {
  try {
    // First, count existing projects
    const existingCount = await countExistingProjects();
    console.log(`Currently ${existingCount} projects in database`);
    
    // Calculate how many more we need to reach 10
    const projectsNeeded = 10 - existingCount;
    
    if (projectsNeeded <= 0) {
      console.log('Already have 10 or more projects. No need to add more.');
      await pool.end();
      return;
    }
    
    console.log(`Adding ${projectsNeeded} more projects to reach 10 total...`);
    
    // Array of dummy project data
    const projects = [
      {
        name: 'Khavda Hybrid Solar Phase 3',
        location: 'Khavda, Gujarat',
        status: 'active',
        progress: 45,
        plan_start: '2025-01-15',
        plan_end: '2026-03-30'
      },
      {
        name: 'Rajasthan Wind Farm Expansion',
        location: 'Jaisalmer, Rajasthan',
        status: 'planning',
        progress: 15,
        plan_start: '2025-04-01',
        plan_end: '2026-08-15'
      },
      {
        name: 'Tamil Nadu Solar Park',
        location: 'Ramanathapuram, Tamil Nadu',
        status: 'active',
        progress: 75,
        plan_start: '2024-11-01',
        plan_end: '2025-12-31'
      },
      {
        name: 'Karnataka Hydroelectric Project',
        location: 'Shimoga, Karnataka',
        status: 'on_hold',
        progress: 30,
        plan_start: '2025-03-10',
        plan_end: '2026-09-20'
      },
      {
        name: 'Maharashtra Biomass Plant',
        location: 'Nagpur, Maharashtra',
        status: 'active',
        progress: 60,
        plan_start: '2025-02-01',
        plan_end: '2026-01-15'
      },
      {
        name: 'Odisha Coastal Wind Project',
        location: 'Ganjam, Odisha',
        status: 'completed',
        progress: 100,
        plan_start: '2023-06-01',
        plan_end: '2024-11-30'
      },
      {
        name: 'Andhra Pradesh Solar Initiative',
        location: 'Anantapur, Andhra Pradesh',
        status: 'active',
        progress: 40,
        plan_start: '2025-01-01',
        plan_end: '2026-04-30'
      },
      {
        name: 'Telangana Geothermal Project',
        location: 'Mahbubnagar, Telangana',
        status: 'planning',
        progress: 5,
        plan_start: '2025-05-01',
        plan_end: '2026-10-15'
      },
      {
        name: 'Madhya Pradesh Solar-Wind Hybrid',
        location: 'Indore, Madhya Pradesh',
        status: 'active',
        progress: 55,
        plan_start: '2025-01-20',
        plan_end: '2026-02-28'
      },
      {
        name: 'West Bengal Biomass Facility',
        location: 'Siliguri, West Bengal',
        status: 'active',
        progress: 35,
        plan_start: '2025-03-01',
        plan_end: '2026-05-31'
      }
    ];

    // Insert the required number of projects
    for (let i = 0; i < Math.min(projectsNeeded, projects.length); i++) {
      const project = projects[i];
      const result = await pool.query(`
        INSERT INTO projects 
        (name, location, status, progress, plan_start, plan_end)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, location, status, progress, plan_start, plan_end
      `, [
        project.name,
        project.location,
        project.status,
        project.progress,
        project.plan_start,
        project.plan_end
      ]);
      
      console.log(`Created project ${i + 1}:`, result.rows[0]);
    }
    
    // Final count
    const finalCount = await countExistingProjects();
    console.log(`Successfully added projects. Total projects now: ${finalCount}`);
    
    // Close the pool
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error creating dummy projects:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the function
createMultipleDummyProjects();