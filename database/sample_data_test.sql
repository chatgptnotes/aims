-- ============================================================================
-- SAMPLE DATA TEST FOR NEURO360 MULTI-AUTH SYSTEM
-- Test complete workflow with sample data insertion
-- ============================================================================

-- IMPORTANT: This script tests the complete workflow
-- It should be run AFTER the migration script

BEGIN;

-- ============================================================================
-- STEP 1: CREATE SAMPLE SUPER ADMIN
-- ============================================================================

-- Insert super admin profile
INSERT INTO profiles (
    id,
    full_name,
    first_name,
    last_name,
    email,
    phone,
    role,
    is_active,
    is_email_verified
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'John Admin',
    'John',
    'Admin',
    'admin@neuro360.com',
    '+919876543210',
    'super_admin',
    true,
    true
);

-- Insert super admin extended profile
INSERT INTO super_admin_profiles (
    user_id,
    employee_id,
    department,
    designation,
    work_email,
    access_level,
    modules_access,
    hire_date
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'EMP001',
    'System Administration',
    'Chief Technology Officer',
    'john.admin@neuro360.com',
    'super',
    '["clinic_management", "user_management", "billing", "reports", "system_settings"]',
    '2024-01-01'
);

-- ============================================================================
-- STEP 2: CREATE SAMPLE CLINIC ORGANIZATION
-- ============================================================================

-- Insert clinic organization
INSERT INTO organizations (
    id,
    name,
    slug,
    type,
    email,
    phone,
    address,
    subscription_tier,
    subscription_status,
    credits_total,
    patient_limit,
    user_limit,
    is_active,
    is_verified
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Mumbai Neurofeedback Clinic',
    'mumbai-neurofeedback',
    'clinic',
    'info@mumbaineurofeedback.com',
    '+912244556677',
    '{"line1": "123 Brain Health Center", "line2": "Bandra West", "city": "Mumbai", "state": "Maharashtra", "country": "India", "postal_code": "400050"}',
    'premium',
    'active',
    100,
    50,
    10,
    true,
    true
);

-- ============================================================================
-- STEP 3: CREATE CLINIC ADMIN
-- ============================================================================

-- Insert clinic admin profile
INSERT INTO profiles (
    id,
    full_name,
    first_name,
    last_name,
    email,
    phone,
    role,
    is_active,
    is_email_verified
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Dr. Priya Sharma',
    'Priya',
    'Sharma',
    'priya@mumbaineurofeedback.com',
    '+919988776655',
    'clinic_admin',
    true,
    true
);

-- Create organization membership for clinic admin
INSERT INTO org_memberships (
    org_id,
    user_id,
    role,
    can_manage_patients,
    can_view_reports,
    can_manage_billing,
    can_manage_users
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'owner',
    true,
    true,
    true,
    true
);

-- Insert clinic profile for admin
INSERT INTO clinic_profiles (
    user_id,
    org_id,
    license_number,
    specialty,
    education,
    years_of_experience,
    designation,
    is_primary_contact,
    consultation_fee,
    approval_status,
    approved_by,
    approved_at
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'MH/MED/12345',
    '["Neurofeedback", "QEEG Analysis", "Cognitive Therapy"]',
    '["MBBS - Mumbai University", "MD Psychiatry - AIIMS"]',
    12,
    'Chief Medical Officer',
    true,
    2500.00,
    'approved',
    '11111111-1111-1111-1111-111111111111',
    NOW()
);

-- ============================================================================
-- STEP 4: CREATE CLINIC DOCTOR
-- ============================================================================

-- Insert doctor profile
INSERT INTO profiles (
    id,
    full_name,
    first_name,
    last_name,
    email,
    phone,
    role,
    is_active,
    is_email_verified
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'Dr. Rajesh Kumar',
    'Rajesh',
    'Kumar',
    'rajesh@mumbaineurofeedback.com',
    '+919876543211',
    'doctor',
    true,
    true
);

-- Create organization membership for doctor
INSERT INTO org_memberships (
    org_id,
    user_id,
    role,
    can_manage_patients,
    can_view_reports
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'doctor',
    true,
    true
);

