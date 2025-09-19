-- ============================================================================
-- DATABASE SCHEMA VALIDATION AND TEST SCRIPT
-- Test if the multi-auth schema works properly
-- ============================================================================

-- Test 1: Check if all custom types are created properly
DO $$
BEGIN
    -- Test user role type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        RAISE EXCEPTION 'user_role_type not found';
    END IF;

    -- Test organization type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type') THEN
        RAISE EXCEPTION 'organization_type not found';
    END IF;

    RAISE NOTICE 'All custom types are created successfully';
END
$$;

-- Test 2: Validate table relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN (
        'profiles', 'organizations', 'org_memberships', 'patients',
        'clinic_profiles', 'super_admin_profiles', 'subscriptions',
        'payment_history', 'patient_sessions', 'reports', 'audit_logs'
    )
ORDER BY tc.table_name, kcu.column_name;

-- Test 3: Insert sample data to validate schema
BEGIN;

-- Test insert into organizations
INSERT INTO organizations (
    name,
    type,
    subscription_tier,
    credits_total
) VALUES (
    'Test Clinic',
    'clinic',
    'free',
    10
);

-- Test insert into system_settings
INSERT INTO system_settings (
    key,
    value,
    description,
    category
) VALUES (
    'test.setting',
    '"test_value"',
    'Test setting for validation',
    'testing'
);

ROLLBACK; -- Rollback test data

-- Test 4: Check indexes exist
SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE tablename IN (
    'profiles', 'organizations', 'patients', 'reports'
)
ORDER BY tablename, indexname;

-- Test 5: Validate constraints
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    contype AS constraint_type,
    consrc AS constraint_definition
FROM pg_constraint
WHERE conrelid::regclass::text IN (
    'profiles', 'organizations', 'patients', 'reports'
)
AND contype IN ('c', 'f') -- Check and Foreign key constraints
ORDER BY table_name, constraint_name;

-- Success message
SELECT 'Schema validation completed successfully!' AS status;