-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 009_cleanup_old_medical_tables.sql
-- Description: Remove old medical-related tables and data
-- WARNING: This will permanently delete old medical data!
-- =============================================

-- IMPORTANT: Run this ONLY after confirming all data has been migrated to new AIMS tables
-- Make sure to backup your database before running this script!

BEGIN;

-- ====================================
-- Step 1: Drop old medical-specific tables
-- ====================================

-- Drop clinical/medical tables
DROP TABLE IF EXISTS public.clinical_reports CASCADE;
DROP TABLE IF EXISTS public.wellness_scores CASCADE;
DROP TABLE IF EXISTS public.qeeg_reports CASCADE;
DROP TABLE IF EXISTS public.eeg_data CASCADE;
DROP TABLE IF EXISTS public.brain_health_scores CASCADE;
DROP TABLE IF EXISTS public.neurofeedback_sessions CASCADE;
DROP TABLE IF EXISTS public.therapy_sessions CASCADE;
DROP TABLE IF EXISTS public.meditation_sessions CASCADE;

-- Drop old clinic-related tables (if not being reused)
DROP TABLE IF EXISTS public.clinic_enquiries CASCADE;
DROP TABLE IF EXISTS public.clinic_subscriptions CASCADE;
DROP TABLE IF EXISTS public.clinic_payments CASCADE;

-- Drop old patient-related tables
DROP TABLE IF EXISTS public.patient_reports CASCADE;
DROP TABLE IF EXISTS public.patient_wellness CASCADE;
DROP TABLE IF EXISTS public.patient_medical_history CASCADE;

-- ====================================
-- Step 2: Clean up columns with medical references
-- ====================================

-- If keeping the old 'clinics' table but renaming it
-- (Skip this if you're using the new project_areas table instead)
-- ALTER TABLE public.clinics RENAME TO legacy_clinics_backup;

-- If keeping the old 'patients' table but renaming it
-- (Skip this if you're using the new supervisors table instead)
-- ALTER TABLE public.patients RENAME TO legacy_patients_backup;

-- ====================================
-- Step 3: Drop old functions related to medical operations
-- ====================================

DROP FUNCTION IF EXISTS public.calculate_brain_health_score CASCADE;
DROP FUNCTION IF EXISTS public.generate_wellness_report CASCADE;
DROP FUNCTION IF EXISTS public.process_eeg_data CASCADE;
DROP FUNCTION IF EXISTS public.analyze_qeeg_patterns CASCADE;
DROP FUNCTION IF EXISTS public.calculate_neurofeedback_progress CASCADE;

-- ====================================
-- Step 4: Drop old triggers related to medical operations
-- ====================================

DROP TRIGGER IF EXISTS update_wellness_scores_trigger ON public.patients;
DROP TRIGGER IF EXISTS calculate_brain_metrics_trigger ON public.qeeg_reports;
DROP TRIGGER IF EXISTS update_therapy_progress_trigger ON public.therapy_sessions;

-- ====================================
-- Step 5: Drop old views related to medical data
-- ====================================

DROP VIEW IF EXISTS public.patient_wellness_dashboard CASCADE;
DROP VIEW IF EXISTS public.clinic_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.brain_health_trends CASCADE;

-- ====================================
-- Step 6: Clean up old RLS policies with medical references
-- ====================================

-- Drop policies on tables that still exist but have medical-specific policies
DO $$
BEGIN
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Patients can view own medical records" ON public.reports;
    DROP POLICY IF EXISTS "Clinics can manage patient data" ON public.reports;
    DROP POLICY IF EXISTS "Therapists can view patient sessions" ON public.reports;
EXCEPTION
    WHEN undefined_object THEN
        -- Policies don't exist, continue
        NULL;
END $$;

-- ====================================
-- Step 7: Clean up storage buckets with medical content
-- ====================================

-- Note: This doesn't delete the actual files, just the bucket references
-- You'll need to clean up storage through Supabase dashboard
-- DELETE FROM storage.buckets WHERE name IN ('eeg-reports', 'brain-scans', 'wellness-reports', 'medical-documents');

-- ====================================
-- Step 8: Update any remaining references
-- ====================================

-- Update user roles to new terminology
UPDATE public.user_roles
SET role = CASE
    WHEN role = 'clinic_admin' THEN 'engineer'
    WHEN role = 'patient' THEN 'supervisor'
    WHEN role = 'therapist' THEN 'technician'
    ELSE role
END
WHERE role IN ('clinic_admin', 'patient', 'therapist');

-- Update any metadata fields
UPDATE public.users_metadata
SET metadata = jsonb_set(
    metadata,
    '{role_display}',
    CASE
        WHEN metadata->>'role_display' = 'Clinic Administrator' THEN '"Project Engineer"'
        WHEN metadata->>'role_display' = 'Patient' THEN '"Operations Supervisor"'
        ELSE metadata->'role_display'
    END::jsonb
)
WHERE metadata->>'role_display' IN ('Clinic Administrator', 'Patient');

-- ====================================
-- Step 9: Create backup schema for old data (optional)
-- ====================================

-- Uncomment if you want to keep old data in a backup schema
-- CREATE SCHEMA IF NOT EXISTS medical_backup;
--
-- -- Move old tables to backup schema instead of dropping
-- ALTER TABLE IF EXISTS public.clinics SET SCHEMA medical_backup;
-- ALTER TABLE IF EXISTS public.patients SET SCHEMA medical_backup;
-- ALTER TABLE IF EXISTS public.clinical_reports SET SCHEMA medical_backup;

-- ====================================
-- Step 10: Verify new AIMS tables exist
-- ====================================

DO $$
BEGIN
    -- Check if new tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_areas') THEN
        RAISE EXCEPTION 'New project_areas table does not exist! Run AIMS migrations first.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supervisors') THEN
        RAISE EXCEPTION 'New supervisors table does not exist! Run AIMS migrations first.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engineers') THEN
        RAISE EXCEPTION 'New engineers table does not exist! Run AIMS migrations first.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pid_reports') THEN
        RAISE EXCEPTION 'New pid_reports table does not exist! Run AIMS migrations first.';
    END IF;

    RAISE NOTICE 'All AIMS tables verified. Safe to proceed with cleanup.';
END $$;

-- ====================================
-- Step 11: Final cleanup and optimization
-- ====================================

-- Clean up any orphaned records
DELETE FROM public.reports
WHERE report_type IN ('EEG', 'QEEG', 'Brain Health', 'Wellness', 'Neurofeedback');

-- Vacuum analyze to reclaim space and update statistics
-- Note: This will run after COMMIT
-- VACUUM ANALYZE;

COMMIT;

-- ====================================
-- Post-migration verification queries
-- ====================================

-- Run these queries to verify the cleanup was successful:

-- Check remaining tables
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check for any remaining medical references in column names
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND (column_name ILIKE '%patient%'
--      OR column_name ILIKE '%clinic%'
--      OR column_name ILIKE '%medical%'
--      OR column_name ILIKE '%brain%'
--      OR column_name ILIKE '%wellness%'
--      OR column_name ILIKE '%qeeg%'
--      OR column_name ILIKE '%eeg%');

-- Check storage buckets
-- SELECT * FROM storage.buckets;

-- ====================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ====================================

-- If you need to rollback this migration:
-- 1. Restore from your database backup
-- 2. OR restore from the medical_backup schema if you created it
-- 3. Run the original medical system migrations

-- End of cleanup migration