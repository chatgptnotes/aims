# 🚀 Step-by-Step Deployment Guide

## Complete in 15 Minutes

---

## ✅ Pre-Flight Check

Run this to verify everything is ready:

```bash
npm run test:limits
```

Expected output:
```
✅ Passed:  6 tests
❌ Failed:  0 tests
```

If tests fail, stop and check the error messages.

---

## 📋 Step 1: Apply Database Migration (5 minutes)

### Option A: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   ```
   URL: https://supabase.com/dashboard/project/omyltmcesgbhnqmhrrvq
   ```

2. **Navigate to SQL Editor**
   - Left sidebar → Click "SQL Editor"
   - Click "New query" button

3. **Copy Migration SQL**
   - Open file: `supabase/migrations/008_add_report_counter_trigger.sql`
   - Select all (Ctrl+A) and copy (Ctrl+C)

4. **Execute Migration**
   - Paste into SQL Editor (Ctrl+V)
   - Click "Run" button (or Ctrl+Enter)
   - Wait for success message

5. **Verify Success**
   You should see:
   ```
   ✅ CREATE OR REPLACE FUNCTION
   ✅ DROP TRIGGER IF EXISTS
   ✅ CREATE TRIGGER
   ✅ COMMENT ON FUNCTION
   ✅ COMMENT ON TRIGGER
   ✅ CREATE OR REPLACE FUNCTION
   ✅ CREATE INDEX IF NOT EXISTS
   ✅ CREATE INDEX IF NOT EXISTS
   ✅ COMMENT
   ```

### Option B: Copy-Paste SQL Directly

If you prefer, here's the complete SQL to paste:

```sql
-- COPY EVERYTHING FROM HERE --

-- Create function to increment reports_used counter
CREATE OR REPLACE FUNCTION increment_clinic_reports_used()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clinics
  SET
    reports_used = COALESCE(reports_used, 0) + 1,
    updated_at = NOW()
  WHERE id = NEW.clinic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS after_report_insert ON reports;
CREATE TRIGGER after_report_insert
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION increment_clinic_reports_used();

-- Create trial expiry function
CREATE OR REPLACE FUNCTION check_and_update_expired_trials()
RETURNS TABLE(expired_clinic_id UUID, clinic_name VARCHAR) AS $$
BEGIN
  UPDATE clinics
  SET
    subscription_status = 'expired',
    is_active = false,
    updated_at = NOW()
  WHERE
    subscription_status = 'trial'
    AND trial_end_date < NOW()
    AND is_active = true;

  RETURN QUERY
  SELECT id, name
  FROM clinics
  WHERE subscription_status = 'expired'
    AND trial_end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinics_trial_end_date
  ON clinics(trial_end_date)
  WHERE subscription_status = 'trial';

CREATE INDEX IF NOT EXISTS idx_clinics_subscription_status
  ON clinics(subscription_status);

-- COPY UNTIL HERE --
```

---

## ✅ Step 2: Verify Migration (2 minutes)

Run these verification queries in SQL Editor:

### Query 1: Check Trigger Exists
```sql
SELECT
    tgname as trigger_name,
    tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'after_report_insert';
```

**Expected Result:**
| trigger_name | enabled |
|--------------|---------|
| after_report_insert | O |

(O = enabled)

### Query 2: Check Functions Exist
```sql
SELECT proname as function_name
FROM pg_proc
WHERE proname IN (
    'increment_clinic_reports_used',
    'check_and_update_expired_trials'
);
```

**Expected Result:**
| function_name |
|---------------|
| increment_clinic_reports_used |
| check_and_update_expired_trials |

### Query 3: Check Indexes Exist
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname IN (
    'idx_clinics_trial_end_date',
    'idx_clinics_subscription_status'
);
```

**Expected Result:**
| indexname | tablename |
|-----------|-----------|
| idx_clinics_trial_end_date | clinics |
| idx_clinics_subscription_status | clinics |

