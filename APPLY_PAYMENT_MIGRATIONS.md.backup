# Quick Start: Apply Payment Storage Migrations

## Overview
Follow these simple steps to enable payment data storage in your database.

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Login to your account
3. Select your NeuroSense360 project
4. Click on **SQL Editor** in the left sidebar

### Step 2: Run Migration 1 - Create payment_history Table

Copy and paste this entire SQL script into the SQL Editor:

**File:** `supabase/migrations/009_create_payment_history_table_fixed.sql`

```sql
-- Fixed: Create enhanced payment_history table for Razorpay transactions
-- Drop existing table if it exists (this will remove old structure)
DROP TABLE IF EXISTS payment_history CASCADE;

-- Create fresh payment_history table with complete structure
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id VARCHAR(255) NOT NULL UNIQUE,
  order_id VARCHAR(255),
  signature VARCHAR(512),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL,
  package_id VARCHAR(100),
  package_name VARCHAR(255),
  reports INTEGER DEFAULT 0,
  plan_details JSONB DEFAULT '{}',
  subscription JSONB DEFAULT '{}',
  payment_details JSONB DEFAULT '{}',
  provider VARCHAR(50) DEFAULT 'razorpay',
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_payment_history_payment_id ON payment_history(payment_id);
CREATE INDEX idx_payment_history_clinic_id ON payment_history(clinic_id);
CREATE INDEX idx_payment_history_status ON payment_history(status);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at DESC);
CREATE INDEX idx_payment_history_package_id ON payment_history(package_id);

-- Add updated_at trigger
CREATE TRIGGER update_payment_history_updated_at
  BEFORE UPDATE ON payment_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all operations
CREATE POLICY "Allow all operations on payment_history"
  ON payment_history FOR ALL USING (true);
```

✅ Click **Run** button

### Step 3: Run Migration 2 - Enhance subscriptions Table

Copy and paste this entire SQL script into the SQL Editor:

**File:** `supabase/migrations/010_enhance_subscriptions_table.sql`

```sql
-- Enhance subscriptions table to store Razorpay payment details
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS package_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reports_allowed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production',
  ADD COLUMN IF NOT EXISTS plan_details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_id ON subscriptions(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_name ON subscriptions(package_name);

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
```

✅ Click **Run** button

### Step 4: Verify Tables Were Created

Run this verification query:

```sql
-- Check payment_history table
SELECT COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_name = 'payment_history';

-- Check subscriptions enhancements
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND column_name IN ('package_name', 'payment_method', 'reports_allowed', 'plan_details');
```

**Expected Results:**
- First query should return `table_exists: 1`
- Second query should return 4 rows showing the new columns

### Step 5: Test the Implementation

1. Your development server should already be running at http://localhost:3001
2. Login as a clinic user
3. Go to the subscription/payment page
4. Make a test payment
5. Check if payment was saved:

```sql
SELECT * FROM payment_history ORDER BY created_at DESC LIMIT 5;
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

## Verification Checklist

- [ ] Migration 1 executed without errors
- [ ] Migration 2 executed without errors
- [ ] `payment_history` table exists
- [ ] `subscriptions` table has new columns
- [ ] Test payment saved successfully
- [ ] Clinic's `reports_allowed` incremented correctly

## What Happens After Payment

When a payment is successful:

1. ✅ **Payment Record Created** in `payment_history` table
   - Contains full transaction details
   - Includes package information
   - Stores subscription expiry dates

2. ✅ **Subscription Record Created** in `subscriptions` table
   - Links to payment via `payment_id`
   - Contains package details
   - Tracks reports allocation

3. ✅ **Clinic Updated**
   - `reports_allowed` increased by purchased amount
   - `subscription_status` set to 'active'
   - `last_payment_at` timestamp updated

## Troubleshooting

### Error: "relation payment_history does not exist"
**Solution:** Run Migration 1 again

### Error: "column package_name does not exist"
**Solution:** Run Migration 2 again

### Error: "function update_updated_at_column does not exist"
**Solution:** This function should exist from migration 004. If not, add:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Payment succeeds but not saved
**Check:**
1. Browser console for errors
2. Supabase logs for database errors
3. Network tab for failed API calls

## Next Steps

After successful migration:

1. ✅ Payment data is automatically saved
2. ✅ View payment history in admin panel
3. ✅ Track subscriptions and expirations
4. ✅ Generate revenue reports

## Support Files

- **Detailed Documentation:** `PAYMENT_STORAGE_IMPLEMENTATION.md`
- **Migration 1:** `supabase/migrations/009_create_payment_history_table.sql`
- **Migration 2:** `supabase/migrations/010_enhance_subscriptions_table.sql`

---

**Status:** Ready to deploy ✅
**Total Time:** ~5 minutes
**Difficulty:** Easy

Need help? Check `PAYMENT_STORAGE_IMPLEMENTATION.md` for detailed information.
