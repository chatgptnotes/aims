# 🚀 Razorpay Limits - Quick Reference Card

## ⚡ Fast Start (15 minutes)

### 1. Apply Migration (5 min)
```
1. Go to: https://supabase.com/dashboard
2. Open SQL Editor
3. Copy: supabase/migrations/008_add_report_counter_trigger.sql
4. Paste & Run
```

### 2. Verify (2 min)
```sql
SELECT * FROM pg_trigger WHERE tgname = 'after_report_insert';
-- Expected: 1 row
```

### 3. Test (8 min)
```bash
npm run dev

# Test upload → Counter +1 ✓
# Test download → Counter +1 ✓
# Reach limit → Payment popup ✓
```

---

## 📋 Test Checklist

- [ ] Migration applied
- [ ] Trigger verified
- [ ] Upload increments counter
- [ ] Download increments counter
- [ ] Limit blocks upload/download
- [ ] Payment popup appears
- [ ] Trial expiry works

---

## 🧪 Test Scripts

```bash
# Run automated tests
npm run test:limits

# Start dev server
npm run dev

# Apply migration helper
npm run migrate:trigger
```

---

## 🔍 Verification Queries

### Check Trigger
```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'after_report_insert';
```

### Check Clinic Usage
```sql
SELECT name, reports_used, reports_allowed, subscription_status
FROM clinics;
```

### Test Counter
```sql
-- Get clinic ID
SELECT id, reports_used FROM clinics LIMIT 1;

-- Insert test report
INSERT INTO reports (clinic_id, patient_id, file_name, file_path, status)
VALUES ('YOUR_CLINIC_ID', (SELECT id FROM patients LIMIT 1), 'test.pdf', 'test', 'completed');

-- Verify increment
SELECT id, reports_used FROM clinics WHERE id = 'YOUR_CLINIC_ID';

-- Clean up
DELETE FROM reports WHERE file_name = 'test.pdf';
UPDATE clinics SET reports_used = reports_used - 1 WHERE id = 'YOUR_CLINIC_ID';
```

---

## 💳 Razorpay Packages

| Plan | Reports | Price | Features |
|------|---------|-------|----------|
| Trial | 5 | ₹1 | 30-day trial |
| Basic | 10 | ₹999 | Pay per month |
| Standard | 25 | ₹1999 | ⭐ Popular |
| Premium | 50 | ₹3499 | Best value |
| Enterprise | 100 | ₹5999 | Unlimited users |

---

## 🐛 Quick Troubleshoot

### Counter not incrementing?
```sql
-- Enable trigger
ALTER TABLE reports ENABLE TRIGGER after_report_insert;
```

### Trial not expiring?
```sql
-- Manual expiry check
SELECT * FROM check_and_update_expired_trials();
```

### Payment popup not showing?
```javascript
// Check browser console (F12)
// Look for: "Report limit reached"
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/components/clinic/UploadReportModal.jsx` | Upload limits |
| `src/components/clinic/ReportViewer.jsx` | Download limits |
| `src/services/databaseService.js` | Trial expiry |
| `supabase/migrations/008_add_report_counter_trigger.sql` | DB trigger |

---

## 🎯 How It Works

```
1. User uploads/downloads report
   ↓
2. checkReportLimit() runs
   ↓
3. Checks: Trial expired? → Block
   ↓
4. Checks: Quota reached? → Block
   ↓
5. If OK → Proceed
   ↓
6. After success → Counter +1
   ↓
7. UI updates → Show new usage
```

---

## 💡 Key Concepts

- **Shared Quota:** Uploads + downloads = same counter
- **Trial Expiry:** 30 days, auto-enforced
- **Database Trigger:** Ensures counter accuracy
- **Payment Flow:** Instant quota increase

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Project URL:** https://omyltmcesgbhnqmhrrvq.supabase.co
- **Dev Server:** http://localhost:5173

---

## 📞 Support

**Issue?** Check:
1. Browser console (F12)
2. Database trigger: `SELECT * FROM pg_trigger;`
3. Documentation: `STEP_BY_STEP_DEPLOYMENT.md`

---

## ✅ Deployment

```bash
# When ready
npm run build
git add .
git commit -m "feat: Add Razorpay upload/download limits"
git push origin main
```

---

**Quick Start:** Open `test-limits-ui.html` in browser for guided testing! 🎯
