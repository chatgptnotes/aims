-- ========================================
-- Supabase Storage RLS Policies
-- For bucket: patient-reports
-- ========================================

-- IMPORTANT: Run these in Supabase SQL Editor or add through Storage > Policies UI

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-reports');

-- Policy 2: Allow authenticated users to read/download files
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'patient-reports');

-- Policy 3: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'patient-reports');

-- Policy 4: Allow authenticated users to update file metadata
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-reports')
WITH CHECK (bucket_id = 'patient-reports');

-- ========================================
-- How to Apply These Policies:
-- ========================================
--
-- Option 1: SQL Editor (Recommended)
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Click "New Query"
-- 3. Copy and paste ALL policies above
-- 4. Click "Run"
--
-- Option 2: Storage UI
-- 1. Go to Storage > patient-reports bucket
-- 2. Click "Policies" tab
-- 3. Click "New Policy" for each policy
-- 4. Select the operation (INSERT, SELECT, DELETE, UPDATE)
-- 5. Target: authenticated users
-- 6. Add the USING/WITH CHECK conditions
-- 7. Save each policy
--
-- ========================================
-- Verify Policies:
-- ========================================
--
-- Run this query to see all policies:
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
--
-- You should see 4 policies for the patient-reports bucket
