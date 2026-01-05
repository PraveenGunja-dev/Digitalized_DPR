// sync-p6-optimized.js
// Optimized P6 sync - ONLY fetches required fields and filters by project
// Execute with: node sync-p6-optimized.js [projectObjectId]

require('dotenv').config({ path: '../.env' });
const { restClient } = require('./services/oracleP6RestClient');
const pool = require('./db');

// Required fields per entity (minimal set)
const REQUIRED_FIELDS = {
    project: ['ObjectId', 'Id', 'Name', 'Status', 'StartDate', 'FinishDate'],
    activity: ['ObjectId', 'Id', 'Name', 'PlannedStartDate', 'PlannedFinishDate', 'ActualStartDate', 'ActualFinishDate', 'Status', 'WBSObjectId', 'ProjectObjectId'],
    wbs: ['ObjectId', 'Name', 'ParentObjectId', 'ProjectObjectId', 'Code'],
    resource: ['ObjectId', 'Id', 'Name', 'ResourceType'],
    resourceAssignment: ['ObjectId', 'ActivityObjectId', 'ResourceObjectId', 'PlannedUnits', 'ActualUnits', 'RemainingUnits', 'ProjectObjectId']
};

async function log(msg) {
    console.log(`[P6 Sync] ${msg}`);
}

// Get specific project(s) to sync
async function getProjectToSync(projectObjectId = null) {
    const filter = projectObjectId ? `ObjectId = ${projectObjectId}` : null;
    const params = { Fields: REQUIRED_FIELDS.project.join(',') };
    if (filter) params.Filter = filter;

    const projects = await restClient.get('/project', params);
    return Array.isArray(projects) ? projects : [];
}

// Sync projects
async function syncProjects(projects) {
    log(`Syncing ${projects.length} projects...`);

    for (const p of projects) {
        await pool.query(`
            INSERT INTO p6_projects ("objectId", "projectId", "name", "status", "startDate", "finishDate", "lastSyncAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT ("objectId") DO UPDATE SET
                "projectId" = EXCLUDED."projectId", "name" = EXCLUDED."name",
                "status" = EXCLUDED."status", "startDate" = EXCLUDED."startDate",
                "finishDate" = EXCLUDED."finishDate", "lastSyncAt" = NOW()
        `, [p.ObjectId, p.Id, p.Name, p.Status, p.StartDate, p.FinishDate]);
    }

    log(`✓ Synced ${projects.length} projects`);
    return projects.length;
}

// Sync WBS for specific project(s)
async function syncWBS(projectObjectIds) {
    const filter = `ProjectObjectId IN (${projectObjectIds.join(',')})`;

    const wbsList = await restClient.get('/wbs', {
        Fields: REQUIRED_FIELDS.wbs.join(','),
        Filter: filter
    });

    log(`Fetched ${wbsList.length} WBS elements`);

    for (const w of wbsList) {
        await pool.query(`
            INSERT INTO p6_wbs ("wbsObjectId", "name", "parentObjectId", "projectObjectId", "code", "lastSyncAt")
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT ("wbsObjectId") DO UPDATE SET
                "name" = EXCLUDED."name", "parentObjectId" = EXCLUDED."parentObjectId",
                "projectObjectId" = EXCLUDED."projectObjectId", "code" = EXCLUDED."code", "lastSyncAt" = NOW()
        `, [w.ObjectId, w.Name, w.ParentObjectId, w.ProjectObjectId, w.Code]);
    }

    log(`✓ Synced ${wbsList.length} WBS elements`);
    return wbsList.length;
}

// Sync activities for specific project(s)
async function syncActivities(projectObjectIds) {
    const filter = `ProjectObjectId IN (${projectObjectIds.join(',')})`;

    const activities = await restClient.get('/activity', {
        Fields: REQUIRED_FIELDS.activity.join(','),
        Filter: filter
    });

    log(`Fetched ${activities.length} activities`);

    for (const a of activities) {
        await pool.query(`
            INSERT INTO p6_activities ("activityObjectId", "activityId", "name", "plannedStartDate", "plannedFinishDate", 
                "actualStartDate", "actualFinishDate", "status", "wbsObjectId", "projectObjectId", "lastSyncAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT ("activityObjectId") DO UPDATE SET
                "activityId" = EXCLUDED."activityId", "name" = EXCLUDED."name",
                "plannedStartDate" = EXCLUDED."plannedStartDate", "plannedFinishDate" = EXCLUDED."plannedFinishDate",
                "actualStartDate" = EXCLUDED."actualStartDate", "actualFinishDate" = EXCLUDED."actualFinishDate",
                "status" = EXCLUDED."status", "wbsObjectId" = EXCLUDED."wbsObjectId",
                "projectObjectId" = EXCLUDED."projectObjectId", "lastSyncAt" = NOW()
        `, [a.ObjectId, a.Id, a.Name, a.PlannedStartDate, a.PlannedFinishDate,
        a.ActualStartDate, a.ActualFinishDate, a.Status, a.WBSObjectId, a.ProjectObjectId]);
    }

    log(`✓ Synced ${activities.length} activities`);
    return activities.length;
}

