-- ============================================================================
-- CHECK CLINIC DATA - See what's actually stored in database
-- ============================================================================

-- Check all clinics in the database
SELECT
  id,
  name,
  email,
  LENGTH(COALESCE(password, '')) as password_length,
  is_active,
  subscription_status,
  created_at
FROM public.clinics
ORDER BY created_at DESC;

-- Check specific clinic you might be looking for
SELECT
  'Searching for ABC clinic' as search_info,
  id,
  name,
  email,
  CASE
    WHEN password IS NOT NULL THEN CONCAT('[', LENGTH(password), ' characters]')
    ELSE 'NO PASSWORD'
  END as password_info,
  is_active,
  subscription_status
FROM public.clinics
WHERE name ILIKE '%ABC%' OR email ILIKE '%abc%' OR email ILIKE '%bc@%';

-- Check all clinic emails
SELECT
  'All clinic emails:' as info,
  email,
  name,
  subscription_status
FROM public.clinics;