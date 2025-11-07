-- ============================================
-- SINGLE BUCKET SETUP - PATIENT REPORTS ONLY
-- ============================================
-- Simple security policies for patient-reports bucket
-- Run this in Supabase SQL Editor
-- ============================================

-- Policy 1: Allow authenticated users to UPLOAD files
CREATE POLICY "Allow authenticated users to upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-reports'
);

-- Policy 2: Allow authenticated users to VIEW files
CREATE POLICY "Allow authenticated users to view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-reports'
);

-- Policy 3: Allow authenticated users to DELETE files
CREATE POLICY "Allow authenticated users to delete reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-reports'
);

-- Policy 4: Allow authenticated users to UPDATE files
CREATE POLICY "Allow authenticated users to update reports"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patient-reports'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE name = 'patient-reports';

-- Check if policies were created:
-- SELECT policyname, cmd FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage';

-- List all files in bucket:
-- SELECT name, created_at FROM storage.objects
-- WHERE bucket_id = 'patient-reports'
-- ORDER BY created_at DESC;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- After running this script, you should have:
-- ✅ 4 policies created (INSERT, SELECT, DELETE, UPDATE)
-- ✅ All authenticated users can upload/view/delete files
-- ✅ Files are stored in: patient-reports/{clinic_id}/{patient_id}/{filename}
-- ============================================
