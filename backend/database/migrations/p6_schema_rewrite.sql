-- P6 Schema with EXACT P6 API Field Names (camelCase)
-- Date: 2026-01-04
-- Purpose: Use exact P6 API field names - NO transformations needed

-- ============================================================================
-- STEP 1: DROP ALL EXISTING P6 TABLES
-- ============================================================================
DROP TABLE IF EXISTS p6_activity_code_assignments CASCADE;
DROP TABLE IF EXISTS p6_activity_codes CASCADE;
DROP TABLE IF EXISTS p6_activity_code_types CASCADE;
DROP TABLE IF EXISTS p6_activity_udf_values CASCADE;
DROP TABLE IF EXISTS p6_wbs_udf_values CASCADE;
DROP TABLE IF EXISTS p6_project_udf_values CASCADE;
DROP TABLE IF EXISTS p6_udf_values CASCADE;
DROP TABLE IF EXISTS p6_resource_assignments CASCADE;
DROP TABLE IF EXISTS p6_resources CASCADE;
DROP TABLE IF EXISTS p6_activities CASCADE;
DROP TABLE IF EXISTS p6_wbs CASCADE;
DROP TABLE IF EXISTS p6_relationships CASCADE;
DROP TABLE IF EXISTS p6_project_issues CASCADE;
DROP TABLE IF EXISTS p6_sync_log CASCADE;
DROP TABLE IF EXISTS p6_projects CASCADE;
DROP VIEW IF EXISTS v_p6_activity_details CASCADE;

-- ============================================================================
-- STEP 2: CREATE TABLES WITH EXACT P6 API FIELD NAMES
-- ============================================================================

