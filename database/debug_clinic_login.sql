-- ============================================================================
-- DEBUG CLINIC LOGIN ISSUE
-- Run this in Supabase SQL Editor to see exact clinic data
-- ============================================================================

-- Show all clinic records with passwords
SELECT
    'CLINIC DATA DEBUG' as info,
    id,
    name,
    email,
    CASE
        WHEN password IS NOT NULL THEN 'HAS PASSWORD (' || LENGTH(password) || ' chars)'
        ELSE 'NO PASSWORD'
    END as password_status,
    is_active,
    subscription_status,
    created_at
FROM public.clinics
ORDER BY created_at DESC;

-- Check for the specific clinics we saw in the dashboard
SELECT
    'ABC CLINIC CHECK' as info,
    name,
    email,
    password,
    is_active
FROM public.clinics
WHERE name = 'ABC' OR email = 'abc@gmail.com';

SELECT
    'BCD CLINIC CHECK' as info,
    name,
    email,
    password,
    is_active
FROM public.clinics
WHERE name = 'bcd' OR email = 'bcd@gmail.com';

-- Show total count
SELECT COUNT(*) as total_clinics FROM public.clinics;