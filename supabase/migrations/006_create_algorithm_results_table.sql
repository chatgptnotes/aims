-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 006_create_algorithm_results_table.sql
-- Description: Create algorithm results table for processing and analysis results
-- =============================================

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.algorithm_results CASCADE;

-- Create algorithm_results table
CREATE TABLE public.algorithm_results (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to P&ID report or tag extraction
    pid_report_id UUID REFERENCES public.pid_reports(id) ON DELETE CASCADE,
    tag_extraction_id UUID REFERENCES public.tag_extractions(id) ON DELETE CASCADE,
    project_area_id UUID REFERENCES public.project_areas(id) ON DELETE RESTRICT,
    
    -- Algorithm identification
    algorithm_name VARCHAR(100) NOT NULL,
    algorithm_version VARCHAR(20) NOT NULL,
    algorithm_type VARCHAR(50) CHECK (algorithm_type IN ('tag_extraction', 'ocr', 'validation', 'integrity_analysis', 'predictive_maintenance', 'anomaly_detection', 'other')),
    
    -- Execution details
    execution_id UUID, -- Unique ID for batch processing runs
    execution_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_duration_ms INTEGER, -- Duration in milliseconds
    
    -- Input parameters
    input_parameters JSONB, -- Algorithm input parameters and configuration
    input_data_summary TEXT, -- Summary of input data processed
    
    -- Results and output
    result_status VARCHAR(50) DEFAULT 'success' CHECK (result_status IN ('success', 'partial_success', 'failed', 'error', 'timeout')),
    result_data JSONB, -- Main result data in structured format
    result_summary TEXT, -- Human-readable summary of results
    
    -- Metrics and scores
    confidence_score DECIMAL(5, 4), -- Overall confidence score (0.0000 to 1.0000)
    accuracy_score DECIMAL(5, 4), -- Accuracy metric if applicable
    quality_score DECIMAL(5, 4), -- Quality metric
    completeness_score DECIMAL(5, 4), -- Completeness metric (0.0000 to 1.0000)
    
    -- Findings and insights
    findings_count INTEGER DEFAULT 0,
    warnings_count INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    findings JSONB, -- Array of findings with details
    
    -- Anomalies and issues detected
    anomalies_detected BOOLEAN DEFAULT false,
    anomaly_details JSONB,
    risk_level VARCHAR(20) CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
    
    -- Recommendations
    recommendations JSONB, -- Array of recommended actions
    auto_actions_taken JSONB, -- Automated actions performed
    requires_manual_review BOOLEAN DEFAULT false,
    
    -- Performance metrics
    items_processed INTEGER,
    items_successful INTEGER,
    items_failed INTEGER,
    processing_rate DECIMAL(10, 2), -- Items per second
    
    -- Resource usage
    memory_used_mb DECIMAL(10, 2),
    cpu_time_ms INTEGER,
    
    -- Validation and verification
    is_validated BOOLEAN DEFAULT false,
    validated_by UUID REFERENCES public.engineers(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    validation_notes TEXT,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    stack_trace TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Comparison with previous results
    previous_result_id UUID REFERENCES public.algorithm_results(id),
    delta_summary TEXT, -- Summary of changes from previous result
    improvement_percentage DECIMAL(5, 2),
    
    -- Metadata
    environment VARCHAR(50), -- e.g., 'production', 'staging', 'development'
    triggered_by VARCHAR(50), -- e.g., 'manual', 'scheduled', 'webhook', 'api'
    triggered_by_user_id UUID REFERENCES auth.users(id),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)),
    CONSTRAINT valid_accuracy_score CHECK (accuracy_score IS NULL OR (accuracy_score >= 0.0 AND accuracy_score <= 1.0)),
    CONSTRAINT valid_quality_score CHECK (quality_score IS NULL OR (quality_score >= 0.0 AND quality_score <= 1.0)),
    CONSTRAINT valid_completeness_score CHECK (completeness_score IS NULL OR (completeness_score >= 0.0 AND completeness_score <= 1.0)),
    CONSTRAINT valid_execution_duration CHECK (execution_duration_ms IS NULL OR execution_duration_ms >= 0),
    CONSTRAINT valid_retry_count CHECK (retry_count >= 0),
    CONSTRAINT has_reference CHECK (pid_report_id IS NOT NULL OR tag_extraction_id IS NOT NULL OR project_area_id IS NOT NULL)
);

