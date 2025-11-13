-- Fix Supabase RLS Policy for Clinics Table to Allow DELETE Operations
-- Run this in Supabase Dashboard > SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all" ON clinics;
DROP POLICY IF EXISTS "Enable read access for all users" ON clinics;
DROP POLICY IF EXISTS "Enable insert for all users" ON clinics;
DROP POLICY IF EXISTS "Enable update for all users" ON clinics;
DROP POLICY IF EXISTS "Enable delete for all users" ON clinics;

-- Create comprehensive policies for all operations
CREATE POLICY "Enable read access for all users" ON clinics
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON clinics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON clinics
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON clinics
  FOR DELETE USING (true);

-- Verify RLS is enabled
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Show all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'clinics';