// Sync resources (global - no project filter)
async function syncResources() {
    const resources = await restClient.get('/resource', {
        Fields: REQUIRED_FIELDS.resource.join(',')
    });

    log(`Fetched ${resources.length} resources`);

    for (const r of resources) {
        await pool.query(`
            INSERT INTO p6_resources ("resourceObjectId", "resourceId", "name", "resourceType", "lastSyncAt")
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT ("resourceObjectId") DO UPDATE SET
                "resourceId" = EXCLUDED."resourceId", "name" = EXCLUDED."name",
                "resourceType" = EXCLUDED."resourceType", "lastSyncAt" = NOW()
        `, [r.ObjectId, r.Id, r.Name, r.ResourceType]);
    }

    log(`✓ Synced ${resources.length} resources`);
    return resources.length;
}

// Sync resource assignments for specific project(s)
async function syncResourceAssignments(projectObjectIds) {
    const filter = `ProjectObjectId IN (${projectObjectIds.join(',')})`;

    const assignments = await restClient.get('/resourceAssignment', {
        Fields: REQUIRED_FIELDS.resourceAssignment.join(','),
        Filter: filter
    });

    log(`Fetched ${assignments.length} resource assignments`);

    for (const ra of assignments) {
        // Map P6 fields: PlannedUnits → targetQty, ActualUnits → actualQty
        await pool.query(`
            INSERT INTO p6_resource_assignments ("objectId", "activityObjectId", "resourceObjectId",
                "targetQty", "actualQty", "remainingQty", "actualUnits", "remainingUnits", "projectObjectId", "lastSyncAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            ON CONFLICT ("objectId") DO UPDATE SET
                "activityObjectId" = EXCLUDED."activityObjectId", "resourceObjectId" = EXCLUDED."resourceObjectId",
                "targetQty" = EXCLUDED."targetQty", "actualQty" = EXCLUDED."actualQty",
                "remainingQty" = EXCLUDED."remainingQty", "actualUnits" = EXCLUDED."actualUnits",
                "remainingUnits" = EXCLUDED."remainingUnits", "projectObjectId" = EXCLUDED."projectObjectId", "lastSyncAt" = NOW()
        `, [ra.ObjectId, ra.ActivityObjectId, ra.ResourceObjectId,
        ra.PlannedUnits, ra.ActualUnits, ra.RemainingUnits, ra.ActualUnits, ra.RemainingUnits, ra.ProjectObjectId]);
    }

    log(`✓ Synced ${assignments.length} resource assignments`);
    return assignments.length;
}

async function main() {
    const projectObjectId = process.argv[2] || null;

    console.log('===========================================');
    console.log('P6 OPTIMIZED SYNC');
    console.log('===========================================');
    if (projectObjectId) {
        console.log(`Syncing project: ${projectObjectId}`);
    } else {
        console.log('Syncing ALL projects (use: node sync-p6-optimized.js <projectObjectId> for single project)');
    }
    console.log('');

    try {
        // 1. Get projects
        const projects = await getProjectToSync(projectObjectId);
        if (projects.length === 0) {
            log('No projects found!');
            process.exit(1);
        }

        const projectIds = projects.map(p => p.ObjectId);
        log(`Found ${projects.length} project(s) to sync`);

        // 2. Sync in order
        const results = {
            projects: await syncProjects(projects),
            wbs: await syncWBS(projectIds),
            activities: await syncActivities(projectIds),
            resources: await syncResources(),
            resourceAssignments: await syncResourceAssignments(projectIds)
        };

        console.log('');
        console.log('===========================================');
        console.log('✓ P6 SYNC COMPLETED');
        console.log('===========================================');
        console.log('Records synced:');
        Object.entries(results).forEach(([key, count]) => {
            console.log(`  - ${key}: ${count}`);
        });

        // Report missing fields (not available from P6 API)
        console.log('');
        console.log('===========================================');
        console.log('FIELDS NOT AVAILABLE FROM P6:');
        console.log('===========================================');
        console.log('  - forecastFinishDate: Not returned by P6 activity endpoint');
        console.log('  - unitOfMeasure: Not in standard resource endpoint');
        console.log('  - Block Capacity, SPV Number, Block, Phase: Need UDF sync');
        console.log('  - Priority, Plot, New Block Nom: Need Activity Code sync');
        console.log('  - Scope, Front, Remarks: Need Activity UDF sync');

    } catch (error) {
        console.error('Sync error:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

main();
