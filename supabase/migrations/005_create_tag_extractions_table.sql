-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 005_create_tag_extractions_table.sql
-- Description: Create tag extractions table for ISA 5.1 compliant tag identification results
-- =============================================

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.tag_extractions CASCADE;

-- Create tag_extractions table
CREATE TABLE public.tag_extractions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to P&ID report
    pid_report_id UUID NOT NULL REFERENCES public.pid_reports(id) ON DELETE CASCADE,
    
    -- Tag identification
    tag_number VARCHAR(100) NOT NULL, -- e.g., 'FT-101', 'PIC-202A'
    tag_type VARCHAR(50) NOT NULL, -- e.g., 'instrument', 'equipment', 'valve', 'line'
    
    -- ISA 5.1 compliant tag parsing
    functional_identifier VARCHAR(20), -- First letter(s): F, P, T, L, etc.
    modifier VARCHAR(20), -- Modifier letter(s): I, C, A, S, etc.
    loop_number VARCHAR(50), -- Numeric loop identifier
    suffix VARCHAR(10), -- Suffix identifier (A, B, C, etc.)
    
    -- Tag description and function
    tag_description TEXT,
    service_description TEXT, -- What process/service this tag monitors or controls
    function_code VARCHAR(10), -- ISA function code
    
    -- ISA 5.1 classification
    measured_variable VARCHAR(50), -- e.g., 'Flow', 'Pressure', 'Temperature', 'Level'
    function_type VARCHAR(50), -- e.g., 'Indicator', 'Transmitter', 'Controller', 'Alarm'
    readout_function VARCHAR(50), -- e.g., 'Local', 'Remote', 'Shared'
    
    -- Location and physical details
    location_description TEXT,
    process_unit VARCHAR(100),
    area_zone VARCHAR(50),
    elevation VARCHAR(20),
    
    -- Equipment association
    associated_equipment VARCHAR(100), -- Equipment this tag is associated with
    line_number VARCHAR(50), -- For instruments on piping lines
    equipment_type VARCHAR(50), -- e.g., 'Pump', 'Valve', 'Tank', 'Heat Exchanger'
    
    -- Technical specifications
    manufacturer VARCHAR(100),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    
    -- Process parameters
    process_fluid VARCHAR(100),
    operating_range_min DECIMAL(15, 4),
    operating_range_max DECIMAL(15, 4),
    operating_range_unit VARCHAR(20), -- e.g., 'PSI', 'GPM', 'degF', 'inches'
    normal_operating_value DECIMAL(15, 4),
    
    -- Safety and criticality
    safety_critical BOOLEAN DEFAULT false,
    sil_rating VARCHAR(20), -- e.g., 'SIL1', 'SIL2', 'SIL3'
    alarm_configured BOOLEAN DEFAULT false,
    interlock_configured BOOLEAN DEFAULT false,
    
    -- Extraction metadata
    extraction_method VARCHAR(50) DEFAULT 'automatic' CHECK (extraction_method IN ('automatic', 'manual', 'hybrid', 'verified')),
    extraction_confidence DECIMAL(3, 2), -- Confidence score 0.00 to 1.00
    extraction_algorithm VARCHAR(100), -- Algorithm or model used for extraction
    
    -- Position in drawing
    x_coordinate DECIMAL(10, 4), -- X position in drawing
    y_coordinate DECIMAL(10, 4), -- Y position in drawing
    page_number INTEGER,
    drawing_section VARCHAR(50),
    
    -- Validation and verification
    is_validated BOOLEAN DEFAULT false,
    validated_by UUID REFERENCES public.engineers(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    validation_notes TEXT,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'validated', 'rejected', 'needs_correction')),
    
    -- Data quality
    data_quality_score DECIMAL(3, 2), -- Quality score 0.00 to 1.00
    has_conflicts BOOLEAN DEFAULT false,
    conflict_notes TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_confidence CHECK (extraction_confidence IS NULL OR (extraction_confidence >= 0.0 AND extraction_confidence <= 1.0)),
    CONSTRAINT valid_quality_score CHECK (data_quality_score IS NULL OR (data_quality_score >= 0.0 AND data_quality_score <= 1.0)),
    CONSTRAINT valid_operating_range CHECK (operating_range_min IS NULL OR operating_range_max IS NULL OR operating_range_min <= operating_range_max),
    CONSTRAINT unique_tag_per_pid UNIQUE (pid_report_id, tag_number)
);

