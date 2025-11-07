-- Fix Password Columns in Clinics Table
-- This will consolidate adminpassword into password column

-- Step 1: Copy adminpassword to password if password is NULL
UPDATE clinics
SET password = adminpassword
WHERE password IS NULL AND adminpassword IS NOT NULL;

-- Step 2: For first clinic (Hope clinic), use the correct password
-- You mentioned: HopeHospital@1 is in password, Hope@1234 is in adminpassword
-- We need to decide which one to keep. Let's keep the one in 'password' column
-- If you want to use adminpassword instead, uncomment the line below:
-- UPDATE clinics SET password = adminpassword WHERE email = 'hope@gmail.com';

-- Step 3: Drop the adminpassword column (we don't need it anymore)
ALTER TABLE clinics
DROP COLUMN IF EXISTS adminpassword;

-- Verify the change
SELECT id, email, password FROM clinics;
