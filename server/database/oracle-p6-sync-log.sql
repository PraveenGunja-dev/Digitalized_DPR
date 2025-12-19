-- server/database/oracle-p6-sync-log.sql
-- Create sync log table to track Oracle P6 synchronization history

CREATE TABLE IF NOT EXISTS p6_sync_log (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL, -- 'projects', 'activities', 'full'
    project_id INTEGER,
    p6_project_id INTEGER,
    status VARCHAR(50) NOT NULL, -- 'started', 'success', 'failed'
    total_records INTEGER DEFAULT 0,
    synced_records INTEGER DEFAULT 0,
    error_records INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_p6_sync_log_project ON p6_sync_log(project_id);
CREATE INDEX IF NOT EXISTS idx_p6_sync_log_status ON p6_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_p6_sync_log_started_at ON p6_sync_log(started_at);
