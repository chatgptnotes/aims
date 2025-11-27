-- =============================================
-- QUICK FIX: Disable RLS on pid_reports table for development
-- =============================================

-- Disable RLS on pid_reports table
ALTER TABLE public.pid_reports DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'pid_reports';

-- Test query
SELECT id, document_title, project_area_id, supervisor_id
FROM public.pid_reports
LIMIT 5;