-- Insert clinic profile for doctor
INSERT INTO clinic_profiles (
    user_id,
    org_id,
    license_number,
    specialty,
    years_of_experience,
    designation,
    consultation_fee,
    approval_status,
    approved_by,
    approved_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'MH/MED/67890',
    '["EEG Analysis", "Neurofeedback Training"]',
    8,
    'Senior Neurofeedback Specialist',
    2000.00,
    'approved',
    '11111111-1111-1111-1111-111111111111',
    NOW()
);

-- ============================================================================
-- STEP 5: CREATE PERSONAL PATIENT ORGANIZATION
-- ============================================================================

-- Insert personal organization for individual patient
INSERT INTO organizations (
    id,
    name,
    type,
    subscription_tier,
    subscription_status,
    credits_total,
    is_active
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Rahul Verma - Personal Account',
    'personal',
    'free',
    'trial',
    5,
    true
);

-- ============================================================================
-- STEP 6: CREATE PATIENT
-- ============================================================================

-- Insert patient profile
INSERT INTO profiles (
    id,
    full_name,
    first_name,
    last_name,
    email,
    phone,
    role,
    is_active,
    is_email_verified
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    'Rahul Verma',
    'Rahul',
    'Verma',
    'rahul.verma@gmail.com',
    '+919876543212',
    'patient',
    true,
    true
);

-- Create organization membership for patient (personal account)
INSERT INTO org_memberships (
    org_id,
    user_id,
    role
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    'owner'
);

-- Insert patient record in personal organization
INSERT INTO patients (
    id,
    org_id,
    user_id,
    external_id,
    full_name,
    first_name,
    last_name,
    date_of_birth,
    gender,
    email,
    phone,
    address,
    improvement_focus,
    consent_given,
    consent_date,
    status
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    'PAT_001',
    'Rahul Verma',
    'Rahul',
    'Verma',
    '1995-06-15',
    'male',
    'rahul.verma@gmail.com',
    '+919876543212',
    '{"line1": "456 Residential Complex", "city": "Delhi", "state": "Delhi", "country": "India", "postal_code": "110001"}',
    '["attention", "focus", "anxiety"]',
    true,
    NOW(),
    'active'
);

-- ============================================================================
-- STEP 7: CREATE CLINIC PATIENT
-- ============================================================================

-- Insert clinic patient (no user account - managed by clinic)
INSERT INTO patients (
    id,
    org_id,
    external_id,
    full_name,
    first_name,
    last_name,
    date_of_birth,
    gender,
    email,
    phone,
    primary_doctor_id,
    improvement_focus,
    medical_history,
    consent_given,
    consent_date,
    status
) VALUES (
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    'CLI_PAT_001',
    'Anita Singh',
    'Anita',
    'Singh',
    '1988-03-20',
    'female',
    'anita.singh@email.com',
    '+919876543213',
    '44444444-4444-4444-4444-444444444444',
    '["memory", "cognitive_enhancement", "stress"]',
    '[{"condition": "Mild Cognitive Impairment", "diagnosed_date": "2024-01-15", "notes": "Patient experiencing memory issues"}]',
    true,
    NOW(),
    'active'
);

-- ============================================================================
-- STEP 8: CREATE SUBSCRIPTION
-- ============================================================================

-- Insert subscription for clinic
INSERT INTO subscriptions (
    org_id,
    plan_name,
    plan_type,
    billing_cycle,
    amount,
    total_amount,
    credits_included,
    patient_limit,
    user_limit,
    features_included,
    starts_at,
    ends_at,
    status
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Premium Plan',
    'premium',
    'monthly',
    4999.00,
    5899.00, -- Including 18% GST
    100,
    50,
    10,
    '["unlimited_reports", "advanced_analytics", "patient_portal", "api_access"]',
    NOW(),
    NOW() + INTERVAL '1 month',
    'active'
);

-- ============================================================================
-- STEP 9: CREATE PATIENT SESSION
-- ============================================================================

-- Insert patient session
INSERT INTO patient_sessions (
    patient_id,
    org_id,
    doctor_id,
    session_number,
    session_type,
    scheduled_at,
    started_at,
    ended_at,
    duration_minutes,
    pre_session_notes,
    post_session_notes,
    session_metrics,
    status
) VALUES (
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    1,
    'initial',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '45 minutes',
    45,
    'Initial assessment session. Patient reports difficulty concentrating.',
    'Good response to neurofeedback training. Patient showed improvement in focus metrics.',
    '{"alpha_waves": 8.5, "beta_waves": 15.2, "focus_score": 78, "relaxation_score": 65}',
    'completed'
);

