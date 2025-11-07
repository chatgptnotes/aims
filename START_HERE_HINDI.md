# 🚀 यहाँ से शुरू करें - Supabase Storage Setup

## ✅ क्या है?

**एक bucket** में 50MB तक की EEG/qEEG files (.edf, .eeg, .bdf) store करने के लिए setup

---

## ⏱️ समय: 10 मिनट

---

## 📝 3 आसान Steps

### Step 1: Bucket बनाएं

```
1. https://supabase.com खोलें
2. Login → Neuro360 project
3. Storage → Create bucket
4. Name: patient-reports
5. Private: ✓ YES
6. Size: 52428800 (50MB)
7. Create!
```

### Step 2: Security Apply करें

```
1. SQL Editor खोलें
2. File खोलें: supabase/single-bucket-policies.sql
3. Copy-Paste करें
4. Run करें
```

### Step 3: Verify करें

```bash
npm run verify:storage
```

---

## ✅ Done!

अब upload करें:

```bash
npm run dev
```

Browser → Login → Upload Report → .edf file select → Upload!

---

## 📁 Files Kahan Store Hongi?

```
patient-reports/
└── {your-clinic-id}/
    └── {patient-id}/
        └── 2025-01-15_report.edf
```

Automatic organization! ✅

---

## 📚 Detailed Guides

| File | Purpose |
|------|---------|
| `BUCKET_SETUP_3_STEPS.md` | Quick visual guide |
| `SIMPLE_SINGLE_BUCKET_SETUP.md` | Complete detailed guide |
| `supabase/single-bucket-policies.sql` | SQL policies |

---

## 🆘 Problems?

### Bucket नहीं बन रहा?
→ Name exactly `patient-reports` होना चाहिए

### Permission error?
→ SQL policies फिर से run करें

### Upload नहीं हो रही?
→ Browser console (F12) check करें

---

## 🎯 Commands

```bash
# Verify setup
npm run verify:storage

# Start app
npm run dev

# Check files (SQL Editor में)
SELECT * FROM storage.objects WHERE bucket_id = 'patient-reports';
```

---

## ✅ Checklist

Setup complete?

- [ ] Bucket created: patient-reports
- [ ] Bucket is Private
- [ ] SQL policies applied
- [ ] Verification passed
- [ ] Test upload successful

---

## 🎉 Summary

**1 bucket** = `patient-reports`
**File size** = 50MB max
**Formats** = .edf, .eeg, .bdf
**Organization** = Automatic (clinic → patient)
**Security** = Private + RLS policies

---

**सब ready है! अब upload करो!** 🚀

**Questions?** → Check `SIMPLE_SINGLE_BUCKET_SETUP.md`
