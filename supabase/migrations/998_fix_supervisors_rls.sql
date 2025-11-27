-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 998_fix_supervisors_rls.sql
-- Description: Fix RLS policies for supervisors table (development mode)
-- =============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to view supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Allow users to view own supervisor record" ON public.supervisors;
DROP POLICY IF EXISTS "Allow authenticated users to insert supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Allow authenticated users to update supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Allow authenticated users to delete supervisors" ON public.supervisors;

-- Disable RLS for development (easier testing)
ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;

-- Alternative: Enable RLS with very permissive policies for development
-- Uncomment below if you want to keep RLS enabled but with open policies

-- ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all for authenticated" ON public.supervisors
--   FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all for anon" ON public.supervisors
--   FOR ALL TO anon USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all for service_role" ON public.supervisors
--   FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'RLS disabled on supervisors table for development';
END $$;