-- Create indexes for performance optimization
CREATE INDEX idx_tag_extractions_pid_report ON public.tag_extractions(pid_report_id);
CREATE INDEX idx_tag_extractions_tag_number ON public.tag_extractions(tag_number);
CREATE INDEX idx_tag_extractions_tag_type ON public.tag_extractions(tag_type);
CREATE INDEX idx_tag_extractions_functional_id ON public.tag_extractions(functional_identifier);
CREATE INDEX idx_tag_extractions_loop_number ON public.tag_extractions(loop_number);
CREATE INDEX idx_tag_extractions_status ON public.tag_extractions(status);
CREATE INDEX idx_tag_extractions_is_validated ON public.tag_extractions(is_validated);
CREATE INDEX idx_tag_extractions_safety_critical ON public.tag_extractions(safety_critical);
CREATE INDEX idx_tag_extractions_extraction_method ON public.tag_extractions(extraction_method);
CREATE INDEX idx_tag_extractions_process_unit ON public.tag_extractions(process_unit);
CREATE INDEX idx_tag_extractions_equipment_type ON public.tag_extractions(equipment_type);
CREATE INDEX idx_tag_extractions_created_at ON public.tag_extractions(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_tag_extractions_pid_status ON public.tag_extractions(pid_report_id, status);
CREATE INDEX idx_tag_extractions_pid_validated ON public.tag_extractions(pid_report_id, is_validated);
CREATE INDEX idx_tag_extractions_type_safety ON public.tag_extractions(tag_type, safety_critical);

-- Create full-text search indexes
CREATE INDEX idx_tag_extractions_description_search ON public.tag_extractions USING GIN(to_tsvector('english', tag_description));
CREATE INDEX idx_tag_extractions_service_search ON public.tag_extractions USING GIN(to_tsvector('english', service_description));

-- Enable Row Level Security
ALTER TABLE public.tag_extractions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view tag extractions
CREATE POLICY "Allow authenticated users to view tag extractions"
    ON public.tag_extractions
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Allow authenticated users to insert tag extractions
CREATE POLICY "Allow authenticated users to insert tag extractions"
    ON public.tag_extractions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Allow authenticated users to update tag extractions
CREATE POLICY "Allow authenticated users to update tag extractions"
    ON public.tag_extractions
    FOR UPDATE
    TO authenticated
    USING (true);

-- RLS Policy: Allow authenticated users to delete tag extractions
CREATE POLICY "Allow authenticated users to delete tag extractions"
    ON public.tag_extractions
    FOR DELETE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tag_extractions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_tag_extractions_updated_at
    BEFORE UPDATE ON public.tag_extractions
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_extractions_updated_at();

-- Create function to parse ISA 5.1 tag components
CREATE OR REPLACE FUNCTION parse_isa_tag_components()
RETURNS TRIGGER AS $$
DECLARE
    tag VARCHAR(100);
BEGIN
    tag := NEW.tag_number;
    
    -- Simple ISA 5.1 tag parsing logic
    -- Format: [Functional ID][Modifier]-[Loop Number][Suffix]
    -- Example: FIC-101A -> F=Flow, I=Indicator, C=Controller, 101=Loop, A=Suffix
    
    IF tag ~ '^[A-Z]{1,4}-[0-9]+[A-Z]?$' THEN
        -- Extract functional identifier (first 1-2 letters before dash)
        NEW.functional_identifier := substring(tag from '^([A-Z]{1,2})');
        
        -- Extract modifier (letters between functional ID and dash)
        NEW.modifier := substring(tag from '^[A-Z]{1,2}([A-Z]{0,2})-');
        
        -- Extract loop number (digits after dash)
        NEW.loop_number := substring(tag from '-([0-9]+)');
        
        -- Extract suffix (letters after loop number)
        NEW.suffix := substring(tag from '[0-9]+([A-Z]+)$');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ISA tag parsing
CREATE TRIGGER trigger_parse_isa_tag_components
    BEFORE INSERT OR UPDATE ON public.tag_extractions
    FOR EACH ROW
    WHEN (NEW.tag_number IS NOT NULL)
    EXECUTE FUNCTION parse_isa_tag_components();

-- Create function to update P&ID tag extraction status
CREATE OR REPLACE FUNCTION update_pid_tag_extraction_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the P&ID report's tag extraction status when tags are added
    IF TG_OP = 'INSERT' THEN
        UPDATE public.pid_reports
        SET tag_extraction_status = 'in_progress'
        WHERE id = NEW.pid_report_id
          AND tag_extraction_status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating P&ID status
CREATE TRIGGER trigger_update_pid_tag_extraction_status
    AFTER INSERT ON public.tag_extractions
    FOR EACH ROW
    EXECUTE FUNCTION update_pid_tag_extraction_status();

-- Add helpful comments
COMMENT ON TABLE public.tag_extractions IS 'ISA 5.1 compliant tag extraction results from P&ID documents';
COMMENT ON COLUMN public.tag_extractions.tag_number IS 'Complete instrument or equipment tag number (e.g., FT-101, PIC-202A)';
COMMENT ON COLUMN public.tag_extractions.functional_identifier IS 'ISA 5.1 functional identifier letters indicating measured variable';
COMMENT ON COLUMN public.tag_extractions.modifier IS 'ISA 5.1 modifier letters indicating function type';
COMMENT ON COLUMN public.tag_extractions.loop_number IS 'Numeric loop identifier from tag number';
COMMENT ON COLUMN public.tag_extractions.extraction_confidence IS 'AI/ML confidence score for automated extractions (0.0 to 1.0)';
COMMENT ON COLUMN public.tag_extractions.safety_critical IS 'Indicates if this tag is part of a safety instrumented system';
COMMENT ON COLUMN public.tag_extractions.sil_rating IS 'Safety Integrity Level rating if applicable';
COMMENT ON COLUMN public.tag_extractions.extraction_method IS 'Method used to extract this tag (automatic, manual, hybrid, verified)';
