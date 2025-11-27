-- =============================================
-- QUICK FIX: Set up storage policies for pid-documents bucket
-- =============================================
-- Copy and paste this entire block into Supabase SQL Editor and run it

-- Allow authenticated users to upload files
INSERT INTO storage.buckets (id, name, public)
VALUES ('pid-documents', 'pid-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- Create permissive policies for development
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

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
