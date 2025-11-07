# Database Migration Instructions - Report Counter Trigger

## Step 1: Apply the Trigger Migration

Since Supabase doesn't allow programmatic DDL execution via the client library, you need to apply the migration manually:

### Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Navigate to your project: `omyltmcesgbhnqmhrrvq`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Copy Migration SQL**
   - Open file: `supabase/migrations/008_add_report_counter_trigger.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)

4. **Paste and Execute**
   - Paste into the SQL Editor
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for "Success" message

5. **Verify Execution**
   - You should see messages like:
     ```
     CREATE FUNCTION
     DROP TRIGGER
     CREATE TRIGGER
     COMMENT
     CREATE INDEX
     ```
   - All should show "Success" status

## Step 2: Verify Migration Applied

Run this query in SQL Editor to verify:

```sql
-- Check if trigger exists
SELECT
    tgname as trigger_name,
    tgtype,
    tgenabled
FROM pg_trigger
WHERE tgname = 'after_report_insert';

-- Check if function exists
SELECT
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('increment_clinic_reports_used', 'check_and_update_expired_trials');

-- Check if indexes exist
SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE indexname IN ('idx_clinics_trial_end_date', 'idx_clinics_subscription_status');
```

**Expected Results:**
- 1 trigger: `after_report_insert`
- 2 functions: `increment_clinic_reports_used`, `check_and_update_expired_trials`
- 2 indexes: `idx_clinics_trial_end_date`, `idx_clinics_subscription_status`

## Step 3: Test the Implementation

### Quick Test via SQL
```sql
-- 1. Check current counter for a clinic
SELECT id, name, reports_used, reports_allowed
FROM clinics
LIMIT 1;

-- Note the clinic_id and current reports_used value

-- 2. Insert a test report (replace with actual IDs from step 1)
INSERT INTO reports (clinic_id, patient_id, file_name, file_path, status)
VALUES (
  'YOUR_CLINIC_ID_HERE',  -- Replace with actual ID
  (SELECT id FROM patients LIMIT 1),  -- Use any patient ID
  'test_trigger_report.pdf',
  'reports/test_trigger.pdf',
  'completed'
);

-- 3. Check counter incremented automatically
SELECT id, name, reports_used, reports_allowed
FROM clinics
WHERE id = 'YOUR_CLINIC_ID_HERE';
-- reports_used should be +1 from previous value

-- 4. Clean up test
DELETE FROM reports WHERE file_name = 'test_trigger_report.pdf';
UPDATE clinics SET reports_used = reports_used - 1 WHERE id = 'YOUR_CLINIC_ID_HERE';
```

### UI Testing

Run the application:

```bash
npm run dev
```

**Test Cases:**

1. **Upload Test:**
   - Login as a clinic user
   - Upload a report
   - Check reports_used incremented in database
   - Verify UI shows updated counter

2. **Download Test:**
   - Download a report
   - Check reports_used incremented
   - Verify UI shows updated counter

3. **Limit Enforcement:**
   - Upload/download until reports_used >= reports_allowed
   - Verify payment popup appears
   - Cannot proceed without payment

4. **Trial Expiry:**
   ```sql
   -- Set trial to expired
   UPDATE clinics
   SET trial_end_date = NOW() - INTERVAL '1 day'
   WHERE id = 'YOUR_CLINIC_ID';
   ```
   - Try to upload/download
   - Verify "trial expired" message

## Troubleshooting

### Trigger not firing?
```sql
-- Check trigger status
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'after_report_insert';

-- Enable if disabled
ALTER TABLE reports ENABLE TRIGGER after_report_insert;
```

### Counter not incrementing?
```sql
-- Manually test the function
SELECT increment_clinic_reports_used();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'clinics';
```

## Rollback (if needed)

```sql
DROP TRIGGER IF EXISTS after_report_insert ON reports;
DROP FUNCTION IF EXISTS increment_clinic_reports_used();
DROP FUNCTION IF EXISTS check_and_update_expired_trials();
DROP INDEX IF EXISTS idx_clinics_trial_end_date;
DROP INDEX IF EXISTS idx_clinics_subscription_status;
```

---

**Ready?** Once migration is applied, the system is production-ready! 🚀