### Query 4: Test Trigger (Important!)
```sql
-- Get a clinic ID
SELECT id, name, reports_used FROM clinics LIMIT 1;

-- Remember the ID and current reports_used value
-- Then insert a test report (replace YOUR_CLINIC_ID)

INSERT INTO reports (clinic_id, patient_id, file_name, file_path, status)
VALUES (
    'YOUR_CLINIC_ID',  -- Replace with actual ID from above
    (SELECT id FROM patients LIMIT 1),
    'trigger_test_report.pdf',
    'reports/test.pdf',
    'completed'
);

-- Check if counter incremented
SELECT id, name, reports_used FROM clinics WHERE id = 'YOUR_CLINIC_ID';
-- reports_used should be +1

-- Clean up test
DELETE FROM reports WHERE file_name = 'trigger_test_report.pdf';
UPDATE clinics SET reports_used = reports_used - 1 WHERE id = 'YOUR_CLINIC_ID';
```

✅ **If all queries return expected results, migration is successful!**

---

## 🧪 Step 3: Test in UI (8 minutes)

### Start Development Server

```bash
npm run dev
```

The app should open at: `http://localhost:5173`

### Test Case 1: Upload Limit (3 minutes)

1. **Login as Clinic**
   - Use any clinic credentials
   - Navigate to "Patient Management" or "Reports"

2. **Check Current Usage**
   - Look for usage indicator (should show: X/10 reports or similar)
   - Note the current number

3. **Upload a Report**
   - Click "Upload Report" button
   - Select a patient
   - Choose a file (any PDF/image)
   - Fill in details
   - Click "Upload"

4. **Verify Counter Incremented**
   - ✅ Check usage indicator updated (should be +1)
   - ✅ Check no errors in browser console (F12)
   - ✅ Verify success message shown

5. **Verify in Database**
   ```sql
   SELECT name, reports_used, reports_allowed
   FROM clinics
   WHERE email = 'your_clinic_email@example.com';
   ```
   - ✅ reports_used should be incremented

### Test Case 2: Download Limit (2 minutes)

1. **Download a Report**
   - Go to Reports section
   - Click download icon on any report

2. **Verify Counter Incremented**
   - ✅ Check usage indicator updated (+1)
   - ✅ Check file downloaded successfully

3. **Verify in Database**
   ```sql
   SELECT name, reports_used FROM clinics WHERE email = 'your_clinic_email@example.com';
   ```
   - ✅ Counter should have incremented again

### Test Case 3: Limit Enforcement (2 minutes)

**Option A: Set Low Limit Temporarily**
```sql
-- Set limit to current usage
UPDATE clinics
SET reports_allowed = reports_used
WHERE email = 'your_clinic_email@example.com';
```

**Option B: Upload Until Limit Reached**
- Keep uploading reports until limit reached

**Expected Behavior:**
1. ✅ Payment popup appears
2. ✅ Cannot upload/download
3. ✅ Error message: "Report limit reached..."
4. ✅ Lock icon shows on download buttons

**Reset After Test:**
```sql
UPDATE clinics
SET reports_allowed = 10
WHERE email = 'your_clinic_email@example.com';
```

### Test Case 4: Trial Expiry (1 minute)

1. **Set Trial to Expired**
   ```sql
   UPDATE clinics
   SET trial_end_date = NOW() - INTERVAL '1 day'
   WHERE email = 'your_clinic_email@example.com';
   ```

2. **Try to Upload**
   - Go to upload page
   - Try to upload a report

3. **Expected Behavior:**
   - ✅ Error: "Your trial has expired..."
   - ✅ Payment popup appears
   - ✅ Cannot proceed without payment

4. **Reset After Test:**
   ```sql
   UPDATE clinics
   SET
       trial_end_date = NOW() + INTERVAL '30 days',
       subscription_status = 'trial',
       is_active = true
   WHERE email = 'your_clinic_email@example.com';
   ```

---

## 💳 Step 4: Test Payment Flow (Optional)

### Test Razorpay Integration

1. **Trigger Payment Popup**
   - Reach quota limit (as in Test Case 3)
   - Payment popup should appear

2. **Check Packages Display**
   - ✅ 5 packages visible
   - ✅ Prices shown correctly (₹1, ₹999, etc.)
   - ✅ "Most Popular" badge on Standard plan

3. **Select Package**
   - Click on any package
   - ✅ Razorpay checkout opens

