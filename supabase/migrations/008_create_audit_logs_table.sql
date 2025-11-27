-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 008_create_audit_logs_table.sql
-- Description: Create comprehensive audit trail table for tracking all system activities
-- =============================================

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and session information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    session_id VARCHAR(255),
    
    -- Action details
    action_type VARCHAR(50) NOT NULL, -- e.g., 'create', 'update', 'delete', 'read', 'approve', 'login', 'logout'
    resource_type VARCHAR(100) NOT NULL, -- e.g., 'pid_reports', 'supervisors', 'engineers', 'tag_extractions'
    resource_id UUID, -- ID of the affected resource
    resource_identifier VARCHAR(255), -- Human-readable identifier (e.g., document number, employee ID)
    
    -- Action description
    action_description TEXT,
    action_category VARCHAR(50), -- e.g., 'data_modification', 'authentication', 'authorization', 'system'
    
    -- Changes tracking
    old_values JSONB, -- Previous state before change
    new_values JSONB, -- New state after change
    changed_fields TEXT[], -- Array of field names that were modified
    
    -- Request information
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10), -- e.g., 'GET', 'POST', 'PUT', 'DELETE'
    request_url TEXT,
    request_headers JSONB,
    request_body JSONB,
    
    -- Response information
    response_status INTEGER, -- HTTP status code
    response_time_ms INTEGER, -- Response time in milliseconds
    
    -- Result and impact
    action_result VARCHAR(50) DEFAULT 'success', -- e.g., 'success', 'failure', 'partial', 'error'
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Business context
    project_area_id UUID REFERENCES public.project_areas(id) ON DELETE SET NULL,
    project_area_name VARCHAR(200),
    department VARCHAR(100),
    
    -- Risk and compliance
    risk_level VARCHAR(20) CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
    compliance_relevant BOOLEAN DEFAULT false, -- Flag for compliance-related activities
    requires_review BOOLEAN DEFAULT false,
    
    -- Security flags
    is_security_event BOOLEAN DEFAULT false,
    is_suspicious BOOLEAN DEFAULT false,
    security_alert_triggered BOOLEAN DEFAULT false,
    
    -- Metadata
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_source VARCHAR(50), -- e.g., 'web_app', 'api', 'batch_job', 'system'
    event_version VARCHAR(20), -- Version of the application when event occurred
    
    -- Additional context
    tags TEXT[], -- Array of tags for categorization
    notes TEXT,
    metadata JSONB, -- Additional flexible metadata
    
    -- Retention and archival
    retention_period_days INTEGER DEFAULT 2555, -- ~7 years default retention
    archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Parent-child relationship for related events
    parent_event_id UUID REFERENCES public.audit_logs(id),
    correlation_id UUID, -- For grouping related events
    
    -- Constraints
    CONSTRAINT valid_response_status CHECK (response_status IS NULL OR (response_status >= 100 AND response_status < 600)),
    CONSTRAINT valid_response_time CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
    CONSTRAINT valid_retention CHECK (retention_period_days > 0)
);

-- Create indexes for performance optimization
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON public.audit_logs(resource_id);
CREATE INDEX idx_audit_logs_project_area ON public.audit_logs(project_area_id);
CREATE INDEX idx_audit_logs_action_result ON public.audit_logs(action_result);
CREATE INDEX idx_audit_logs_risk_level ON public.audit_logs(risk_level);
CREATE INDEX idx_audit_logs_is_security_event ON public.audit_logs(is_security_event);
CREATE INDEX idx_audit_logs_is_suspicious ON public.audit_logs(is_suspicious);
CREATE INDEX idx_audit_logs_compliance_relevant ON public.audit_logs(compliance_relevant);
CREATE INDEX idx_audit_logs_requires_review ON public.audit_logs(requires_review);
CREATE INDEX idx_audit_logs_event_timestamp ON public.audit_logs(event_timestamp DESC);
CREATE INDEX idx_audit_logs_session_id ON public.audit_logs(session_id);
CREATE INDEX idx_audit_logs_correlation_id ON public.audit_logs(correlation_id);
CREATE INDEX idx_audit_logs_archived ON public.audit_logs(archived);

-- Create composite indexes for common queries
CREATE INDEX idx_audit_logs_user_timestamp ON public.audit_logs(user_id, event_timestamp DESC);
CREATE INDEX idx_audit_logs_resource_timestamp ON public.audit_logs(resource_type, resource_id, event_timestamp DESC);
CREATE INDEX idx_audit_logs_action_timestamp ON public.audit_logs(action_type, event_timestamp DESC);
CREATE INDEX idx_audit_logs_project_timestamp ON public.audit_logs(project_area_id, event_timestamp DESC);
CREATE INDEX idx_audit_logs_security_timestamp ON public.audit_logs(is_security_event, event_timestamp DESC) WHERE is_security_event = true;

-- Create GIN indexes for JSONB and array columns
CREATE INDEX idx_audit_logs_old_values ON public.audit_logs USING GIN(old_values);
CREATE INDEX idx_audit_logs_new_values ON public.audit_logs USING GIN(new_values);
CREATE INDEX idx_audit_logs_changed_fields ON public.audit_logs USING GIN(changed_fields);
CREATE INDEX idx_audit_logs_tags ON public.audit_logs USING GIN(tags);
CREATE INDEX idx_audit_logs_metadata ON public.audit_logs USING GIN(metadata);

