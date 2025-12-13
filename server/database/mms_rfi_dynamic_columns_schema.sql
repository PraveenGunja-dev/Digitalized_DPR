-- MMS & RFI Dynamic Columns Schema

-- Table to store dynamic column definitions for MMS & RFI sheets
CREATE TABLE IF NOT EXISTS mms_rfi_dynamic_columns (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (data_type IN ('text', 'number', 'date', 'boolean')),
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    position INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(project_id, column_name),
    UNIQUE(project_id, position)
);

-- Table to store MMS & RFI sheet data entries with dynamic columns
CREATE TABLE IF NOT EXISTS mms_rfi_entries (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    supervisor_id INTEGER NOT NULL,
    entry_date DATE NOT NULL,
    previous_date DATE NOT NULL,
    data_json JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted_to_pm', 'approved_by_pm', 'rejected_by_pm', 'final_approved')),
    submitted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(supervisor_id, entry_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mms_rfi_columns_project_id ON mms_rfi_dynamic_columns(project_id);
CREATE INDEX IF NOT EXISTS idx_mms_rfi_columns_created_by ON mms_rfi_dynamic_columns(created_by);
CREATE INDEX IF NOT EXISTS idx_mms_rfi_entries_project_id ON mms_rfi_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_mms_rfi_entries_supervisor_id ON mms_rfi_entries(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_mms_rfi_entries_status ON mms_rfi_entries(status);
CREATE INDEX IF NOT EXISTS idx_mms_rfi_entries_dates ON mms_rfi_entries(entry_date, previous_date);