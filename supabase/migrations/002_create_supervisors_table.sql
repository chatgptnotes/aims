-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 002_create_supervisors_table.sql
-- Description: Create supervisors table for industrial operations personnel
-- =============================================

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.supervisors CASCADE;

-- Create supervisors table
CREATE TABLE public.supervisors (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Project assignment
    project_area_id UUID NOT NULL REFERENCES public.project_areas(id) ON DELETE RESTRICT,
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Industrial/Safety information
    safety_rating VARCHAR(20) CHECK (safety_rating IN ('green', 'yellow', 'red', 'unassigned')),
    clearance_level VARCHAR(50) CHECK (clearance_level IN ('standard', 'restricted', 'confidential', 'secret')),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Work assignment details
    department VARCHAR(100),
    shift_schedule VARCHAR(50),
    work_location VARCHAR(200),
    
    -- Certifications and training
    certifications TEXT[], -- Array of certification names
    training_expiry_date TIMESTAMP WITH TIME ZONE,
    last_safety_training TIMESTAMP WITH TIME ZONE,
    
    -- Industrial field assignment
    assigned_units TEXT[], -- Array of process units/areas
    specialization VARCHAR(100), -- e.g., 'Process Control', 'Instrumentation', 'Safety Systems'
    
    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$')
);

-- Create indexes for performance optimization
CREATE INDEX idx_supervisors_user_id ON public.supervisors(user_id);
CREATE INDEX idx_supervisors_project_area_id ON public.supervisors(project_area_id);
CREATE INDEX idx_supervisors_employee_id ON public.supervisors(employee_id);
CREATE INDEX idx_supervisors_email ON public.supervisors(email);
CREATE INDEX idx_supervisors_is_active ON public.supervisors(is_active);
CREATE INDEX idx_supervisors_safety_rating ON public.supervisors(safety_rating);
CREATE INDEX idx_supervisors_department ON public.supervisors(department);
CREATE INDEX idx_supervisors_created_at ON public.supervisors(created_at DESC);

-- Create a composite index for common queries
CREATE INDEX idx_supervisors_project_active ON public.supervisors(project_area_id, is_active);

-- Create GIN index for array columns (for efficient array searching)
CREATE INDEX idx_supervisors_certifications ON public.supervisors USING GIN(certifications);
CREATE INDEX idx_supervisors_assigned_units ON public.supervisors USING GIN(assigned_units);

-- Enable Row Level Security
ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all supervisors
CREATE POLICY "Allow authenticated users to view supervisors"
    ON public.supervisors
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Allow users to view their own supervisor record
CREATE POLICY "Allow users to view own supervisor record"
    ON public.supervisors
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policy: Allow engineers/admins to insert supervisors (simplified for now)
CREATE POLICY "Allow authenticated users to insert supervisors"
    ON public.supervisors
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Allow engineers/admins to update supervisors (simplified for now)
CREATE POLICY "Allow authenticated users to update supervisors"
    ON public.supervisors
    FOR UPDATE
    TO authenticated
    USING (true);

-- RLS Policy: Allow engineers/admins to delete supervisors (simplified for now)
CREATE POLICY "Allow authenticated users to delete supervisors"
    ON public.supervisors
    FOR DELETE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_supervisors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_supervisors_updated_at
    BEFORE UPDATE ON public.supervisors
    FOR EACH ROW
    EXECUTE FUNCTION update_supervisors_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.supervisors IS 'Industrial operations personnel who oversee process areas and operations';
COMMENT ON COLUMN public.supervisors.employee_id IS 'Unique employee identifier within the organization';
COMMENT ON COLUMN public.supervisors.safety_rating IS 'Current safety compliance status of the supervisor';
COMMENT ON COLUMN public.supervisors.clearance_level IS 'Security clearance level for accessing restricted areas';
COMMENT ON COLUMN public.supervisors.certifications IS 'Array of active certifications held by supervisor';
COMMENT ON COLUMN public.supervisors.assigned_units IS 'Process units or areas assigned to this supervisor';
COMMENT ON COLUMN public.supervisors.specialization IS 'Primary area of technical expertise';
