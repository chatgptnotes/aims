-- ============================================
-- SUPABASE STORAGE POLICIES FOR NEURO360
-- ============================================
-- Run these policies in Supabase SQL Editor
-- to set up proper access control for buckets
-- ============================================

-- ============================================
-- 1. PATIENT-REPORTS BUCKET POLICIES
-- ============================================

-- Allow clinics to upload files to their own patients' folders
CREATE POLICY "Clinics can upload patient reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow clinics to view their own patients' files
CREATE POLICY "Clinics can view their patient reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow clinics to delete their own patients' files
CREATE POLICY "Clinics can delete their patient reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow super admin to access all patient reports
CREATE POLICY "Super admin can access all patient reports"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'patient-reports'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- ============================================
-- 2. EEG-FILES BUCKET POLICIES
-- ============================================

-- Allow clinics to upload EEG files
CREATE POLICY "Clinics can upload EEG files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'eeg-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow clinics to view their EEG files
CREATE POLICY "Clinics can view their EEG files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'eeg-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow clinics to delete their EEG files
CREATE POLICY "Clinics can delete their EEG files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'eeg-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow super admin full access to EEG files
CREATE POLICY "Super admin can access all EEG files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'eeg-files'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- ============================================
-- 3. REPORTS BUCKET POLICIES
-- ============================================

-- Allow clinics to upload generated reports
CREATE POLICY "Clinics can upload generated reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow clinics to view their generated reports
CREATE POLICY "Clinics can view their generated reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow clinics to delete their generated reports
CREATE POLICY "Clinics can delete their generated reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow super admin full access to reports
CREATE POLICY "Super admin can access all reports"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'reports'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- ============================================
-- 4. CLINIC-LOGOS BUCKET POLICIES
-- ============================================

-- Allow clinics to upload their own logos
CREATE POLICY "Clinics can upload their logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clinic-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to view clinic logos (for branding)
CREATE POLICY "Anyone can view clinic logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'clinic-logos');

-- Allow clinics to update their own logos
CREATE POLICY "Clinics can update their logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clinic-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow clinics to delete their own logos
CREATE POLICY "Clinics can delete their logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'clinic-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- HELPER FUNCTION: Get folder name from path
-- ============================================
-- This function is built into Supabase, but here's how it works:
-- storage.foldername('clinic-id/patient-id/file.edf') returns ['clinic-id', 'patient-id']
-- (storage.foldername(name))[1] gets the first folder (clinic-id)
-- (storage.foldername(name))[2] gets the second folder (patient-id)

-- ============================================
-- FILE STRUCTURE ORGANIZATION
-- ============================================
--
-- patient-reports/
--   ├── {clinic_id}/
--   │   ├── {patient_id}/
--   │   │   ├── {timestamp}_report.edf
--   │   │   ├── {timestamp}_report.pdf
--   │   │   └── ...
--
-- eeg-files/
--   ├── {clinic_id}/
--   │   ├── {patient_id}/
--   │   │   ├── {session_id}_raw.edf
--   │   │   └── ...
--
-- reports/
--   ├── {clinic_id}/
--   │   ├── {patient_id}/
--   │   │   ├── {report_id}_analysis.pdf
--   │   │   ├── {report_id}_careplan.pdf
--   │   │   └── ...
--
-- clinic-logos/
--   ├── {clinic_id}/
--   │   ├── logo.png
--   │   └── branding.jpg
--
-- ============================================

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if buckets exist
SELECT * FROM storage.buckets;

-- Check policies for patient-reports bucket
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- List all files in a bucket (for testing)
-- SELECT * FROM storage.objects WHERE bucket_id = 'patient-reports';
