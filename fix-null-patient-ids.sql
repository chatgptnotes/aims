-- SQL script to check and fix reports with null patient_id
-- Run this in Supabase SQL Editor

-- First, let's see what we have
SELECT
  id,
  patient_id,
  clinic_id,
  file_name,
  file_path,
  report_data,
  created_at
FROM reports
ORDER BY created_at DESC;

-- Check for reports with null patient_id
SELECT
  id,
  patient_id,
  clinic_id,
  file_name,
  file_path,
  report_data->>'patientId' as patient_id_from_data,
  created_at
FROM reports
WHERE patient_id IS NULL
ORDER BY created_at DESC;

-- Fix reports by extracting patient_id from file_path
-- file_path format: reports/{clinicId}/{patientId}/{filename}
UPDATE reports
SET patient_id = SPLIT_PART(file_path, '/', 3)::uuid
WHERE patient_id IS NULL
  AND file_path LIKE 'reports/%/%/%'
  AND SPLIT_PART(file_path, '/', 3) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- OR if the patient_id is in report_data:
UPDATE reports
SET patient_id = (report_data->>'patientId')::uuid
WHERE patient_id IS NULL
  AND report_data->>'patientId' IS NOT NULL
  AND report_data->>'patientId' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
