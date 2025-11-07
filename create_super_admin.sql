-- Create Super Admin Account in Supabase
-- Run this in Supabase SQL Editor: https://app.supabase.com

-- Step 1: First, you need to create the user in Supabase Auth
-- Go to: Authentication > Users > "Add User" (Email/Password)
-- Email: superadmin@neuro360.com
-- Password: admin123
-- Auto Confirm User: YES (enable this)

-- After creating the user via Supabase dashboard, note the user ID
-- Then run the following SQL with the actual user ID:

-- Step 2: Insert profile data (replace 'USER_ID_HERE' with actual UUID)
INSERT INTO profiles (
  id,
  full_name,
  email,
  phone,
  role,
  avatar_url,
  is_active,
  is_email_verified,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HERE', -- Replace with actual Supabase Auth user ID
  'Super Admin',
  'superadmin@neuro360.com',
  NULL,
  'super_admin',
  NULL,
  true,
  true,
  NOW(),
  NOW()
);

-- Step 3: Create super admin profile
INSERT INTO super_admin_profiles (
  user_id,
  employee_id,
  department,
  designation,
  work_email,
  access_level,
  modules_access,
  requires_2fa,
  hire_date,
  is_active
) VALUES (
  'USER_ID_HERE', -- Replace with actual Supabase Auth user ID
  'SA_001',
  'System Administration',
  'System Administrator',
  'superadmin@neuro360.com',
  'full',
  ARRAY['user_management', 'clinic_management', 'billing', 'reports', 'system_settings', 'analytics'],
  false,
  CURRENT_DATE,
  true
);

-- Verification queries
SELECT * FROM profiles WHERE email = 'superadmin@neuro360.com';
SELECT * FROM super_admin_profiles WHERE work_email = 'superadmin@neuro360.com';
