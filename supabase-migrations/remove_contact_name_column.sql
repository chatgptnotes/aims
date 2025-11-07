-- Remove the contact_name column from clinics table
-- We will use the existing contact_person column instead

ALTER TABLE clinics
DROP COLUMN IF EXISTS contact_name;

-- Add comment to contact_person for clarity
COMMENT ON COLUMN clinics.contact_person IS 'Name of the primary contact person (e.g., B K Murali)';