-- Create full-text search index for descriptions
CREATE INDEX idx_audit_logs_description_search ON public.audit_logs USING GIN(to_tsvector('english', action_description));

-- Create index for IP address lookups
CREATE INDEX idx_audit_logs_ip_address ON public.audit_logs(ip_address);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view audit logs (can be restricted further)
CREATE POLICY "Allow authenticated users to view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Allow users to view their own audit logs
CREATE POLICY "Allow users to view own audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policy: Only system can insert audit logs (no manual inserts)
CREATE POLICY "Allow system to insert audit logs"
    ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Prevent updates to audit logs (immutable)
CREATE POLICY "Prevent updates to audit logs"
    ON public.audit_logs
    FOR UPDATE
    TO authenticated
    USING (false);

-- RLS Policy: Prevent deletions (audit logs should be archived, not deleted)
CREATE POLICY "Prevent deletions of audit logs"
    ON public.audit_logs
    FOR DELETE
    TO authenticated
    USING (false);

-- =============================================
-- Create audit logging helper functions
-- =============================================

-- Function to create an audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
    p_action_type VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id UUID DEFAULT NULL,
    p_resource_identifier VARCHAR DEFAULT NULL,
    p_action_description TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_project_area_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_user_email VARCHAR(255);
BEGIN
    -- Get current user's email
    SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
    
    -- Insert audit log
    INSERT INTO public.audit_logs (
        user_id,
        user_email,
        action_type,
        resource_type,
        resource_id,
        resource_identifier,
        action_description,
        old_values,
        new_values,
        project_area_id
    ) VALUES (
        auth.uid(),
        v_user_email,
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_resource_identifier,
        p_action_description,
        p_old_values,
        p_new_values,
        p_project_area_id
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically log changes on tables
CREATE OR REPLACE FUNCTION auto_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_old_values JSONB;
    v_new_values JSONB;
    v_changed_fields TEXT[];
BEGIN
    -- Convert OLD and NEW to JSONB
    IF TG_OP = 'DELETE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        
        -- Identify changed fields
        SELECT array_agg(key)
        INTO v_changed_fields
        FROM jsonb_each(v_old_values)
        WHERE v_old_values->key IS DISTINCT FROM v_new_values->key;
    ELSIF TG_OP = 'INSERT' THEN
        v_old_values := NULL;
        v_new_values := to_jsonb(NEW);
    END IF;
    
    -- Insert audit log
    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        resource_type,
        resource_id,
        action_description,
        old_values,
        new_values,
        changed_fields,
        event_source
    ) VALUES (
        auth.uid(),
        LOWER(TG_OP),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        format('%s on %s', TG_OP, TG_TABLE_NAME),
        v_old_values,
        v_new_values,
        v_changed_fields,
        'database_trigger'
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    UPDATE public.audit_logs
    SET archived = true,
        archived_at = CURRENT_TIMESTAMP
    WHERE archived = false
      AND event_timestamp < CURRENT_TIMESTAMP - INTERVAL '1 year' * (retention_period_days / 365.0);
    
    GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    
    RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to query audit logs for a resource
CREATE OR REPLACE FUNCTION get_resource_audit_history(
    p_resource_type VARCHAR,
    p_resource_id UUID,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    action_type VARCHAR,
    user_email VARCHAR,
    action_description TEXT,
    event_timestamp TIMESTAMP WITH TIME ZONE,
    changed_fields TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.action_type,
        al.user_email,
        al.action_description,
        al.event_timestamp,
        al.changed_fields
    FROM public.audit_logs al
    WHERE al.resource_type = p_resource_type
      AND al.resource_id = p_resource_id
    ORDER BY al.event_timestamp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    action_type VARCHAR,
    resource_type VARCHAR,
    action_count BIGINT,
    last_action TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.action_type,
        al.resource_type,
        COUNT(*) as action_count,
        MAX(al.event_timestamp) as last_action
    FROM public.audit_logs al
    WHERE al.user_id = p_user_id
      AND al.event_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days
    GROUP BY al.action_type, al.resource_type
    ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail of all system activities for compliance and security';
COMMENT ON COLUMN public.audit_logs.action_type IS 'Type of action performed (create, update, delete, read, approve, etc.)';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Type of resource affected (table name or logical resource)';
COMMENT ON COLUMN public.audit_logs.old_values IS 'JSONB snapshot of resource state before the action';
COMMENT ON COLUMN public.audit_logs.new_values IS 'JSONB snapshot of resource state after the action';
COMMENT ON COLUMN public.audit_logs.changed_fields IS 'Array of field names that were modified in an update';
COMMENT ON COLUMN public.audit_logs.compliance_relevant IS 'Flag indicating if this event is relevant for compliance reporting';
COMMENT ON COLUMN public.audit_logs.is_security_event IS 'Flag indicating if this is a security-related event';
COMMENT ON COLUMN public.audit_logs.correlation_id IS 'UUID for grouping related audit events across multiple operations';
COMMENT ON COLUMN public.audit_logs.retention_period_days IS 'Number of days to retain this audit log before archival';
COMMENT ON FUNCTION create_audit_log IS 'Helper function to create audit log entries programmatically';
COMMENT ON FUNCTION auto_audit_trigger IS 'Trigger function to automatically log all changes to a table';
COMMENT ON FUNCTION get_resource_audit_history IS 'Retrieve complete audit history for a specific resource';
COMMENT ON FUNCTION get_user_activity_summary IS 'Get summary of user activities over a time period';