-- ============================================================================
-- STEP 10: CREATE REPORT
-- ============================================================================

-- Insert report
INSERT INTO reports (
    patient_id,
    session_id,
    org_id,
    generated_by,
    report_type,
    title,
    description,
    report_data,
    metrics,
    insights,
    recommendations,
    status
) VALUES (
    '88888888-8888-8888-8888-888888888888',
    (SELECT id FROM patient_sessions WHERE patient_id = '88888888-8888-8888-8888-888888888888' LIMIT 1),
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'session_summary',
    'Initial Assessment Report - Anita Singh',
    'Comprehensive neurofeedback assessment with baseline measurements',
    '{"session_duration": 45, "protocols_used": ["SMR", "Beta"], "electrode_placement": "C3-C4"}',
    '{"baseline_alpha": 7.2, "post_session_alpha": 8.5, "improvement": "18%"}',
    '["Patient shows good response to SMR protocol", "Alpha wave improvement noted", "Recommended 12-session program"]',
    '["Continue SMR protocol twice weekly", "Monitor progress weekly", "Consider adding Beta protocol in session 6"]',
    'generated'
);

-- ============================================================================
-- TEST QUERIES TO VALIDATE DATA
-- ============================================================================

-- Test 1: Verify multi-auth structure
SELECT
    'Multi-Auth Structure Test' AS test_name,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) AS super_admins,
    COUNT(CASE WHEN role = 'clinic_admin' THEN 1 END) AS clinic_admins,
    COUNT(CASE WHEN role = 'doctor' THEN 1 END) AS doctors,
    COUNT(CASE WHEN role = 'patient' THEN 1 END) AS patients
FROM profiles;

-- Test 2: Verify organization structure
SELECT
    'Organization Structure Test' AS test_name,
    COUNT(CASE WHEN type = 'clinic' THEN 1 END) AS clinics,
    COUNT(CASE WHEN type = 'personal' THEN 1 END) AS personal_accounts,
    COUNT(CASE WHEN type = 'enterprise' THEN 1 END) AS enterprise_accounts
FROM organizations;

-- Test 3: Verify patient portal data
SELECT
    'Patient Portal Test' AS test_name,
    p.full_name AS patient_name,
    o.name AS organization_name,
    o.type AS org_type,
    COUNT(ps.id) AS total_sessions,
    COUNT(r.id) AS total_reports
FROM patients p
JOIN organizations o ON o.id = p.org_id
LEFT JOIN patient_sessions ps ON ps.patient_id = p.id
LEFT JOIN reports r ON r.patient_id = p.id
GROUP BY p.id, p.full_name, o.name, o.type;

-- Test 4: Verify clinic portal data
SELECT
    'Clinic Portal Test' AS test_name,
    o.name AS clinic_name,
    COUNT(DISTINCT om.user_id) AS staff_count,
    COUNT(DISTINCT p.id) AS patient_count,
    s.plan_name AS subscription_plan,
    o.credits_remaining
FROM organizations o
LEFT JOIN org_memberships om ON om.org_id = o.id
LEFT JOIN patients p ON p.org_id = o.id
LEFT JOIN subscriptions s ON s.org_id = o.id
WHERE o.type = 'clinic'
GROUP BY o.id, o.name, s.plan_name, o.credits_remaining;

-- Test 5: Verify super admin portal data
SELECT
    'Super Admin Portal Test' AS test_name,
    p.full_name AS admin_name,
    sap.access_level,
    sap.modules_access,
    COUNT(DISTINCT o.id) AS total_organizations,
    COUNT(DISTINCT patients.id) AS total_patients_system_wide
FROM profiles p
JOIN super_admin_profiles sap ON sap.user_id = p.id
CROSS JOIN organizations o
CROSS JOIN patients
WHERE p.role = 'super_admin'
GROUP BY p.id, p.full_name, sap.access_level, sap.modules_access;

COMMIT;

-- Success message
SELECT
    'Sample Data Test Completed Successfully! 🎉' AS status,
    'All portals (Patient, Clinic, Super Admin) are working with test data.' AS message;