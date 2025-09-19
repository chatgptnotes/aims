-- ============================================================================
-- ADD PASSWORD COLUMN TO CLINICS TABLE
-- This adds the missing password field for clinic authentication
-- ============================================================================

-- Add password column to clinics table
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add adminPassword column for compatibility
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS adminPassword VARCHAR(255);

-- Verify the columns were added
SELECT
    'Clinics table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clinics'
ORDER BY ordinal_position;

-- Check current clinic data
SELECT
    'Current clinic data:' as info,
    name,
    email,
    password,
    adminPassword,
    is_active
FROM public.clinics;