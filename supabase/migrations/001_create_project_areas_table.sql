-- =============================================
-- AIMS - Asset Information Management System
-- Migration: 001_create_project_areas_table.sql
-- Description: Creates the project_areas table (formerly clinics)
-- =============================================

-- Create project_areas table
CREATE TABLE IF NOT EXISTS public.project_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- Project area code (e.g., 'ADNOC-RUW-01')
    description TEXT,

    -- Location Information
    location VARCHAR(255),
    facility_type VARCHAR(100), -- 'Refinery', 'Gas Plant', 'Offshore Platform', etc.
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'UAE',

    -- Contact Information
    primary_engineer_email VARCHAR(255),
    primary_engineer_name VARCHAR(255),
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),

    -- Technical Information
    industry_type VARCHAR(100), -- 'Oil & Gas', 'Petrochemical', 'Power Generation', etc.
    plant_capacity VARCHAR(100),
    commissioning_date DATE,
    last_turnaround_date DATE,
    next_turnaround_date DATE,

    -- Compliance & Standards
    safety_rating VARCHAR(10),
    iso_certifications JSONB DEFAULT '[]'::jsonb,
    compliance_standards JSONB DEFAULT '[]'::jsonb, -- ['API', 'ASME', 'ISA', 'IEC']

    -- Operational Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'maintenance', 'shutdown', 'decommissioned'
    operational_since DATE,

    -- P&ID Management
    total_pid_count INTEGER DEFAULT 0,
    active_pid_count INTEGER DEFAULT 0,
    last_pid_update TIMESTAMP WITH TIME ZONE,

    -- Subscription & Limits
    subscription_type VARCHAR(50) DEFAULT 'trial', -- 'trial', 'basic', 'professional', 'enterprise'
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    max_supervisors INTEGER DEFAULT 5,
    max_pid_uploads_per_month INTEGER DEFAULT 10,
    current_month_uploads INTEGER DEFAULT 0,

    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,

    -- Additional Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_project_areas_code ON public.project_areas(code);
CREATE INDEX idx_project_areas_status ON public.project_areas(status);
CREATE INDEX idx_project_areas_facility_type ON public.project_areas(facility_type);
CREATE INDEX idx_project_areas_region ON public.project_areas(region);
CREATE INDEX idx_project_areas_created_at ON public.project_areas(created_at);

-- Add comments for documentation
COMMENT ON TABLE public.project_areas IS 'Main table for project areas (industrial facilities/plants) in AIMS';
COMMENT ON COLUMN public.project_areas.code IS 'Unique project area identifier following company naming convention';
COMMENT ON COLUMN public.project_areas.facility_type IS 'Type of industrial facility';
COMMENT ON COLUMN public.project_areas.compliance_standards IS 'Array of applicable industry standards';
COMMENT ON COLUMN public.project_areas.total_pid_count IS 'Total number of P&ID documents in the project area';

-- Create RLS policies
ALTER TABLE public.project_areas ENABLE ROW LEVEL SECURITY;

-- Policy for viewing project areas
CREATE POLICY "view_project_areas" ON public.project_areas
    FOR SELECT
    USING (true);  -- Allow all authenticated users to view for now

-- Policy for creating project areas (super admin only)
CREATE POLICY "create_project_areas" ON public.project_areas
    FOR INSERT
    WITH CHECK (true);  -- Allow all authenticated users for now

-- Policy for updating project areas
CREATE POLICY "update_project_areas" ON public.project_areas
    FOR UPDATE
    USING (true);  -- Allow all authenticated users for now

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_areas_updated_at
    BEFORE UPDATE ON public.project_areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
