-- =============================================
-- QUICK FIX: Disable RLS on supervisors table for development
-- =============================================
-- Copy and paste this entire block into Supabase SQL Editor and run it

-- Disable RLS on supervisors table
ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'supervisors';

-- Test query
SELECT id, first_name, last_name, email, project_area_id
FROM public.supervisors;