-- 2.1 Projects Table
-- GET /projects
CREATE TABLE p6_projects (
    "objectId" BIGINT PRIMARY KEY,
    "projectId" TEXT,
    "name" TEXT,
    "status" TEXT,
    "startDate" TIMESTAMP,
    "finishDate" TIMESTAMP,
    "plannedStartDate" TIMESTAMP,
    "plannedFinishDate" TIMESTAMP,
    "dataDate" TIMESTAMP,
    "description" TEXT,
    "lastSyncAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_p6_projects_id ON p6_projects("projectId");

-- 2.2 WBS Table
-- GET /wbs
CREATE TABLE p6_wbs (
    "wbsObjectId" BIGINT PRIMARY KEY,
    "name" TEXT,
    "parentObjectId" BIGINT,
    "projectObjectId" BIGINT NOT NULL,
    "code" TEXT,
    "status" TEXT,
    "lastSyncAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_p6_wbs_project ON p6_wbs("projectObjectId");
CREATE INDEX idx_p6_wbs_parent ON p6_wbs("parentObjectId");

-- 2.3 Activities Table
-- GET /activities
CREATE TABLE p6_activities (
    "activityObjectId" BIGINT PRIMARY KEY,
    "activityId" TEXT,
    "name" TEXT,
    "plannedStartDate" TIMESTAMP,
    "plannedFinishDate" TIMESTAMP,
    "actualStartDate" TIMESTAMP,
    "actualFinishDate" TIMESTAMP,
    "forecastFinishDate" TIMESTAMP,
    "status" TEXT,
    "wbsObjectId" BIGINT,
    "projectObjectId" BIGINT NOT NULL,
    "lastSyncAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_p6_activities_project ON p6_activities("projectObjectId");
CREATE INDEX idx_p6_activities_wbs ON p6_activities("wbsObjectId");
CREATE INDEX idx_p6_activities_id ON p6_activities("activityId");

-- 2.4 Resources Table
-- GET /resources
CREATE TABLE p6_resources (
    "resourceObjectId" BIGINT PRIMARY KEY,
    "name" TEXT,
    "unitOfMeasure" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "lastSyncAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_p6_resources_type ON p6_resources("resourceType");
CREATE INDEX idx_p6_resources_name ON p6_resources("name");

-- 2.5 Resource Assignments Table
-- GET /resourceAssignments - EXACT field names from P6 API
CREATE TABLE p6_resource_assignments (
    "id" BIGSERIAL PRIMARY KEY,
    "objectId" BIGINT UNIQUE,
    "activityObjectId" BIGINT NOT NULL,
    "resourceObjectId" BIGINT NOT NULL,
    "targetQty" NUMERIC,
    "actualQty" NUMERIC,
    "remainingQty" NUMERIC,
    "actualUnits" NUMERIC,
    "remainingUnits" NUMERIC,
    "projectObjectId" BIGINT,
    "lastSyncAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_p6_ra_activity ON p6_resource_assignments("activityObjectId");
CREATE INDEX idx_p6_ra_resource ON p6_resource_assignments("resourceObjectId");
CREATE INDEX idx_p6_ra_project ON p6_resource_assignments("projectObjectId");

-- 2.6 Activity UDF Values
-- GET /activityUDFValues
CREATE TABLE p6_activity_udf_values (
    "id" BIGSERIAL PRIMARY KEY,
    "foreignObjectId" BIGINT NOT NULL,
    "udfTypeObjectId" BIGINT NOT NULL,
    "udfTypeTitle" TEXT,
    "udfValue" TEXT,
    UNIQUE("foreignObjectId", "udfTypeObjectId")
);

CREATE INDEX idx_p6_act_udf_foreign ON p6_activity_udf_values("foreignObjectId");

-- 2.7 WBS UDF Values
-- GET /wbsUDFValues
CREATE TABLE p6_wbs_udf_values (
    "id" BIGSERIAL PRIMARY KEY,
    "foreignObjectId" BIGINT NOT NULL,
    "udfTypeObjectId" BIGINT NOT NULL,
    "udfTypeTitle" TEXT,
    "udfValue" TEXT,
    UNIQUE("foreignObjectId", "udfTypeObjectId")
);

CREATE INDEX idx_p6_wbs_udf_foreign ON p6_wbs_udf_values("foreignObjectId");

-- 2.8 Project UDF Values
-- GET /projectUDFValues
CREATE TABLE p6_project_udf_values (
    "id" BIGSERIAL PRIMARY KEY,
    "foreignObjectId" BIGINT NOT NULL,
    "udfTypeObjectId" BIGINT NOT NULL,
    "udfTypeTitle" TEXT,
    "udfValue" TEXT,
    UNIQUE("foreignObjectId", "udfTypeObjectId")
);

CREATE INDEX idx_p6_proj_udf_foreign ON p6_project_udf_values("foreignObjectId");

-- 2.9 Activity Code Types
-- GET /activityCodeTypes
CREATE TABLE p6_activity_code_types (
    "objectId" BIGINT PRIMARY KEY,
    "name" TEXT,
    "scope" TEXT,
    "projectObjectId" BIGINT
);

-- 2.10 Activity Codes
-- GET /activityCodes
CREATE TABLE p6_activity_codes (
    "objectId" BIGINT PRIMARY KEY,
    "name" TEXT,
    "codeValue" TEXT,
    "description" TEXT,
    "activityCodeTypeObjectId" BIGINT,
    "color" TEXT
);

CREATE INDEX idx_p6_codes_type ON p6_activity_codes("activityCodeTypeObjectId");

-- 2.11 Activity Code Assignments
-- GET /activityCodeAssignments
CREATE TABLE p6_activity_code_assignments (
    "id" BIGSERIAL PRIMARY KEY,
    "activityObjectId" BIGINT NOT NULL,
    "activityCodeObjectId" BIGINT NOT NULL,
    UNIQUE("activityObjectId", "activityCodeObjectId")
);

CREATE INDEX idx_p6_code_assign_activity ON p6_activity_code_assignments("activityObjectId");

-- 2.12 Sync Log
CREATE TABLE p6_sync_log (
    "id" BIGSERIAL PRIMARY KEY,
    "projectObjectId" BIGINT,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsSynced" INTEGER DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP DEFAULT NOW(),
    "completedAt" TIMESTAMP
);

-- ============================================================================
-- STEP 3: CREATE VIEW WITH CALCULATED FIELDS
-- ============================================================================
CREATE OR REPLACE VIEW v_p6_activity_details AS
SELECT 
    a."activityObjectId",
    a."activityId",
    a."name",
    a."plannedStartDate",
    a."plannedFinishDate",
    a."actualStartDate",
    a."actualFinishDate",
    a."forecastFinishDate",
    a."status",
    a."wbsObjectId",
    a."projectObjectId",
    -- From Resource Assignments
    ra."targetQty",
    ra."actualQty",
    ra."remainingQty",
    ra."actualUnits",
    ra."remainingUnits",
    -- Calculated % completion per spec: (actualQty / targetQty) * 100
    CASE 
        WHEN ra."targetQty" > 0 THEN ROUND((ra."actualQty" / ra."targetQty") * 100, 2)
        ELSE NULL 
    END AS "percentComplete",
    -- Resource info
    r."name" AS "contractorName",
    r."unitOfMeasure",
    r."resourceType",
    -- WBS info
    w."name" AS "wbsName",
    w."code" AS "wbsCode"
FROM p6_activities a
LEFT JOIN p6_resource_assignments ra ON a."activityObjectId" = ra."activityObjectId"
LEFT JOIN p6_resources r ON ra."resourceObjectId" = r."resourceObjectId"
LEFT JOIN p6_wbs w ON a."wbsObjectId" = w."wbsObjectId";

-- ============================================================================
-- DONE
-- ============================================================================
SELECT 'P6 Schema with EXACT P6 API Field Names Created' as status;
