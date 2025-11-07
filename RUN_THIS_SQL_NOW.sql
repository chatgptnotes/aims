-- ============================================
-- FINAL PASSWORD FIX - RUN THIS SQL NOW
-- ============================================
-- This will consolidate your password columns into ONE
-- and fix the dual password login issue

-- STEP 1: Check current state (optional - just to see what we have)
SELECT id, email, password, adminpassword FROM clinics WHERE email = 'hope@gmail.com';

-- STEP 2: Decide which password to keep and run ONE of the options below

-- ============================================
-- OPTION A: Keep "Hope@1234" (RECOMMENDED)
-- ============================================
-- Uncomment these lines if you want to use Hope@1234 as your password:

-- UPDATE clinics
-- SET password = 'Hope@1234'
-- WHERE email = 'hope@gmail.com';

-- ALTER TABLE clinics
-- DROP COLUMN IF EXISTS adminpassword;

-- SELECT id, email, password FROM clinics WHERE email = 'hope@gmail.com';


-- ============================================
-- OPTION B: Keep "HopeHospital@1"
-- ============================================
-- Uncomment these lines if you want to use HopeHospital@1 as your password:

-- ALTER TABLE clinics
-- DROP COLUMN IF EXISTS adminpassword;

-- SELECT id, email, password FROM clinics WHERE email = 'hope@gmail.com';


-- ============================================
-- AFTER RUNNING THE SQL:
-- ============================================
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Find hope@gmail.com
-- 3. Reset password to match what you chose above
-- 4. Clear browser cache
-- 5. Test login with ONLY the new password
-- 6. Verify old password does NOT work
