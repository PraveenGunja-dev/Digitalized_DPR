// sync-p6-udfs.js
// Sync UDFs and Activity Codes from P6
// Execute with: node sync-p6-udfs.js [projectObjectId]

require('dotenv').config({ path: '../.env' });
const { restClient } = require('./services/oracleP6RestClient');
const pool = require('./db');

function log(msg) {
    console.log(`[P6 UDF Sync] ${msg}`);
}

// Sync Activity UDF Values
async function syncActivityUDFs(projectObjectIds) {
    log('Syncing Activity UDF Values...');

    const filter = `ProjectObjectId IN (${projectObjectIds.join(',')})`;

    try {
        const udfValues = await restClient.get('/udfValue', {
            Fields: 'ObjectId,ForeignObjectId,UDFTypeObjectId,UDFTypeTitle,Text,Double,Integer,Cost',
            Filter: filter
        });

        log(`Fetched ${udfValues.length} Activity UDF values`);

        for (const udf of udfValues) {
            // Get the value from whichever field has it
            const value = udf.Text || udf.Double || udf.Integer || udf.Cost || null;

            await pool.query(`
                INSERT INTO p6_activity_udf_values ("objectId", "foreignObjectId", "udfTypeObjectId", "udfTypeTitle", "udfValue", "lastSyncAt")
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT ("objectId") DO UPDATE SET
                    "foreignObjectId" = EXCLUDED."foreignObjectId",
                    "udfTypeObjectId" = EXCLUDED."udfTypeObjectId",
                    "udfTypeTitle" = EXCLUDED."udfTypeTitle",
                    "udfValue" = EXCLUDED."udfValue",
                    "lastSyncAt" = NOW()
            `, [udf.ObjectId, udf.ForeignObjectId, udf.UDFTypeObjectId, udf.UDFTypeTitle, value]);
        }

        log(`✓ Synced ${udfValues.length} Activity UDF values`);
        return udfValues.length;
    } catch (error) {
        log(`Error syncing Activity UDFs: ${error.message}`);
        return 0;
    }
}

// Sync Activity Code Types
async function syncActivityCodeTypes(projectObjectIds) {
    log('Syncing Activity Code Types...');

    try {
        // Try both project-level and global codes
        let codeTypes = [];

        for (const projectId of projectObjectIds) {
            try {
                const types = await restClient.get('/activityCodeType', {
                    Fields: 'ObjectId,Name,Scope,ProjectObjectId',
                    Filter: `ProjectObjectId = ${projectId}`
                });
                codeTypes.push(...types);
            } catch (e) {
                // Skip failed project
            }
        }

        // Also get global code types (no filter)
        try {
            const globalTypes = await restClient.get('/activityCodeType', {
                Fields: 'ObjectId,Name,Scope'
            });
            codeTypes.push(...globalTypes);
        } catch (e) {
            // Skip if fails
        }

        log(`Fetched ${codeTypes.length} Activity Code Types`);

        for (const ct of codeTypes) {
            await pool.query(`
                INSERT INTO p6_activity_code_types ("objectId", "name", "scope", "projectObjectId", "lastSyncAt")
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT ("objectId") DO UPDATE SET
                    "name" = EXCLUDED."name",
                    "scope" = EXCLUDED."scope",
                    "projectObjectId" = EXCLUDED."projectObjectId",
                    "lastSyncAt" = NOW()
            `, [ct.ObjectId, ct.Name, ct.Scope, ct.ProjectObjectId]);
        }

        log(`✓ Synced ${codeTypes.length} Activity Code Types`);
        return codeTypes.length;
    } catch (error) {
        log(`Error syncing Activity Code Types: ${error.message}`);
        return 0;
    }
}

// Sync Activity Codes (the actual values like "High", "Medium", "Low")
async function syncActivityCodes(projectObjectIds) {
    log('Syncing Activity Codes...');

    try {
        let codes = [];

        for (const projectId of projectObjectIds) {
            try {
                const projectCodes = await restClient.get('/activityCode', {
                    Fields: 'ObjectId,CodeTypeObjectId,CodeValue,Description,Name',
                    Filter: `ProjectObjectId = ${projectId}`
                });
                codes.push(...projectCodes);
            } catch (e) {
                // Skip
            }
        }

        // Also try global codes
        try {
            const globalCodes = await restClient.get('/activityCode', {
                Fields: 'ObjectId,CodeTypeObjectId,CodeValue,Description,Name'
            });
            codes.push(...globalCodes);
        } catch (e) {
            // Skip
        }

        log(`Fetched ${codes.length} Activity Codes`);

        for (const c of codes) {
            await pool.query(`
                INSERT INTO p6_activity_codes ("objectId", "activityCodeTypeObjectId", "codeValue", "name", "description", "lastSyncAt")
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT ("objectId") DO UPDATE SET
                    "activityCodeTypeObjectId" = EXCLUDED."activityCodeTypeObjectId",
                    "codeValue" = EXCLUDED."codeValue",
                    "name" = EXCLUDED."name",
                    "description" = EXCLUDED."description",
                    "lastSyncAt" = NOW()
            `, [c.ObjectId, c.CodeTypeObjectId, c.CodeValue, c.Name, c.Description]);
        }

        log(`✓ Synced ${codes.length} Activity Codes`);
        return codes.length;
    } catch (error) {
        log(`Error syncing Activity Codes: ${error.message}`);
        return 0;
    }
}

