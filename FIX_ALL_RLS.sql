-- =============================================
-- COMPLETE FIX: Disable all RLS for development
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================

-- 1. Disable RLS on supervisors table
ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on pid_reports table
ALTER TABLE public.pid_reports DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on project_areas table
ALTER TABLE public.project_areas DISABLE ROW LEVEL SECURITY;

-- 4. Set up storage bucket policies
-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to pid-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reads from pid-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates to pid-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from pid-documents" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Allow all uploads to pid-documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'pid-documents');

CREATE POLICY "Allow all reads from pid-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pid-documents');

CREATE POLICY "Allow all updates to pid-documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'pid-documents');

CREATE POLICY "Allow all deletes from pid-documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'pid-documents');

-- 5. Verify everything is set up correctly
SELECT 'Table RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('supervisors', 'pid_reports', 'project_areas')
AND schemaname = 'public';

SELECT 'Storage Policies:' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Expected results:
-- All tables should show rowsecurity = false
-- Storage should have 4 policies (INSERT, SELECT, UPDATE, DELETE)
