-- NeuroSync Database Schema

CREATE TABLE IF NOT EXISTS developer_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issue_number INTEGER,
    commit_hash VARCHAR(255),
    branch VARCHAR(255),
    summary TEXT,
    metadata JSONB
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_developer_context_branch ON developer_context(branch);
CREATE INDEX IF NOT EXISTS idx_developer_context_issue_number ON developer_context(issue_number);
CREATE INDEX IF NOT EXISTS idx_developer_context_timestamp ON developer_context(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_developer_context_branch_timestamp ON developer_context(branch, timestamp DESC);

