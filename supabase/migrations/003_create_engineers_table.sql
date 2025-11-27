-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 003_create_engineers_table.sql
-- Description: Create engineers table for project area administrators
-- =============================================

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.engineers CASCADE;

-- Create engineers table
CREATE TABLE public.engineers (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Professional information
    title VARCHAR(100), -- e.g., 'Senior Instrumentation Engineer', 'Control Systems Engineer'
    department VARCHAR(100),
    license_number VARCHAR(50), -- Professional engineering license
    license_expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Certifications and qualifications
    certifications JSONB, -- Structured certification data with issue/expiry dates
    specializations TEXT[], -- Array of engineering specializations
    years_of_experience INTEGER,
    
    -- Project area management (many-to-many relationship handled via junction table if needed)
    managed_project_areas UUID[], -- Array of project_area_id references
    primary_project_area_id UUID REFERENCES public.project_areas(id),
    
    -- Access and permissions
    clearance_level VARCHAR(50) CHECK (clearance_level IN ('standard', 'restricted', 'confidential', 'secret', 'top_secret')),
    role_type VARCHAR(50) DEFAULT 'engineer' CHECK (role_type IN ('engineer', 'lead_engineer', 'manager', 'admin')),
    
    -- Safety and compliance
    safety_certifications TEXT[],
    last_safety_audit TIMESTAMP WITH TIME ZONE,
    compliance_status VARCHAR(20) DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'pending', 'non_compliant', 'under_review')),
    
    -- Contact information
    office_location VARCHAR(200),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$'),
    CONSTRAINT valid_years_experience CHECK (years_of_experience IS NULL OR years_of_experience >= 0)
);

-- Create indexes for performance optimization
CREATE INDEX idx_engineers_user_id ON public.engineers(user_id);
CREATE INDEX idx_engineers_employee_id ON public.engineers(employee_id);
CREATE INDEX idx_engineers_email ON public.engineers(email);
CREATE INDEX idx_engineers_is_active ON public.engineers(is_active);
CREATE INDEX idx_engineers_role_type ON public.engineers(role_type);
CREATE INDEX idx_engineers_department ON public.engineers(department);
CREATE INDEX idx_engineers_clearance_level ON public.engineers(clearance_level);
CREATE INDEX idx_engineers_compliance_status ON public.engineers(compliance_status);
CREATE INDEX idx_engineers_primary_project_area ON public.engineers(primary_project_area_id);
CREATE INDEX idx_engineers_created_at ON public.engineers(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_engineers_active_role ON public.engineers(is_active, role_type);

-- Create GIN indexes for array and JSONB columns
CREATE INDEX idx_engineers_certifications ON public.engineers USING GIN(certifications);
CREATE INDEX idx_engineers_specializations ON public.engineers USING GIN(specializations);
CREATE INDEX idx_engineers_managed_areas ON public.engineers USING GIN(managed_project_areas);
CREATE INDEX idx_engineers_safety_certs ON public.engineers USING GIN(safety_certifications);

-- Enable Row Level Security
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view engineers
CREATE POLICY "Allow authenticated users to view engineers"
    ON public.engineers
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Allow users to view their own engineer record
CREATE POLICY "Allow users to view own engineer record"
    ON public.engineers
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to insert engineers (simplified for now)
CREATE POLICY "Allow authenticated users to insert engineers"
    ON public.engineers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Allow users to update their own record
CREATE POLICY "Allow users to update own engineer record"
    ON public.engineers
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policy: Allow admins to update all engineers (simplified for now)
CREATE POLICY "Allow authenticated users to update engineers"
    ON public.engineers
    FOR UPDATE
    TO authenticated
    USING (true);

-- RLS Policy: Allow admins to delete engineers (simplified for now)
CREATE POLICY "Allow authenticated users to delete engineers"
    ON public.engineers
    FOR DELETE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_engineers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_engineers_updated_at
    BEFORE UPDATE ON public.engineers
    FOR EACH ROW
    EXECUTE FUNCTION update_engineers_updated_at();

-- Create function to validate managed project areas
CREATE OR REPLACE FUNCTION validate_managed_project_areas()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure all project area IDs in the array exist
    IF NEW.managed_project_areas IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM unnest(NEW.managed_project_areas) AS area_id
            WHERE NOT EXISTS (
                SELECT 1 FROM public.project_areas WHERE id = area_id
            )
        ) THEN
            RAISE EXCEPTION 'One or more project area IDs do not exist';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validating project areas
CREATE TRIGGER trigger_validate_managed_project_areas
    BEFORE INSERT OR UPDATE ON public.engineers
    FOR EACH ROW
    EXECUTE FUNCTION validate_managed_project_areas();

-- Add helpful comments
COMMENT ON TABLE public.engineers IS 'Engineering personnel who manage project areas and oversee P&ID documentation';
COMMENT ON COLUMN public.engineers.employee_id IS 'Unique employee identifier within the organization';
COMMENT ON COLUMN public.engineers.license_number IS 'Professional engineering license number';
COMMENT ON COLUMN public.engineers.certifications IS 'JSONB object containing certification details with issue and expiry dates';
COMMENT ON COLUMN public.engineers.managed_project_areas IS 'Array of project area IDs managed by this engineer';
COMMENT ON COLUMN public.engineers.role_type IS 'Engineering role classification for permission management';
COMMENT ON COLUMN public.engineers.clearance_level IS 'Security clearance level for accessing classified documents';
COMMENT ON COLUMN public.engineers.compliance_status IS 'Current compliance status with safety and regulatory requirements';
