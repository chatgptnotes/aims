-- =============================================
-- SIMPLE FIX: Just disable RLS on tables
-- Run this in Supabase SQL Editor
-- =============================================

-- Disable RLS on supervisors table
ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;

-- Disable RLS on pid_reports table
ALTER TABLE public.pid_reports DISABLE ROW LEVEL SECURITY;

-- Disable RLS on project_areas table
ALTER TABLE public.project_areas DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('supervisors', 'pid_reports', 'project_areas')
AND schemaname = 'public';

-- All should show rowsecurity = false
