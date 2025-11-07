-- Add password column to clinics table for authentication
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN clinics.password IS 'Hashed password for clinic login authentication';
