-- =============================================
-- Make engineer_id nullable in pid_reports table
-- This allows uploads without requiring an engineer
-- =============================================

-- Make engineer_id nullable
ALTER TABLE public.pid_reports
ALTER COLUMN engineer_id DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'pid_reports' AND column_name = 'engineer_id';

-- Should show is_nullable = YES
