// sync-all-p6.js
// Full P6 sync using new schema with correct field mappings
// Execute with: node sync-all-p6.js

require('dotenv').config({ path: '../.env' });
const { cleanP6SyncService } = require('./services/cleanP6SyncService');

async function main() {
    console.log('===========================================');
    console.log('P6 FULL SYNC - NEW SCHEMA');
    console.log('===========================================');
    console.log('');
    console.log('Sync order (per P6 API spec):');
    console.log('  1. projects');
    console.log('  2. wbs');
    console.log('  3. activities');
    console.log('  4. resources');
    console.log('  5. resourceAssignments');
    console.log('  6. activityUDFValues');
    console.log('  7. wbsUDFValues');
    console.log('  8. projectUDFValues');
    console.log('  9. activityCodeAssignments');
    console.log('');

    try {
        const result = await cleanP6SyncService.syncAll();

        console.log('');
        console.log('===========================================');
        if (result.success) {
            console.log('✓ P6 SYNC COMPLETED SUCCESSFULLY');
            console.log('');
            console.log('Records synced:');
            Object.entries(result.results).forEach(([key, count]) => {
                console.log(`  - ${key}: ${count}`);
            });
        } else {
            console.log('✗ P6 SYNC FAILED');
            console.log(`Error: ${result.error}`);
        }
        console.log('===========================================');

    } catch (error) {
        console.error('Sync error:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

main();
