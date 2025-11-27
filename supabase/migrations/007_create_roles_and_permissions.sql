-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 007_create_roles_and_permissions.sql
-- Description: Create RBAC (Role-Based Access Control) system for permission management
-- =============================================

-- Drop tables if exist (for clean migrations)
DROP TABLE IF EXISTS public.user_role_assignments CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- =============================================
-- Create roles table
-- =============================================
CREATE TABLE public.roles (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Role details
    role_name VARCHAR(100) UNIQUE NOT NULL,
    role_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'ADMIN', 'ENGINEER', 'SUPERVISOR'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Role hierarchy and type
    role_level INTEGER DEFAULT 0, -- Higher number = more privileges
    role_category VARCHAR(50), -- e.g., 'administrative', 'technical', 'operational'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_role_level CHECK (role_level >= 0)
);

-- Create indexes for roles
CREATE INDEX idx_roles_role_code ON public.roles(role_code);
CREATE INDEX idx_roles_is_active ON public.roles(is_active);
CREATE INDEX idx_roles_role_level ON public.roles(role_level DESC);

-- =============================================
-- Create permissions table
-- =============================================
CREATE TABLE public.permissions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Permission details
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    permission_code VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'pid_reports.create', 'supervisors.read'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Permission categorization
    resource_type VARCHAR(50) NOT NULL, -- e.g., 'pid_reports', 'supervisors', 'engineers'
    action_type VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'approve'
    
    -- Permission scope
    scope_level VARCHAR(50) DEFAULT 'all', -- e.g., 'all', 'own', 'project_area', 'department'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system_permission BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for permissions
CREATE INDEX idx_permissions_permission_code ON public.permissions(permission_code);
CREATE INDEX idx_permissions_resource_type ON public.permissions(resource_type);
CREATE INDEX idx_permissions_action_type ON public.permissions(action_type);
CREATE INDEX idx_permissions_is_active ON public.permissions(is_active);

-- Create composite index for common queries
CREATE INDEX idx_permissions_resource_action ON public.permissions(resource_type, action_type);

-- =============================================
-- Create role_permissions junction table
-- =============================================
CREATE TABLE public.role_permissions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    
    -- Permission constraints (optional)
    constraints JSONB, -- Additional constraints like project_area_id restrictions
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
    
    -- Unique constraint
    CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Create indexes for role_permissions
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX idx_role_permissions_is_active ON public.role_permissions(is_active);
CREATE INDEX idx_role_permissions_expires_at ON public.role_permissions(expires_at);

-- =============================================
-- Create user_role_assignments table
-- =============================================
CREATE TABLE public.user_role_assignments (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    
    -- Assignment scope (optional context-specific roles)
    project_area_id UUID REFERENCES public.project_areas(id) ON DELETE CASCADE,
    department VARCHAR(100),
    
    -- Assignment details
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional role expiration
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for user-role-context combination
    CONSTRAINT unique_user_role_context UNIQUE (user_id, role_id, project_area_id)
);

-- Create indexes for user_role_assignments
CREATE INDEX idx_user_role_assignments_user_id ON public.user_role_assignments(user_id);
CREATE INDEX idx_user_role_assignments_role_id ON public.user_role_assignments(role_id);
CREATE INDEX idx_user_role_assignments_project_area ON public.user_role_assignments(project_area_id);
CREATE INDEX idx_user_role_assignments_is_active ON public.user_role_assignments(is_active);
CREATE INDEX idx_user_role_assignments_expires_at ON public.user_role_assignments(expires_at);

-- Create composite indexes
CREATE INDEX idx_user_role_assignments_user_active ON public.user_role_assignments(user_id, is_active);

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Allow authenticated users to view roles"
    ON public.roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage roles"
    ON public.roles FOR ALL TO authenticated USING (true);

-- RLS Policies for permissions
CREATE POLICY "Allow authenticated users to view permissions"
    ON public.permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage permissions"
    ON public.permissions FOR ALL TO authenticated USING (true);

-- RLS Policies for role_permissions
CREATE POLICY "Allow authenticated users to view role permissions"
    ON public.role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage role permissions"
    ON public.role_permissions FOR ALL TO authenticated USING (true);

