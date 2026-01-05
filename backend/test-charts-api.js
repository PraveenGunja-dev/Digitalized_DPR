// test-charts-api.js
require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function testCharts() {
    try {
        console.log('Testing Charts API queries...\n');
        const projectId = 1981; // Test Project ID

        // 1. Planned vs Actual
        console.log('1. Planned vs Actual:');
        const qa1 = `
      SELECT
        TO_CHAR(pa."plannedFinishDate", 'Mon-YY') as name,
        SUM(pra."targetQty") as planned,
        SUM(pra."actualQty") as actual
      FROM p6_activities pa
      JOIN p6_resource_assignments pra ON pa."activityObjectId" = pra."activityObjectId"
      WHERE pa."projectObjectId" = $1
      GROUP BY 1, pa."plannedFinishDate"
      ORDER BY pa."plannedFinishDate"
      LIMIT 1 -- Limit to avoid noise
    `;
        const r1 = await pool.query(qa1, [projectId]);
        console.log(r1.rows);

        // 2. Completion Delay
        console.log('\n2. Completion Delay:');
        const qa2 = `
      SELECT DISTINCT ON (pa."activityObjectId")
        pa."name",
        COALESCE(
          (CASE WHEN pra."targetQty" > 0 THEN (pra."actualQty" / pra."targetQty") * 100 ELSE 0 END), 
          0
        ) as completion,
        EXTRACT(DAY FROM (COALESCE(pa."actualFinishDate", CURRENT_DATE) - pa."plannedFinishDate")) as delay
      FROM p6_activities pa
      LEFT JOIN p6_resource_assignments pra ON pa."activityObjectId" = pra."activityObjectId"
      WHERE pa."projectObjectId" = $1
      AND (
          (pa."actualFinishDate" > pa."plannedFinishDate") 
          OR 
          (pa."actualFinishDate" IS NULL AND CURRENT_DATE > pa."plannedFinishDate")
      )
      ORDER BY pa."activityObjectId", delay DESC
      LIMIT 1
    `;
        const r2 = await pool.query(qa2, [projectId]);
        console.log(r2.rows);

        // 7. Health Comparison
        console.log('\n7. Health Comparison:');
        const qa7 = `
      SELECT
        p."name",
        SUM(pra."targetQty") as total_target,
        SUM(pra."actualQty") as total_actual
      FROM p6_projects p
      JOIN p6_activities pa ON p."objectId" = pa."projectObjectId"
      JOIN p6_resource_assignments pra ON pa."activityObjectId" = pra."activityObjectId"
      GROUP BY p."name"
      HAVING SUM(pra."targetQty") > 0
      LIMIT 1
    `;
        const r7 = await pool.query(qa7);
        console.log(r7.rows);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        pool.end();
    }
}

testCharts();
