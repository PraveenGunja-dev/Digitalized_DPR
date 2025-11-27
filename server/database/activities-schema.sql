-- server/database/activities-schema.sql
-- Oracle P6 equivalent schema for activities

-- Create activities table (Oracle P6 equivalent)
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    object_id INTEGER UNIQUE,  -- Oracle P6 uses ObjectId as primary identifier
    name VARCHAR(255) NOT NULL,
    project_id INTEGER NOT NULL,
    wbs_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    percent_complete DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    planned_start_date DATE,
    planned_finish_date DATE,
    actual_start_date DATE,
    actual_finish_date DATE,
    remaining_duration DECIMAL(10,2),
    actual_duration DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL
);

-- Create WBS (Work Breakdown Structure) table (Oracle P6 equivalent)
CREATE TABLE IF NOT EXISTS wbs (
    id SERIAL PRIMARY KEY,
    object_id INTEGER UNIQUE,  -- Oracle P6 uses ObjectId as primary identifier
    name VARCHAR(255) NOT NULL,
    project_id INTEGER NOT NULL,
    parent_wbs_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_wbs_id) REFERENCES wbs(id) ON DELETE CASCADE
);

-- Create resources table (Oracle P6 equivalent)
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    object_id INTEGER UNIQUE,  -- Oracle P6 uses ObjectId as primary identifier
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,  -- Labor, Material, Equipment, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activity assignments table (Oracle P6 equivalent)
CREATE TABLE IF NOT EXISTS activity_assignments (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL,
    units DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE(activity_id, resource_id)
);

-- Insert sample data
INSERT INTO wbs (object_id, name, project_id) VALUES
(1001, 'Design Phase', 1),
(1002, 'Construction Phase', 1),
(1003, 'Testing Phase', 1)
ON CONFLICT DO NOTHING;

INSERT INTO resources (object_id, name, resource_type) VALUES
(2001, 'Engineer Team', 'Labor'),
(2002, 'Construction Crew', 'Labor'),
(2003, 'Testing Equipment', 'Equipment')
ON CONFLICT DO NOTHING;

-- Sample activities for the first project
INSERT INTO activities (object_id, name, project_id, wbs_id, status, percent_complete, planned_start_date, planned_finish_date) VALUES
(3001, 'Foundation Design', 1, 1001, 'Completed', 100.00, '2025-02-01', '2025-03-15'),
(3002, 'Structural Design', 1, 1001, 'In Progress', 65.00, '2025-03-01', '2025-05-30'),
(3003, 'Site Preparation', 1, 1002, 'Not Started', 0.00, '2025-06-01', '2025-06-30')
ON CONFLICT DO NOTHING;

-- Assign resources to activities
INSERT INTO activity_assignments (activity_id, resource_id, units) VALUES
(3001, 2001, 2.00),
(3002, 2001, 3.00),
(3003, 2002, 5.00)
ON CONFLICT DO NOTHING;