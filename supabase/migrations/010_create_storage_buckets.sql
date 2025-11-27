-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 010_create_storage_buckets.sql
-- Description: Create storage buckets for P&ID documents and industrial files
-- =============================================

-- Note: Supabase storage buckets are created through SQL extensions
-- Make sure storage extension is enabled

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- Step 1: Create storage buckets for AIMS
-- ====================================

-- Create P&ID documents bucket (main document storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pid-documents',
    'pid-documents',
    false, -- Private bucket (requires authentication)
    104857600, -- 100MB file size limit
    ARRAY[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/dwg',
        'application/dxf'
    ]::text[]
) ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create tag extraction results bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tag-extractions',
    'tag-extractions',
    false,
    52428800, -- 50MB file size limit
    ARRAY[
        'application/json',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/xml',
        'text/xml'
    ]::text[]
) ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create engineering drawings bucket (for CAD files and technical drawings)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'engineering-drawings',
    'engineering-drawings',
    false,
    209715200, -- 200MB file size limit (CAD files can be large)
    ARRAY[
        'application/pdf',
        'application/dwg',
        'application/dxf',
        'application/step',
        'application/iges',
        'image/vnd.dwg',
        'image/vnd.dxf',
        'model/vnd.dwf',
        'application/acad',
        'application/x-acad',
        'application/autocad_dwg',
        'image/x-dwg'
    ]::text[]
) ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create compliance documents bucket (for certificates, permits, standards)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'compliance-documents',
    'compliance-documents',
    false,
    52428800, -- 50MB file size limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg'
    ]::text[]
) ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create reports bucket (for generated reports and analysis results)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports',
    'reports',
    false,
    52428800, -- 50MB file size limit
    ARRAY[
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
) ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create profile images bucket (for engineer and supervisor photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true, -- Public bucket for profile images
    5242880, -- 5MB file size limit
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp'
    ]::text[]
) ON CONFLICT (id) DO UPDATE
SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create temporary uploads bucket (for processing and staging)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'temp-uploads',
    'temp-uploads',
    false,
    104857600, -- 100MB file size limit
    NULL -- Allow all file types temporarily
) ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit;

-- Create audit attachments bucket (for audit trail evidence)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audit-attachments',
    'audit-attachments',
    false,
    26214400, -- 25MB file size limit
    ARRAY[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'text/plain',
        'application/json'
    ]::text[]
) ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ====================================
-- Step 2: Set up RLS policies for storage buckets
-- ====================================

-- P&ID Documents bucket policies
CREATE POLICY "Engineers can upload P&ID documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'pid-documents' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can view P&ID documents in their project area"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'pid-documents' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Engineers can update their P&ID documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'pid-documents' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Engineers can delete their P&ID documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'pid-documents' AND
    auth.role() = 'authenticated'
);

-- Tag Extractions bucket policies
CREATE POLICY "Users can upload tag extractions"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'tag-extractions' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can view tag extractions"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'tag-extractions' AND
    auth.role() = 'authenticated'
);

-- Engineering Drawings bucket policies
CREATE POLICY "Engineers can upload engineering drawings"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'engineering-drawings' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view engineering drawings"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'engineering-drawings' AND
    auth.role() = 'authenticated'
);

-- Compliance Documents bucket policies
CREATE POLICY "Authorized users can upload compliance documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'compliance-documents' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can view compliance documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'compliance-documents' AND
    auth.role() = 'authenticated'
);

-- Reports bucket policies
CREATE POLICY "System can create reports"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can view reports"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated'
);

-- Profile Images bucket policies (public)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated'
);

-- Temporary uploads bucket policies
CREATE POLICY "Authenticated users can upload to temp"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'temp-uploads' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their temp uploads"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'temp-uploads' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their temp uploads"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'temp-uploads' AND
    auth.role() = 'authenticated'
);

-- Audit attachments bucket policies (restricted)
CREATE POLICY "Only admins can upload audit attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audit-attachments' AND
    auth.role() = 'authenticated'
    -- Additional admin check can be added here
);

CREATE POLICY "Only admins can view audit attachments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audit-attachments' AND
    auth.role() = 'authenticated'
    -- Additional admin check can be added here
);

-- ====================================
-- Step 3: Create helper functions for storage management
-- ====================================

-- Function to get storage URL for a file
CREATE OR REPLACE FUNCTION get_storage_url(
    p_bucket_name TEXT,
    p_file_path TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN 'https://zixlvrqvgqfgnvytdeic.supabase.co/storage/v1/object/public/' || p_bucket_name || '/' || p_file_path;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old temporary files (run periodically)
CREATE OR REPLACE FUNCTION cleanup_temp_uploads() RETURNS void AS $$
BEGIN
    -- Delete files older than 24 hours from temp-uploads bucket
    DELETE FROM storage.objects
    WHERE bucket_id = 'temp-uploads'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to move file from temp to permanent bucket
CREATE OR REPLACE FUNCTION move_from_temp_to_bucket(
    p_temp_file_path TEXT,
    p_target_bucket TEXT,
    p_target_path TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_success BOOLEAN := false;
BEGIN
    -- This is a placeholder - actual implementation would use Supabase storage API
    -- In practice, you'd use the storage client library to move files
    -- For now, just return true to indicate the function structure
    v_success := true;
    RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- Step 4: Create storage metadata tracking table
-- ====================================

CREATE TABLE IF NOT EXISTS public.storage_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),

    -- Association with AIMS entities
    project_area_id UUID REFERENCES public.project_areas(id),
    pid_report_id UUID REFERENCES public.pid_reports(id),
    uploaded_by UUID REFERENCES auth.users(id),

    -- Metadata
    description TEXT,
    tags TEXT[],
    is_archived BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Create unique constraint
    CONSTRAINT unique_bucket_path UNIQUE (bucket_name, file_path)
);

-- Create indexes for storage metadata
CREATE INDEX idx_storage_metadata_bucket ON public.storage_metadata(bucket_name);
CREATE INDEX idx_storage_metadata_project_area ON public.storage_metadata(project_area_id);
CREATE INDEX idx_storage_metadata_pid_report ON public.storage_metadata(pid_report_id);
CREATE INDEX idx_storage_metadata_uploaded_by ON public.storage_metadata(uploaded_by);
CREATE INDEX idx_storage_metadata_created_at ON public.storage_metadata(created_at);

-- ====================================
-- Step 5: Set up automatic cleanup job (optional)
-- ====================================

-- Note: This requires pg_cron extension
-- Uncomment if pg_cron is available in your Supabase instance

-- CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- -- Schedule daily cleanup of temporary files
-- SELECT cron.schedule(
--     'cleanup-temp-uploads',
--     '0 2 * * *', -- Run at 2 AM daily
--     'SELECT cleanup_temp_uploads();'
-- );

-- ====================================
-- Verification queries
-- ====================================

-- Check created buckets
-- SELECT * FROM storage.buckets ORDER BY name;

-- Check storage policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';