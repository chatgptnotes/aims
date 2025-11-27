-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 999_add_test_supervisor.sql
-- Description: Add test supervisor for upload form testing
-- =============================================

-- Step 1: Create or get a test project area
DO $$
DECLARE
    test_project_id UUID;
    test_user_id UUID;
BEGIN
    -- Check if test project area exists, if not create it
    SELECT id INTO test_project_id FROM public.project_areas WHERE code = 'TEST-PROJECT-001' LIMIT 1;

    IF test_project_id IS NULL THEN
        INSERT INTO public.project_areas (
            id,
            name,
            code,
            description,
            location,
            facility_type,
            region,
            country,
            primary_engineer_name,
            primary_engineer_email,
            industry_type,
            status,
            subscription_type,
            max_supervisors,
            max_pid_uploads_per_month,
            is_active
        ) VALUES (
            gen_random_uuid(),
            'Test Project Area',
            'TEST-PROJECT-001',
            'Test project area for development and testing purposes',
            'Dubai, UAE',
            'Test Facility',
            'Middle East',
            'UAE',
            'Test Engineer',
            'engineer@test.com',
            'Testing & Development',
            'active',
            'enterprise',
            100,
            1000,
            true
        )
        RETURNING id INTO test_project_id;

        RAISE NOTICE 'Created test project area with ID: %', test_project_id;
    ELSE
        RAISE NOTICE 'Test project area already exists with ID: %', test_project_id;
    END IF;

    -- Step 2: Create test user in auth.users if not exists
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test.supervisor@aims-system.com' LIMIT 1;

    IF test_user_id IS NULL THEN
        -- Generate a new UUID for the test user
        test_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud
        ) VALUES (
            test_user_id,
            '00000000-0000-0000-0000-000000000000',
            'test.supervisor@aims-system.com',
            crypt('TestPass123!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"name":"Test Supervisor"}'::jsonb,
            false,
            'authenticated',
            'authenticated'
        );

        RAISE NOTICE 'Created test user with ID: %', test_user_id;
    ELSE
        RAISE NOTICE 'Test user already exists with ID: %', test_user_id;
    END IF;

    -- Step 3: Create test supervisor if not exists
    IF NOT EXISTS (SELECT 1 FROM public.supervisors WHERE email = 'test.supervisor@aims-system.com') THEN
        INSERT INTO public.supervisors (
            id,
            user_id,
            project_area_id,
            first_name,
            last_name,
            email,
            phone,
            employee_id,
            safety_rating,
            clearance_level,
            emergency_contact_name,
            emergency_contact_phone,
            department,
            shift_schedule,
            work_location,
            certifications,
            assigned_units,
            specialization,
            notes,
            is_active
        ) VALUES (
            gen_random_uuid(),
            test_user_id,
            test_project_id,
            'Test',
            'Supervisor',
            'test.supervisor@aims-system.com',
            '+971-50-123-4567',
            'EMP-TEST-001',
            'green',
            'standard',
            'Emergency Contact Name',
            '+971-50-999-9999',
            'Operations',
            'Day Shift (7AM-3PM)',
            'Test Facility - Main Building',
            ARRAY['Safety Level 1', 'P&ID Reading', 'Asset Management'],
            ARRAY['Unit 100', 'Unit 200', 'Utilities'],
            'P&ID Management',
            'Test supervisor account for development and testing',
            true
        );

        RAISE NOTICE 'Created test supervisor successfully';
    ELSE
        RAISE NOTICE 'Test supervisor already exists';
    END IF;

    -- Step 4: Create user role if not exists
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = test_user_id AND role = 'supervisor') THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (test_user_id, 'supervisor');
        RAISE NOTICE 'Created user role for test supervisor';
    END IF;

END $$;

-- Verify the records were created
SELECT 'Test Project Area:' as info, id, name, code FROM public.project_areas WHERE code = 'TEST-PROJECT-001';
SELECT 'Test User:' as info, id, email FROM auth.users WHERE email = 'test.supervisor@aims-system.com';
SELECT 'Test Supervisor:' as info, id, first_name, last_name, email, employee_id FROM public.supervisors WHERE email = 'test.supervisor@aims-system.com';
SELECT 'User Role:' as info, role FROM public.user_roles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test.supervisor@aims-system.com' LIMIT 1);
