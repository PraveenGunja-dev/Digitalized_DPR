-- server/database/p6-projects-schema.sql
-- Oracle P6 Projects Schema - Matches Oracle P6 Project fields

-- Drop existing projects table to recreate with P6 schema
-- Note: Back up data before running if needed

-- Create P6 Projects table
CREATE TABLE IF NOT EXISTS p6_projects (
    id SERIAL PRIMARY KEY,
    object_id INTEGER UNIQUE NOT NULL,           -- P6 ObjectId (unique identifier)
    p6_id VARCHAR(100),                          -- P6 Project Id/Code
    name VARCHAR(500) NOT NULL,                  -- Project name
    description TEXT,                            -- Project description
    status VARCHAR(50) DEFAULT 'Active',         -- Active, Inactive, What-If, etc.
    
    -- Schedule dates
    start_date TIMESTAMP,                        -- Actual/Current start date
    finish_date TIMESTAMP,                       -- Finish date
    planned_start_date TIMESTAMP,                -- Planned start date
    scheduled_finish_date TIMESTAMP,             -- Scheduled finish date
    forecast_start_date TIMESTAMP,               -- Forecast start
    forecast_finish_date TIMESTAMP,              -- Forecast finish
    data_date TIMESTAMP,                         -- Data/Status date
    must_finish_by_date TIMESTAMP,               -- Constraint date
    
    -- Location & Organization
    location_name VARCHAR(255),                  -- Location
    latitude DECIMAL(10,8),                      -- GPS latitude
    longitude DECIMAL(11,8),                     -- GPS longitude
    parent_eps_name VARCHAR(255),                -- Parent EPS name
    parent_eps_object_id INTEGER,                -- Parent EPS ObjectId
    obs_name VARCHAR(255),                       -- Organization breakdown
    obs_object_id INTEGER,                       -- OBS ObjectId
    
    -- Budget & Cost
    current_budget DECIMAL(20,2),                -- Current budget
    original_budget DECIMAL(20,2),               -- Original budget
    proposed_budget DECIMAL(20,2),               -- Proposed budget
    current_variance DECIMAL(20,2),              -- Budget variance
    
    -- Progress & Performance
    overall_project_score DECIMAL(5,2),          -- Project score
    risk_level VARCHAR(50),                      -- Risk level
    risk_score DECIMAL(5,2),                     -- Risk score
    
    -- Metadata
    is_template BOOLEAN DEFAULT false,           -- Template flag
    create_date TIMESTAMP,                       -- P6 creation date
    create_user VARCHAR(255),                    -- Created by
    last_update_date TIMESTAMP,                  -- P6 last modified
    last_update_user VARCHAR(255),               -- Modified by
    
    -- Sync tracking
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'synced',
    
    -- Local timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_p6_projects_object_id ON p6_projects(object_id);
CREATE INDEX IF NOT EXISTS idx_p6_projects_p6_id ON p6_projects(p6_id);
CREATE INDEX IF NOT EXISTS idx_p6_projects_status ON p6_projects(status);
CREATE INDEX IF NOT EXISTS idx_p6_projects_parent_eps ON p6_projects(parent_eps_object_id);
CREATE INDEX IF NOT EXISTS idx_p6_projects_start_date ON p6_projects(start_date);
CREATE INDEX IF NOT EXISTS idx_p6_projects_last_sync ON p6_projects(last_sync_at);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_p6_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_p6_projects_updated_at ON p6_projects;
CREATE TRIGGER update_p6_projects_updated_at
    BEFORE UPDATE ON p6_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_p6_projects_updated_at();

-- P6 Activities table with correct P6 schema
CREATE TABLE IF NOT EXISTS p6_activities (
    id SERIAL PRIMARY KEY,
    object_id INTEGER UNIQUE NOT NULL,           -- P6 ObjectId
    activity_id VARCHAR(100),                    -- P6 Activity Id/Code
    name VARCHAR(500) NOT NULL,                  -- Activity name
    project_object_id INTEGER NOT NULL,          -- Parent project ObjectId
    wbs_object_id INTEGER,                       -- WBS ObjectId
    
    -- Status & Progress
    status VARCHAR(50) DEFAULT 'Not Started',    -- Activity status
    percent_complete DECIMAL(5,2) DEFAULT 0,     -- Percent complete
    physical_percent_complete DECIMAL(5,2) DEFAULT 0,
    
    -- Schedule dates
    start_date TIMESTAMP,                        -- Actual start
    finish_date TIMESTAMP,                       -- Actual finish
    planned_start_date TIMESTAMP,                -- Planned start
    planned_finish_date TIMESTAMP,               -- Planned finish
    actual_start_date TIMESTAMP,                 -- Actual start
    actual_finish_date TIMESTAMP,                -- Actual finish
    baseline_start_date TIMESTAMP,               -- Baseline start
    baseline_finish_date TIMESTAMP,              -- Baseline finish
    
    -- Duration
    duration DECIMAL(10,2),                      -- Original duration
    remaining_duration DECIMAL(10,2),            -- Remaining duration
    actual_duration DECIMAL(10,2),               -- Actual duration
    
    -- Activity properties
    activity_type VARCHAR(50),                   -- Task Dependent, etc.
    critical BOOLEAN DEFAULT false,              -- Critical path flag
    
    -- UDF Values (User Defined Fields from P6)
    total_quantity DECIMAL(15,4),                -- Total Quantity UDF
    uom VARCHAR(50),                             -- Unit of Measurement UDF
    block_capacity DECIMAL(15,4),                -- Block Capacity UDF
    phase VARCHAR(255),                          -- Phase UDF
    spv_no VARCHAR(100),                         -- SPV Number UDF
    scope TEXT,                                  -- Scope UDF
    hold VARCHAR(100),                           -- Hold status UDF
    front VARCHAR(255),                          -- Front UDF
    
    -- Sync tracking
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (project_object_id) REFERENCES p6_projects(object_id) ON DELETE CASCADE
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_p6_activities_object_id ON p6_activities(object_id);
CREATE INDEX IF NOT EXISTS idx_p6_activities_project ON p6_activities(project_object_id);
CREATE INDEX IF NOT EXISTS idx_p6_activities_status ON p6_activities(status);
CREATE INDEX IF NOT EXISTS idx_p6_activities_critical ON p6_activities(critical);
