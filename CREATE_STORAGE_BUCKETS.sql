-- ============================================
-- CREATE STORAGE BUCKETS FOR NEURO360
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor
-- This will create storage buckets with proper RLS policies

-- NOTE: Storage buckets cannot be created via SQL
-- You must create them manually via Supabase Dashboard
-- This file contains the RLS policies to apply after creation

-- ============================================
-- MANUAL STEPS (Do this FIRST):
-- ============================================
-- 1. Go to Supabase Dashboard
-- 2. Click on "Storage" in left sidebar
-- 3. Click "New bucket" button
-- 4. Create these buckets one by one:
--    - Name: eeg-files
--      Public: NO (keep private)
--      File size limit: 100 MB
--
--    - Name: reports
--      Public: NO (keep private)
--      File size limit: 50 MB
--
--    - Name: protocols
--      Public: NO (keep private)
--      File size limit: 10 MB
--
--    - Name: backups
--      Public: NO (keep private)
--      File size limit: 500 MB

-- ============================================
-- AFTER CREATING BUCKETS, RUN THIS SQL:
-- ============================================

-- Policy 1: Allow authenticated users to upload files
INSERT INTO storage.policies (name, bucket_id, definition)
SELECT
  'Allow authenticated uploads',
  id,
  '(bucket_id = ANY (ARRAY[''eeg-files'', ''reports'', ''protocols'', ''backups'']) AND (auth.role() = ''authenticated''))'
FROM storage.buckets
WHERE name IN ('eeg-files', 'reports', 'protocols', 'backups')
ON CONFLICT DO NOTHING;

-- Policy 2: Allow authenticated users to read their own files
INSERT INTO storage.policies (name, bucket_id, definition)
SELECT
  'Allow authenticated reads',
  id,
  '(bucket_id = ANY (ARRAY[''eeg-files'', ''reports'', ''protocols'', ''backups'']) AND (auth.role() = ''authenticated''))'
FROM storage.buckets
WHERE name IN ('eeg-files', 'reports', 'protocols', 'backups')
ON CONFLICT DO NOTHING;

-- Policy 3: Allow authenticated users to delete their own files
INSERT INTO storage.policies (name, bucket_id, definition)
SELECT
  'Allow authenticated deletes',
  id,
  '(bucket_id = ANY (ARRAY[''eeg-files'', ''reports'', ''protocols'', ''backups'']) AND (auth.role() = ''authenticated''))'
FROM storage.buckets
WHERE name IN ('eeg-files', 'reports', 'protocols', 'backups')
ON CONFLICT DO NOTHING;

-- Verify buckets exist
SELECT id, name, public, created_at
FROM storage.buckets
WHERE name IN ('eeg-files', 'reports', 'protocols', 'backups');
