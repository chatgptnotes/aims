-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 004_create_pid_reports_table.sql
-- Description: Create P&ID reports table for technical drawing documents with revision control
-- =============================================

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.pid_reports CASCADE;

-- Create pid_reports table
CREATE TABLE public.pid_reports (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Document identification
    document_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'PID-001-A-2024'
    document_title VARCHAR(255) NOT NULL,
    
    -- Revision control
    revision_number VARCHAR(20) NOT NULL DEFAULT '0', -- e.g., 'A', 'B', '1', '2.0'
    revision_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    previous_revision_id UUID REFERENCES public.pid_reports(id),
    is_latest_revision BOOLEAN DEFAULT true,
    
    -- Project and area assignment
    project_area_id UUID NOT NULL REFERENCES public.project_areas(id) ON DELETE RESTRICT,
    supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE SET NULL,
    engineer_id UUID NOT NULL REFERENCES public.engineers(id) ON DELETE RESTRICT,
    
    -- Document classification
    document_type VARCHAR(50) DEFAULT 'pid' CHECK (document_type IN ('pid', 'pfd', 'loop_diagram', 'isometric', 'other')),
    drawing_category VARCHAR(50), -- e.g., 'Process', 'Instrumentation', 'Safety Systems'
    discipline VARCHAR(50), -- e.g., 'Mechanical', 'Electrical', 'Instrumentation'
    
    -- File storage
    file_path TEXT, -- Storage path in file system or cloud storage
    file_url TEXT, -- Direct URL to access the document
    file_size_bytes BIGINT,
    file_format VARCHAR(20), -- e.g., 'pdf', 'dwg', 'dxf'
    thumbnail_url TEXT,
    
    -- Technical details
    process_unit VARCHAR(100), -- Specific process unit covered
    equipment_tags TEXT[], -- Array of equipment tags in this P&ID
    instrument_tags TEXT[], -- Array of instrument tags in this P&ID
    
    -- Status and workflow
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'obsolete')),
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'conditionally_approved')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.engineers(id),
    
    -- Safety and compliance
    safety_classification VARCHAR(50), -- e.g., 'SIL1', 'SIL2', 'SIL3', 'Non-SIS'
    hazard_level VARCHAR(20) CHECK (hazard_level IN ('low', 'medium', 'high', 'critical')),
    requires_moc BOOLEAN DEFAULT false, -- Management of Change required
    
    -- ISA 5.1 compliance tracking
    isa_compliant BOOLEAN DEFAULT false,
    compliance_notes TEXT,
    tag_extraction_status VARCHAR(50) DEFAULT 'pending' CHECK (tag_extraction_status IN ('pending', 'in_progress', 'completed', 'failed', 'not_required')),
    
    -- Timestamps and metadata
    issue_date TIMESTAMP WITH TIME ZONE,
    effective_date TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    
    -- Additional information
    description TEXT,
    comments TEXT,
    change_summary TEXT, -- Summary of changes in this revision
    distribution_list TEXT[], -- List of personnel/departments to notify
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
    CONSTRAINT valid_revision CHECK (revision_number IS NOT NULL AND revision_number != '')
);

