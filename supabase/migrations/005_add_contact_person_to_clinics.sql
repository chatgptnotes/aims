-- Add contact_person column to clinics table
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN clinics.contact_person IS 'Name of the primary contact person for the clinic';
