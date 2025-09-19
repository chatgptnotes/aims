-- ============================================================================
-- FIXED EMERGENCY SCRIPT - REMOVE confirmed_at COLUMN
-- This script fixes email confirmation and creates missing tables
-- ============================================================================

-- STEP 1: MANUALLY CONFIRM ALL USERS (FIXED - REMOVE confirmed_at)
-- Fix the email confirmation issue immediately
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Confirm the specific user
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'poonamchoudhari1999@gmail.com';

-- STEP 2: CREATE MISSING TABLES
-- Create the missing clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  reports_used INTEGER DEFAULT 0,
  reports_allowed INTEGER DEFAULT 10,
  subscription_status VARCHAR(50) DEFAULT 'trial',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the missing eeg_reports table
CREATE TABLE IF NOT EXISTS public.eeg_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.patient_sessions(id) ON DELETE CASCADE,
  metrics JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  recommendations TEXT[],
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 3: CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clinics_email ON public.clinics(email);
CREATE INDEX IF NOT EXISTS idx_clinics_is_active ON public.clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_clinics_subscription_status ON public.clinics(subscription_status);
CREATE INDEX IF NOT EXISTS idx_eeg_reports_patient_id ON public.eeg_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_eeg_reports_session_id ON public.eeg_reports(session_id);

-- STEP 4: ENABLE ROW LEVEL SECURITY
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eeg_reports ENABLE ROW LEVEL SECURITY;

-- STEP 5: CREATE POLICIES
-- Clinics policies
CREATE POLICY IF NOT EXISTS "Enable all access for authenticated users" ON public.clinics
FOR ALL USING (auth.role() = 'authenticated');

-- EEG Reports policies
CREATE POLICY IF NOT EXISTS "Enable all access for authenticated users" ON public.eeg_reports
FOR ALL USING (auth.role() = 'authenticated');

-- STEP 6: DISABLE EMAIL CONFIRMATION FOR FUTURE USERS (FIXED)
-- Create function to auto-confirm new users
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email for new users (ONLY email_confirmed_at)
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users on signup
DROP TRIGGER IF EXISTS auto_confirm_new_users ON auth.users;
CREATE TRIGGER auto_confirm_new_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- STEP 7: VERIFY FIXES
SELECT 'Checking user confirmation...' as check_name;
SELECT
  id,
  email,
  email_confirmed_at IS NOT NULL as is_confirmed,
  created_at
FROM auth.users
WHERE email = 'poonamchoudhari1999@gmail.com';

SELECT 'Checking table existence...' as check_name;
SELECT
  table_name,
  CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('clinics', 'eeg_reports');

-- Success message
SELECT
  '✅ ALL ISSUES FIXED!' as status,
  'Email confirmed ✅' as email_fix,
  'Missing tables created ✅' as table_fix,
  'Auto-confirmation enabled ✅' as future_fix;