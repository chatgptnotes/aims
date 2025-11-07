-- Migration: Add automatic report counter increment trigger
-- This ensures reports_used is always incremented when a report is created
-- Provides reliability even if frontend logic fails

-- Create function to increment reports_used counter
CREATE OR REPLACE FUNCTION increment_clinic_reports_used()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment reports_used for the clinic
  UPDATE clinics
  SET
    reports_used = COALESCE(reports_used, 0) + 1,
    updated_at = NOW()
  WHERE id = NEW.clinic_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment counter on report insert
DROP TRIGGER IF EXISTS after_report_insert ON reports;

CREATE TRIGGER after_report_insert
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION increment_clinic_reports_used();

-- Add comment for documentation
COMMENT ON FUNCTION increment_clinic_reports_used() IS
  'Automatically increments the reports_used counter for a clinic when a new report is inserted';

COMMENT ON TRIGGER after_report_insert ON reports IS
  'Ensures reports_used counter is always accurate by incrementing on every report insert';

-- Create function to check trial expiry (can be called periodically)
CREATE OR REPLACE FUNCTION check_and_update_expired_trials()
RETURNS TABLE(expired_clinic_id UUID, clinic_name VARCHAR) AS $$
BEGIN
  -- Update all expired trial clinics
  UPDATE clinics
  SET
    subscription_status = 'expired',
    is_active = false,
    updated_at = NOW()
  WHERE
    subscription_status = 'trial'
    AND trial_end_date < NOW()
    AND is_active = true;

  -- Return list of expired clinics
  RETURN QUERY
  SELECT id, name
  FROM clinics
  WHERE subscription_status = 'expired'
    AND trial_end_date < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_and_update_expired_trials() IS
  'Checks for expired trials and automatically disables them. Can be run as a scheduled job.';

-- Optional: Create index to speed up trial expiry checks
CREATE INDEX IF NOT EXISTS idx_clinics_trial_end_date
  ON clinics(trial_end_date)
  WHERE subscription_status = 'trial';

CREATE INDEX IF NOT EXISTS idx_clinics_subscription_status
  ON clinics(subscription_status);

COMMENT ON INDEX idx_clinics_trial_end_date IS
  'Optimizes trial expiry checks by indexing trial_end_date for trial subscriptions';