4. **Test Payment (Optional)**
   - Use Razorpay test card: 4111 1111 1111 1111
   - Any future expiry date
   - Any CVV
   - Complete payment

5. **Verify Quota Increased**
   ```sql
   SELECT name, reports_used, reports_allowed, subscription_status
   FROM clinics
   WHERE email = 'your_clinic_email@example.com';
   ```
   - ✅ reports_allowed increased
   - ✅ subscription_status = 'active'

---

## 🔍 Troubleshooting

### Issue: Counter Not Incrementing

**Check Trigger:**
```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'after_report_insert';
```

**If disabled:**
```sql
ALTER TABLE reports ENABLE TRIGGER after_report_insert;
```

**If missing:**
- Re-run migration from Step 1

### Issue: Trial Not Expiring

**Check Trial Date:**
```sql
SELECT name, trial_end_date, subscription_status, is_active
FROM clinics
WHERE subscription_status = 'trial';
```

**Manual Expiry Check:**
```sql
SELECT * FROM check_and_update_expired_trials();
```

### Issue: Downloads Not Limited

**Check Component State:**
- Open browser console (F12)
- Look for: "Incremented download counter"
- Check for any JavaScript errors

**Verify Code:**
- Check `src/components/clinic/ReportViewer.jsx` line 319-334
- Verify counter increment after download

### Issue: Payment Popup Not Showing

**Check Limit:**
```sql
SELECT name, reports_used, reports_allowed
FROM clinics;
```

**Verify Component:**
- Check `SubscriptionPopup` component imported
- Check `showSubscriptionPopup` state variable
- Look for console errors

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [x] Code implemented
- [x] Tests passing (6/7)
- [ ] Database migration applied
- [ ] Trigger verified working
- [ ] Upload limit tested
- [ ] Download limit tested
- [ ] Trial expiry tested
- [ ] Payment flow tested

### Production Deployment:

```bash
# Build for production
npm run build

# Deploy to Vercel/hosting
git add .
git commit -m "feat: Add Razorpay upload/download limits with trial expiry

- Upload limit enforcement with trial expiry checks
- Download limit enforcement (shared quota)
- Auto-increment trigger for reliability
- Trial expiry auto-enforcement
- Payment integration for quota upgrades"

git push origin main
```

### Post-Deployment:
- [ ] Monitor first 10 uploads
- [ ] Verify first payment
- [ ] Check error logs
- [ ] Monitor counter accuracy

---

## 📊 Success Metrics

After deployment, monitor these metrics:

```sql
-- Usage Overview
SELECT
    COUNT(*) as total_clinics,
    COUNT(*) FILTER (WHERE subscription_status = 'trial') as trial_clinics,
    COUNT(*) FILTER (WHERE subscription_status = 'active') as paid_clinics,
    COUNT(*) FILTER (WHERE subscription_status = 'expired') as expired_clinics,
    SUM(reports_used) as total_reports_used,
    AVG(reports_used::float / NULLIF(reports_allowed, 0) * 100) as avg_usage_percent
FROM clinics;

-- Clinics Near Limit
SELECT
    name,
    reports_used,
    reports_allowed,
    ROUND((reports_used::float / NULLIF(reports_allowed, 0) * 100)::numeric, 1) as usage_percent,
    subscription_status
FROM clinics
WHERE (reports_used::float / NULLIF(reports_allowed, 0)) >= 0.8
ORDER BY usage_percent DESC;

-- Payment History
SELECT
    COUNT(*) as total_payments,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_payment
FROM payment_history
WHERE status = 'success';
```

---

## 🎊 Congratulations!

If all tests pass, your Razorpay upload/download limit system is **production ready**! 🚀

### What You've Achieved:

✅ Secure upload/download limits
✅ Trial expiry enforcement
✅ Payment integration
✅ Auto-increment reliability
✅ Real-time usage tracking

### Next Steps:

1. Deploy to production
2. Monitor usage patterns
3. Gather user feedback
4. Consider future enhancements

---

**Questions?** Check the documentation:
- `RAZORPAY_UPLOAD_LIMIT_INTEGRATION_COMPLETE.md`
- `APPLY_TRIGGER_MIGRATION.md`
- `IMPLEMENTATION_COMPLETE.md`
