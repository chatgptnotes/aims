-- ============================================================================
-- MANUALLY CONFIRM USER EMAIL
-- This script manually confirms the email for the user who registered
-- ============================================================================

-- Update the specific user's email confirmation
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'poonachoudhri1999@gmail.com';

-- Also update any other unconfirmed users (for future registrations)
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify the update
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'poonachoudhri1999@gmail.com';

-- Success message
SELECT 'User email confirmed successfully! You can now login.' AS status;