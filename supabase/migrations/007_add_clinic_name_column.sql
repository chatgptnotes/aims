-- Add clinic_name column to clinics table
-- This is separate from the 'name' column which stores the contact person name
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN clinics.clinic_name IS 'Official name of the clinic/hospital';

-- Optionally, copy existing 'name' values to 'clinic_name' if needed
-- UPDATE clinics SET clinic_name = name WHERE clinic_name IS NULL;