-- Create indexes for performance optimization
CREATE INDEX idx_algorithm_results_pid_report ON public.algorithm_results(pid_report_id);
CREATE INDEX idx_algorithm_results_tag_extraction ON public.algorithm_results(tag_extraction_id);
CREATE INDEX idx_algorithm_results_project_area ON public.algorithm_results(project_area_id);
CREATE INDEX idx_algorithm_results_algorithm_name ON public.algorithm_results(algorithm_name);
CREATE INDEX idx_algorithm_results_algorithm_type ON public.algorithm_results(algorithm_type);
CREATE INDEX idx_algorithm_results_result_status ON public.algorithm_results(result_status);
CREATE INDEX idx_algorithm_results_execution_id ON public.algorithm_results(execution_id);
CREATE INDEX idx_algorithm_results_risk_level ON public.algorithm_results(risk_level);
CREATE INDEX idx_algorithm_results_anomalies ON public.algorithm_results(anomalies_detected);
CREATE INDEX idx_algorithm_results_manual_review ON public.algorithm_results(requires_manual_review);
CREATE INDEX idx_algorithm_results_validated ON public.algorithm_results(is_validated);
CREATE INDEX idx_algorithm_results_environment ON public.algorithm_results(environment);
CREATE INDEX idx_algorithm_results_triggered_by ON public.algorithm_results(triggered_by);
CREATE INDEX idx_algorithm_results_execution_timestamp ON public.algorithm_results(execution_timestamp DESC);
CREATE INDEX idx_algorithm_results_created_at ON public.algorithm_results(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_algorithm_results_algo_status ON public.algorithm_results(algorithm_name, result_status);
CREATE INDEX idx_algorithm_results_pid_algo ON public.algorithm_results(pid_report_id, algorithm_name, execution_timestamp DESC);
CREATE INDEX idx_algorithm_results_status_timestamp ON public.algorithm_results(result_status, execution_timestamp DESC);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_algorithm_results_input_params ON public.algorithm_results USING GIN(input_parameters);
CREATE INDEX idx_algorithm_results_result_data ON public.algorithm_results USING GIN(result_data);
CREATE INDEX idx_algorithm_results_findings ON public.algorithm_results USING GIN(findings);
CREATE INDEX idx_algorithm_results_recommendations ON public.algorithm_results USING GIN(recommendations);

-- Enable Row Level Security
ALTER TABLE public.algorithm_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view algorithm results
CREATE POLICY "Allow authenticated users to view algorithm results"
    ON public.algorithm_results
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Allow authenticated users to insert algorithm results
CREATE POLICY "Allow authenticated users to insert algorithm results"
    ON public.algorithm_results
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Allow authenticated users to update algorithm results
CREATE POLICY "Allow authenticated users to update algorithm results"
    ON public.algorithm_results
    FOR UPDATE
    TO authenticated
    USING (true);

-- RLS Policy: Allow authenticated users to delete algorithm results
CREATE POLICY "Allow authenticated users to delete algorithm results"
    ON public.algorithm_results
    FOR DELETE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_algorithm_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_algorithm_results_updated_at
    BEFORE UPDATE ON public.algorithm_results
    FOR EACH ROW
    EXECUTE FUNCTION update_algorithm_results_updated_at();

-- Create function to calculate processing metrics
CREATE OR REPLACE FUNCTION calculate_processing_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate processing rate if duration and items are available
    IF NEW.execution_duration_ms > 0 AND NEW.items_processed > 0 THEN
        NEW.processing_rate := (NEW.items_processed::DECIMAL / NEW.execution_duration_ms::DECIMAL) * 1000;
    END IF;
    
    -- Determine if manual review is required based on scores and errors
    IF NEW.confidence_score < 0.7 OR NEW.errors_count > 0 OR NEW.anomalies_detected = true THEN
        NEW.requires_manual_review := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calculating metrics
CREATE TRIGGER trigger_calculate_processing_metrics
    BEFORE INSERT OR UPDATE ON public.algorithm_results
    FOR EACH ROW
    EXECUTE FUNCTION calculate_processing_metrics();

-- Create function to update P&ID tag extraction status when algorithm completes
CREATE OR REPLACE FUNCTION update_pid_on_algorithm_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a tag extraction algorithm that succeeded, update P&ID status
    IF NEW.algorithm_type = 'tag_extraction' 
       AND NEW.result_status = 'success' 
       AND NEW.pid_report_id IS NOT NULL THEN
        
        UPDATE public.pid_reports
        SET tag_extraction_status = 'completed'
        WHERE id = NEW.pid_report_id;
    END IF;
    
    -- If algorithm failed, update status accordingly
    IF NEW.algorithm_type = 'tag_extraction' 
       AND NEW.result_status IN ('failed', 'error') 
       AND NEW.pid_report_id IS NOT NULL THEN
        
        UPDATE public.pid_reports
        SET tag_extraction_status = 'failed'
        WHERE id = NEW.pid_report_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating P&ID status
CREATE TRIGGER trigger_update_pid_on_algorithm_completion
    AFTER INSERT ON public.algorithm_results
    FOR EACH ROW
    EXECUTE FUNCTION update_pid_on_algorithm_completion();

-- Add helpful comments
COMMENT ON TABLE public.algorithm_results IS 'Processing and analysis results from various algorithms applied to P&ID documents and tag extractions';
COMMENT ON COLUMN public.algorithm_results.algorithm_name IS 'Name of the algorithm that produced these results';
COMMENT ON COLUMN public.algorithm_results.execution_id IS 'Batch execution identifier for grouping related algorithm runs';
COMMENT ON COLUMN public.algorithm_results.result_data IS 'JSONB structure containing detailed algorithm output and findings';
COMMENT ON COLUMN public.algorithm_results.confidence_score IS 'Overall confidence score of the algorithm results (0.0 to 1.0)';
COMMENT ON COLUMN public.algorithm_results.findings IS 'JSONB array of specific findings, issues, or insights discovered';
COMMENT ON COLUMN public.algorithm_results.recommendations IS 'JSONB array of recommended actions based on analysis';
COMMENT ON COLUMN public.algorithm_results.requires_manual_review IS 'Flag indicating if results need human verification';
COMMENT ON COLUMN public.algorithm_results.risk_level IS 'Assessed risk level based on algorithm findings';
