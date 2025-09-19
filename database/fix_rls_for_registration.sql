-- ============================================================================
-- FIX RLS POLICIES FOR REGISTRATION FLOW
-- This script fixes RLS issues that prevent user registration
-- ============================================================================

-- Temporarily disable RLS for registration tables during signup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships DISABLE ROW LEVEL SECURITY;

-- Or alternatively, add permissive policies for registration
-- Enable RLS but allow registration operations

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into profiles during registration
DROP POLICY IF EXISTS "allow_registration_insert_profiles" ON profiles;
CREATE POLICY "allow_registration_insert_profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- Allow anyone to insert into super_admin_profiles during registration
DROP POLICY IF EXISTS "allow_registration_insert_super_admin" ON super_admin_profiles;
CREATE POLICY "allow_registration_insert_super_admin" ON super_admin_profiles
    FOR INSERT WITH CHECK (true);

-- Allow anyone to insert into organizations during registration
DROP POLICY IF EXISTS "allow_registration_insert_organizations" ON organizations;
CREATE POLICY "allow_registration_insert_organizations" ON organizations
    FOR INSERT WITH CHECK (true);

-- Allow anyone to insert into org_memberships during registration
DROP POLICY IF EXISTS "allow_registration_insert_org_memberships" ON org_memberships;
CREATE POLICY "allow_registration_insert_org_memberships" ON org_memberships
    FOR INSERT WITH CHECK (true);

-- Add policy to allow users to read their own profile after creation
DROP POLICY IF EXISTS "users_can_read_own_profile" ON profiles;
CREATE POLICY "users_can_read_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Add policy to allow users to update their own profile
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Success message
SELECT 'RLS policies fixed for registration! Try registering again.' AS status;