-- RLS Policies for user_role_assignments
CREATE POLICY "Allow authenticated users to view role assignments"
    ON public.user_role_assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to view own role assignments"
    ON public.user_role_assignments FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to manage role assignments"
    ON public.user_role_assignments FOR ALL TO authenticated USING (true);

-- =============================================
-- Create helper functions
-- =============================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_code VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_role_assignments ura
        JOIN public.role_permissions rp ON ura.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ura.user_id = p_user_id
          AND ura.is_active = true
          AND rp.is_active = true
          AND p.permission_code = p_permission_code
          AND p.is_active = true
          AND (ura.expires_at IS NULL OR ura.expires_at > CURRENT_TIMESTAMP)
          AND (rp.expires_at IS NULL OR rp.expires_at > CURRENT_TIMESTAMP)
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
    permission_code VARCHAR,
    permission_name VARCHAR,
    resource_type VARCHAR,
    action_type VARCHAR,
    scope_level VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.permission_code,
        p.permission_name,
        p.resource_type,
        p.action_type,
        p.scope_level
    FROM public.user_role_assignments ura
    JOIN public.role_permissions rp ON ura.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ura.user_id = p_user_id
      AND ura.is_active = true
      AND rp.is_active = true
      AND p.is_active = true
      AND (ura.expires_at IS NULL OR ura.expires_at > CURRENT_TIMESTAMP)
      AND (rp.expires_at IS NULL OR rp.expires_at > CURRENT_TIMESTAMP)
    ORDER BY p.resource_type, p.action_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE (
    role_code VARCHAR,
    role_name VARCHAR,
    role_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.role_code,
        r.role_name,
        r.role_level
    FROM public.user_role_assignments ura
    JOIN public.roles r ON ura.role_id = r.id
    WHERE ura.user_id = p_user_id
      AND ura.is_active = true
      AND r.is_active = true
      AND (ura.expires_at IS NULL OR ura.expires_at > CURRENT_TIMESTAMP)
    ORDER BY r.role_level DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Insert default system roles
-- =============================================
INSERT INTO public.roles (role_name, role_code, display_name, description, role_level, role_category, is_system_role) VALUES
    ('System Administrator', 'SYSTEM_ADMIN', 'System Administrator', 'Full system access with all privileges', 100, 'administrative', true),
    ('Project Manager', 'PROJECT_MANAGER', 'Project Manager', 'Manages multiple project areas and personnel', 80, 'administrative', true),
    ('Lead Engineer', 'LEAD_ENGINEER', 'Lead Engineer', 'Senior engineering role with approval authority', 70, 'technical', true),
    ('Engineer', 'ENGINEER', 'Engineer', 'Standard engineering role with P&ID management access', 60, 'technical', true),
    ('Safety Officer', 'SAFETY_OFFICER', 'Safety Officer', 'Safety and compliance oversight', 50, 'operational', true),
    ('Supervisor', 'SUPERVISOR', 'Supervisor', 'Operations supervisor with field access', 40, 'operational', true),
    ('Technician', 'TECHNICIAN', 'Technician', 'Field technician with limited access', 30, 'operational', true),
    ('Read Only', 'READ_ONLY', 'Read Only', 'View-only access to documents and data', 10, 'operational', true);

-- =============================================
-- Insert default permissions
-- =============================================
INSERT INTO public.permissions (permission_name, permission_code, display_name, description, resource_type, action_type, scope_level, is_system_permission) VALUES
    -- P&ID Reports permissions
    ('Create P&ID Reports', 'pid_reports.create', 'Create P&ID Reports', 'Create new P&ID document records', 'pid_reports', 'create', 'all', true),
    ('Read P&ID Reports', 'pid_reports.read', 'Read P&ID Reports', 'View P&ID documents', 'pid_reports', 'read', 'all', true),
    ('Update P&ID Reports', 'pid_reports.update', 'Update P&ID Reports', 'Edit P&ID document records', 'pid_reports', 'update', 'all', true),
    ('Delete P&ID Reports', 'pid_reports.delete', 'Delete P&ID Reports', 'Delete P&ID documents', 'pid_reports', 'delete', 'all', true),
    ('Approve P&ID Reports', 'pid_reports.approve', 'Approve P&ID Reports', 'Approve P&ID documents for issue', 'pid_reports', 'approve', 'all', true),
    
    -- Supervisors permissions
    ('Create Supervisors', 'supervisors.create', 'Create Supervisors', 'Add new supervisor records', 'supervisors', 'create', 'all', true),
    ('Read Supervisors', 'supervisors.read', 'Read Supervisors', 'View supervisor information', 'supervisors', 'read', 'all', true),
    ('Update Supervisors', 'supervisors.update', 'Update Supervisors', 'Edit supervisor records', 'supervisors', 'update', 'all', true),
    ('Delete Supervisors', 'supervisors.delete', 'Delete Supervisors', 'Remove supervisor records', 'supervisors', 'delete', 'all', true),
    
    -- Engineers permissions
    ('Create Engineers', 'engineers.create', 'Create Engineers', 'Add new engineer records', 'engineers', 'create', 'all', true),
    ('Read Engineers', 'engineers.read', 'Read Engineers', 'View engineer information', 'engineers', 'read', 'all', true),
    ('Update Engineers', 'engineers.update', 'Update Engineers', 'Edit engineer records', 'engineers', 'update', 'all', true),
    ('Delete Engineers', 'engineers.delete', 'Delete Engineers', 'Remove engineer records', 'engineers', 'delete', 'all', true),
    
    -- Tag Extractions permissions
    ('Create Tag Extractions', 'tag_extractions.create', 'Create Tag Extractions', 'Add tag extraction records', 'tag_extractions', 'create', 'all', true),
    ('Read Tag Extractions', 'tag_extractions.read', 'Read Tag Extractions', 'View tag extraction data', 'tag_extractions', 'read', 'all', true),
    ('Update Tag Extractions', 'tag_extractions.update', 'Update Tag Extractions', 'Edit tag extraction records', 'tag_extractions', 'update', 'all', true),
    ('Delete Tag Extractions', 'tag_extractions.delete', 'Delete Tag Extractions', 'Remove tag extraction records', 'tag_extractions', 'delete', 'all', true),
    ('Validate Tag Extractions', 'tag_extractions.validate', 'Validate Tag Extractions', 'Validate extracted tags', 'tag_extractions', 'validate', 'all', true),
    
    -- Project Areas permissions
    ('Create Project Areas', 'project_areas.create', 'Create Project Areas', 'Create new project areas', 'project_areas', 'create', 'all', true),
    ('Read Project Areas', 'project_areas.read', 'Read Project Areas', 'View project area information', 'project_areas', 'read', 'all', true),
    ('Update Project Areas', 'project_areas.update', 'Update Project Areas', 'Edit project area details', 'project_areas', 'update', 'all', true),
    ('Delete Project Areas', 'project_areas.delete', 'Delete Project Areas', 'Remove project areas', 'project_areas', 'delete', 'all', true),
    
    -- Algorithm Results permissions
    ('Read Algorithm Results', 'algorithm_results.read', 'Read Algorithm Results', 'View algorithm processing results', 'algorithm_results', 'read', 'all', true),
    ('Validate Algorithm Results', 'algorithm_results.validate', 'Validate Algorithm Results', 'Validate algorithm outputs', 'algorithm_results', 'validate', 'all', true),
    
    -- System permissions
    ('Manage Roles', 'system.manage_roles', 'Manage Roles', 'Create and manage user roles', 'system', 'manage', 'all', true),
    ('Manage Permissions', 'system.manage_permissions', 'Manage Permissions', 'Configure permissions', 'system', 'manage', 'all', true),
    ('View Audit Logs', 'system.view_audit_logs', 'View Audit Logs', 'Access system audit logs', 'system', 'view', 'all', true);

-- Add helpful comments
COMMENT ON TABLE public.roles IS 'System roles for RBAC permission management';
COMMENT ON TABLE public.permissions IS 'Granular permissions for system resources and actions';
COMMENT ON TABLE public.role_permissions IS 'Junction table linking roles to their assigned permissions';
COMMENT ON TABLE public.user_role_assignments IS 'User role assignments with optional context (project area, department)';
COMMENT ON FUNCTION user_has_permission IS 'Check if a user has a specific permission';
COMMENT ON FUNCTION get_user_permissions IS 'Get all active permissions for a user';
COMMENT ON FUNCTION get_user_roles IS 'Get all active roles for a user';
