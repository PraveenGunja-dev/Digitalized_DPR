// server/test-oracle-p6-sync.js
// Test script for Oracle P6 project and activity synchronization

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');
const OracleP6ProjectService = require('./services/oracleP6ProjectService');
const OracleP6ActivityService = require('./services/oracleP6ActivityService');

// Create database pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function testOracleP6Sync() {
    console.log('='.repeat(60));
    console.log('Oracle P6 Synchronization Test');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Initialize services
        const projectService = new OracleP6ProjectService(pool);
        const activityService = new OracleP6ActivityService(pool);

        // Step 1: Sync all projects
        console.log('Step 1: Syncing all projects from Oracle P6...');
        const projectSyncResult = await projectService.syncAllProjects();
        console.log('✓ Project sync completed');
        console.log('  - Total Projects:', projectSyncResult.totalProjects);
        console.log('  - Synced:', projectSyncResult.syncedCount);
        console.log('  - Errors:', projectSyncResult.errorCount);
        if (projectSyncResult.errors && projectSyncResult.errors.length > 0) {
            console.log('  - Error Details:', JSON.stringify(projectSyncResult.errors, null, 2));
        }
        console.log('');

        // Step 2: Get synced projects from database
        console.log('Step 2: Fetching synced projects from database...');
        const result = await pool.query(
            'SELECT id, name, p6_object_id, p6_last_sync, p6_sync_status FROM projects WHERE p6_object_id IS NOT NULL'
        );
        console.log('✓ Found', result.rows.length, 'synced projects');
        result.rows.forEach(project => {
            console.log(`  - ${project.name} (P6 ID: ${project.p6_object_id}, Synced: ${project.p6_last_sync})`);
        });
        console.log('');

        // Step 3: Sync activities for first project (if available)
        if (result.rows.length > 0) {
            const firstProject = result.rows[0];
            console.log(`Step 3: Syncing activities for project "${firstProject.name}"...`);

            try {
                const activitySyncResult = await activityService.syncActivitiesForProject(
                    firstProject.p6_object_id,
                    firstProject.id
                );
                console.log('✓ Activity sync completed');
                console.log('  - Total Activities:', activitySyncResult.totalActivities);
                console.log('  - Synced:', activitySyncResult.syncedCount);
                console.log('  - Errors:', activitySyncResult.errorCount);
                if (activitySyncResult.errors && activitySyncResult.errors.length > 0) {
                    console.log('  - Error Details:', JSON.stringify(activitySyncResult.errors, null, 2));
                }
            } catch (error) {
                console.log('✗ Activity sync failed:', error.message);
            }
            console.log('');
        }

        console.log('='.repeat(60));
        console.log('Sync test completed successfully!');
        console.log('='.repeat(60));

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('='.repeat(60));
        console.error('Sync test failed with error:');
        console.error(error.message);
        console.error('='.repeat(60));
        console.error('');
        console.error('Stack trace:');
        console.error(error.stack);

        await pool.end();
        process.exit(1);
    }
}

// Run the test
testOracleP6Sync();
