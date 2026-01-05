require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5431,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Prvn@3315',
});

async function testQuery() {
  const query = `
      WITH combined_entries AS (
        SELECT 
          d.id,
          d.sheet_type::text,
          d.project_id,
          d.supervisor_id AS user_id,
          d.status,
          d.data_json,
          d.created_at,
          d.updated_at,
          d.submitted_at,
          d.pm_reviewed_at AS approved_at,
          NULL::timestamp AS final_approved_at,
          d.rejection_reason
        FROM dpr_supervisor_entries d
        
        UNION ALL
        
        SELECT 
          c.id,
          c.sheet_type::text,
          c.project_id,
          c.supervisor_id AS user_id,
          c.status,
          c.data_json,
          c.created_at,
          c.updated_at,
          c.submitted_at,
          NULL::timestamp AS approved_at,
          NULL::timestamp AS final_approved_at,
          NULL::text AS rejection_reason
        FROM custom_sheet_entries c
      )
      SELECT 
        e.id,
        e.sheet_type,
        e.project_id,
        COALESCE(p.name, p6.name) AS project_name,
        e.user_id,
        u.name AS submitted_by,
        u.role AS user_role,
        e.status,
        e.data_json,
        e.created_at,
        e.updated_at,
        e.submitted_at,
        e.approved_at,
        e.final_approved_at,
        e.rejection_reason
      FROM combined_entries e
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN p6_projects p6 ON e.project_id = p6."objectId"
      LEFT JOIN users u ON e.user_id = u.user_id
      WHERE 1=1
      LIMIT 5
  `;

  try {
    console.log('Testing SQL query...');
    const res = await pool.query(query);
    console.log('Query successful! Rows:', res.rows.length);
    if (res.rows.length > 0) console.log('Sample row:', res.rows[0]);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    pool.end();
  }
}

testQuery();
