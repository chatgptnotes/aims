-- ============================================================================
-- DISABLE EMAIL CONFIRMATION IN SUPABASE
-- This script disables email confirmation requirement
-- ============================================================================

-- Method 1: Update auth config (if you have access)
-- UPDATE auth.config SET email_confirm_required = false;

-- Method 2: Manually confirm existing users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Method 3: Create a function to auto-confirm users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email for new users
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'Email confirmation disabled! All new users will be auto-confirmed.' AS status;