// Sync Activity Code Assignments (links activities to codes)
async function syncActivityCodeAssignments(projectObjectIds) {
    log('Syncing Activity Code Assignments...');

    try {
        let assignments = [];

        for (const projectId of projectObjectIds) {
            try {
                const projectAssignments = await restClient.get('/activityCodeAssignment', {
                    Fields: 'ObjectId,ActivityObjectId,ActivityCodeObjectId,ProjectObjectId',
                    Filter: `ProjectObjectId = ${projectId}`
                });
                assignments.push(...projectAssignments);
            } catch (e) {
                // Skip
            }
        }

        log(`Fetched ${assignments.length} Activity Code Assignments`);

        for (const a of assignments) {
            await pool.query(`
                INSERT INTO p6_activity_code_assignments ("objectId", "activityObjectId", "activityCodeObjectId", "projectObjectId", "lastSyncAt")
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT ("objectId") DO UPDATE SET
                    "activityObjectId" = EXCLUDED."activityObjectId",
                    "activityCodeObjectId" = EXCLUDED."activityCodeObjectId",
                    "projectObjectId" = EXCLUDED."projectObjectId",
                    "lastSyncAt" = NOW()
            `, [a.ObjectId, a.ActivityObjectId, a.ActivityCodeObjectId, a.ProjectObjectId]);
        }

        log(`✓ Synced ${assignments.length} Activity Code Assignments`);
        return assignments.length;
    } catch (error) {
        log(`Error syncing Activity Code Assignments: ${error.message}`);
        return 0;
    }
}

// Sync WBS UDF Values (for Block Capacity, SPV, etc.)
async function syncWBSUDFs(projectObjectIds) {
    log('Syncing WBS UDF Values...');

    try {
        // Get WBS ObjectIds for these projects
        const wbsResult = await pool.query(
            `SELECT "wbsObjectId" FROM p6_wbs WHERE "projectObjectId" = ANY($1)`,
            [projectObjectIds]
        );

        if (wbsResult.rows.length === 0) {
            log('No WBS found to sync UDFs for');
            return 0;
        }

        const wbsIds = wbsResult.rows.map(r => r.wbsObjectId);
        log(`Found ${wbsIds.length} WBS elements to get UDFs for`);

        // Fetch UDFs in batches
        let allUdfs = [];
        const batchSize = 50;

        for (let i = 0; i < wbsIds.length; i += batchSize) {
            const batch = wbsIds.slice(i, i + batchSize);
            try {
                const udfValues = await restClient.get('/udfValue', {
                    Fields: 'ObjectId,ForeignObjectId,UDFTypeTitle,Text,Double',
                    Filter: `ForeignObjectId IN (${batch.join(',')})`
                });
                allUdfs.push(...udfValues);
            } catch (e) {
                // Skip failed batch
            }
        }

        log(`Fetched ${allUdfs.length} WBS UDF values`);

        for (const udf of allUdfs) {
            const value = udf.Text || udf.Double || null;

            await pool.query(`
                INSERT INTO p6_wbs_udf_values ("objectId", "foreignObjectId", "udfTypeTitle", "udfValue", "lastSyncAt")
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT ("objectId") DO UPDATE SET
                    "foreignObjectId" = EXCLUDED."foreignObjectId",
                    "udfTypeTitle" = EXCLUDED."udfTypeTitle",
                    "udfValue" = EXCLUDED."udfValue",
                    "lastSyncAt" = NOW()
            `, [udf.ObjectId, udf.ForeignObjectId, udf.UDFTypeTitle, value]);
        }

        log(`✓ Synced ${allUdfs.length} WBS UDF values`);
        return allUdfs.length;
    } catch (error) {
        log(`Error syncing WBS UDFs: ${error.message}`);
        return 0;
    }
}

async function main() {
    const projectObjectId = process.argv[2] || null;

    console.log('===========================================');
    console.log('P6 UDF & ACTIVITY CODE SYNC');
    console.log('===========================================');

    try {
        // Get project IDs
        let projectIds;
        if (projectObjectId) {
            projectIds = [parseInt(projectObjectId)];
            log(`Syncing UDFs for project: ${projectObjectId}`);
        } else {
            // Get all synced projects from DB
            const projects = await pool.query('SELECT "objectId" FROM p6_projects');
            projectIds = projects.rows.map(p => p.objectId);
            log(`Syncing UDFs for ${projectIds.length} projects`);
        }

        if (projectIds.length === 0) {
            log('No projects found! Run sync-p6-optimized.js first.');
            process.exit(1);
        }

        // Sync UDFs and Codes
        const results = {
            activityUDFs: await syncActivityUDFs(projectIds),
            activityCodeTypes: await syncActivityCodeTypes(projectIds),
            activityCodes: await syncActivityCodes(projectIds),
            activityCodeAssignments: await syncActivityCodeAssignments(projectIds),
            wbsUDFs: await syncWBSUDFs(projectIds)
        };

        console.log('');
        console.log('===========================================');
        console.log('✓ UDF & ACTIVITY CODE SYNC COMPLETED');
        console.log('===========================================');
        console.log('Records synced:');
        Object.entries(results).forEach(([key, count]) => {
            console.log(`  - ${key}: ${count}`);
        });

        // Report which UDFs were found
        console.log('');
        console.log('Expected UDFs for DPR:');
        console.log('  Activity: Scope, Front, Remarks, Hold Due to WTG');
        console.log('  WBS: Block Capacity, SPV Number, Block, Phase');
        console.log('  Activity Codes: Priority, Plot, New Block Nom');

    } catch (error) {
        console.error('Sync error:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

main();