-- Create indexes for performance optimization
CREATE INDEX idx_pid_reports_document_number ON public.pid_reports(document_number);
CREATE INDEX idx_pid_reports_project_area ON public.pid_reports(project_area_id);
CREATE INDEX idx_pid_reports_supervisor ON public.pid_reports(supervisor_id);
CREATE INDEX idx_pid_reports_engineer ON public.pid_reports(engineer_id);
CREATE INDEX idx_pid_reports_status ON public.pid_reports(status);
CREATE INDEX idx_pid_reports_approval_status ON public.pid_reports(approval_status);
CREATE INDEX idx_pid_reports_document_type ON public.pid_reports(document_type);
CREATE INDEX idx_pid_reports_is_latest ON public.pid_reports(is_latest_revision);
CREATE INDEX idx_pid_reports_tag_extraction_status ON public.pid_reports(tag_extraction_status);
CREATE INDEX idx_pid_reports_safety_classification ON public.pid_reports(safety_classification);
CREATE INDEX idx_pid_reports_created_at ON public.pid_reports(created_at DESC);
CREATE INDEX idx_pid_reports_revision_date ON public.pid_reports(revision_date DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_pid_reports_project_status ON public.pid_reports(project_area_id, status, is_latest_revision);
CREATE INDEX idx_pid_reports_engineer_status ON public.pid_reports(engineer_id, status);

-- Create GIN indexes for array columns
CREATE INDEX idx_pid_reports_equipment_tags ON public.pid_reports USING GIN(equipment_tags);
CREATE INDEX idx_pid_reports_instrument_tags ON public.pid_reports USING GIN(instrument_tags);
CREATE INDEX idx_pid_reports_distribution ON public.pid_reports USING GIN(distribution_list);

-- Create full-text search indexes
CREATE INDEX idx_pid_reports_document_title_search ON public.pid_reports USING GIN(to_tsvector('english', document_title));
CREATE INDEX idx_pid_reports_description_search ON public.pid_reports USING GIN(to_tsvector('english', description));

-- Enable Row Level Security
ALTER TABLE public.pid_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view P&ID reports
CREATE POLICY "Allow authenticated users to view pid reports"
    ON public.pid_reports
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Allow engineers to insert P&ID reports
CREATE POLICY "Allow authenticated users to insert pid reports"
    ON public.pid_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Allow engineers to update P&ID reports (simplified for now)
CREATE POLICY "Allow authenticated users to update pid reports"
    ON public.pid_reports
    FOR UPDATE
    TO authenticated
    USING (true);

-- RLS Policy: Allow engineers to delete P&ID reports (simplified for now)
CREATE POLICY "Allow authenticated users to delete pid reports"
    ON public.pid_reports
    FOR DELETE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pid_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_pid_reports_updated_at
    BEFORE UPDATE ON public.pid_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_pid_reports_updated_at();

-- Create function to handle revision control
CREATE OR REPLACE FUNCTION handle_pid_revision_control()
RETURNS TRIGGER AS $$
BEGIN
    -- When a new revision is created, mark previous revisions as not latest
    IF TG_OP = 'INSERT' AND NEW.is_latest_revision = true THEN
        UPDATE public.pid_reports
        SET is_latest_revision = false
        WHERE document_number = NEW.document_number
          AND id != NEW.id
          AND is_latest_revision = true;
    END IF;
    
    -- When status changes to superseded or obsolete, mark as not latest
    IF TG_OP = 'UPDATE' AND NEW.status IN ('superseded', 'obsolete') THEN
        NEW.is_latest_revision = false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for revision control
CREATE TRIGGER trigger_handle_pid_revision_control
    BEFORE INSERT OR UPDATE ON public.pid_reports
    FOR EACH ROW
    EXECUTE FUNCTION handle_pid_revision_control();

-- Add helpful comments
COMMENT ON TABLE public.pid_reports IS 'P&ID (Piping and Instrumentation Diagram) document records with full revision control';
COMMENT ON COLUMN public.pid_reports.document_number IS 'Unique document identifier following organizational numbering scheme';
COMMENT ON COLUMN public.pid_reports.revision_number IS 'Current revision number or letter (e.g., A, B, 1, 2.0)';
COMMENT ON COLUMN public.pid_reports.is_latest_revision IS 'Flag indicating if this is the current active revision';
COMMENT ON COLUMN public.pid_reports.equipment_tags IS 'Array of equipment tag numbers found in this P&ID';
COMMENT ON COLUMN public.pid_reports.instrument_tags IS 'Array of instrument tag numbers found in this P&ID';
COMMENT ON COLUMN public.pid_reports.safety_classification IS 'Safety Integrity Level or safety system classification';
COMMENT ON COLUMN public.pid_reports.requires_moc IS 'Indicates if changes require Management of Change process';
COMMENT ON COLUMN public.pid_reports.isa_compliant IS 'Indicates if document follows ISA 5.1 standard for instrumentation symbols';
COMMENT ON COLUMN public.pid_reports.tag_extraction_status IS 'Status of automated tag extraction process';
