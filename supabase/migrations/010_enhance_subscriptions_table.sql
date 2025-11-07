-- Enhance subscriptions table to store Razorpay payment details
-- This adds fields needed for storing complete subscription and payment information

-- Add new columns to subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS package_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reports_allowed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production',
  ADD COLUMN IF NOT EXISTS plan_details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}';

-- Rename stripe_subscription_id to be more generic (optional, keeping for backward compatibility)
-- ALTER TABLE subscriptions RENAME COLUMN stripe_subscription_id TO provider_subscription_id;

-- Add index for faster payment_id lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_id ON subscriptions(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_name ON subscriptions(package_name);

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.package_name IS 'Name of the purchased package (e.g., "Basic Package", "Standard Package")';
COMMENT ON COLUMN subscriptions.payment_method IS 'Payment gateway used (razorpay, stripe, etc.)';
COMMENT ON COLUMN subscriptions.payment_id IS 'Payment ID from the payment gateway';
COMMENT ON COLUMN subscriptions.reports_allowed IS 'Number of reports included in this subscription purchase';
COMMENT ON COLUMN subscriptions.environment IS 'Payment environment (test, live, production)';
COMMENT ON COLUMN subscriptions.plan_details IS 'JSON object with plan info: {id, name, description, reportsIncluded, savings, features}';
COMMENT ON COLUMN subscriptions.subscription IS 'JSON object with subscription info: {purchaseDate, expiryDate, validityPeriod, isActive}';
COMMENT ON COLUMN subscriptions.payment_details IS 'JSON object with payment info: {gateway, method, environment, verified, transactionFee}';

-- Update existing records to have default values
UPDATE subscriptions
SET
  payment_method = COALESCE(payment_method, 'razorpay'),
  reports_allowed = COALESCE(reports_allowed, 0),
  environment = COALESCE(environment, 'production'),
  plan_details = COALESCE(plan_details, '{}'),
  subscription = COALESCE(subscription, '{}'),
  payment_details = COALESCE(payment_details, '{}')
WHERE plan_details IS NULL
   OR subscription IS NULL
   OR payment_details IS NULL;
