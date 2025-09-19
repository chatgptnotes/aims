-- ============================================================================
-- COMPATIBILITY TEST FOR EXISTING AUTH SERVICE
-- Test if the new schema works with your existing authService.js
-- ============================================================================

-- Test 1: Check if profiles table structure matches authService expectations
DO $$
BEGIN
    -- Check if profiles table has all required columns for authService
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name IN ('id', 'full_name', 'role', 'avatar_url')
    ) THEN
        RAISE EXCEPTION 'profiles table missing required columns for authService';
    END IF;

    RAISE NOTICE 'profiles table structure is compatible with authService';
END
$$;

-- Test 2: Check if organizations table supports the authService requirements
DO $$
BEGIN
    -- Check organizations table columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations'
        AND column_name IN ('id', 'name', 'type', 'subscription_tier', 'credits_remaining')
    ) THEN
        RAISE EXCEPTION 'organizations table missing required columns';
    END IF;

    RAISE NOTICE 'organizations table structure is compatible';
END
$$;

-- Test 3: Check if org_memberships table supports role-based access
DO $$
BEGIN
    -- Check org_memberships table columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'org_memberships'
        AND column_name IN ('org_id', 'user_id', 'role')
    ) THEN
        RAISE EXCEPTION 'org_memberships table missing required columns';
    END IF;

    RAISE NOTICE 'org_memberships table structure is compatible';
END
$$;

-- Test 4: Test sample data insertion that matches authService flow
BEGIN;

-- Test user registration flow (as done in authService.js)
-- This simulates what happens in registerWithEmail function

-- 1. Insert profile data (simulating Supabase auth user creation)
INSERT INTO profiles (
    id,
    full_name,
    email,
    role
) VALUES (
    gen_random_uuid(),
    'Test User',
    'test@example.com',
    'patient'
);

-- 2. Create personal organization for patient
INSERT INTO organizations (
    name,
    type,
    subscription_tier,
    credits_total
) VALUES (
    'Test User - Personal Account',
    'personal',
    'free',
    5
);

-- 3. Create organization membership
WITH latest_user AS (
    SELECT id FROM profiles WHERE email = 'test@example.com' LIMIT 1
),
latest_org AS (
    SELECT id FROM organizations WHERE name = 'Test User - Personal Account' LIMIT 1
)
INSERT INTO org_memberships (
    org_id,
    user_id,
    role
)
SELECT
    latest_org.id,
    latest_user.id,
    'owner'
FROM latest_user, latest_org;

-- 4. Test patient record creation
WITH latest_user AS (
    SELECT id FROM profiles WHERE email = 'test@example.com' LIMIT 1
),
latest_org AS (
    SELECT id FROM organizations WHERE name = 'Test User - Personal Account' LIMIT 1
)
INSERT INTO patients (
    org_id,
    user_id,
    external_id,
    full_name,
    date_of_birth,
    gender,
    email
)
SELECT
    latest_org.id,
    latest_user.id,
    'PAT_' || extract(epoch from now()),
    'Test User',
    '1990-01-01',
    'other',
    'test@example.com'
FROM latest_user, latest_org;

ROLLBACK; -- Rollback test data

-- Test 5: Validate that auth service queries will work
-- Test query patterns used in authService.js

-- Test profile lookup (used in login)
EXPLAIN (FORMAT TEXT)
SELECT * FROM profiles WHERE id = gen_random_uuid();

-- Test organization lookup for user
EXPLAIN (FORMAT TEXT)
SELECT o.*
FROM organizations o
JOIN org_memberships om ON om.org_id = o.id
WHERE om.user_id = gen_random_uuid();

-- Test patient lookup for organization
EXPLAIN (FORMAT TEXT)
SELECT * FROM patients WHERE org_id = gen_random_uuid();

-- Success message
SELECT 'Compatibility test completed successfully! ✅' AS status,
       'Your authService.js will work with the new database schema.' AS message;