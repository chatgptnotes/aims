# 🪣 Bucket बनाने का Quick Reference Card

Print करो और desk पर रखो! 📋

---

## 📦 Bucket Details

```
╔════════════════════════════════════════╗
║  BUCKET INFORMATION                    ║
╠════════════════════════════════════════╣
║  Name:        patient-reports          ║
║  Privacy:     Private 🔒               ║
║  Size Limit:  50MB (52428800 bytes)   ║
║  Formats:     .edf, .eeg, .bdf only   ║
║  Location:    Supabase Storage         ║
╚════════════════════════════════════════╝
```

---

## 🚀 3 Steps to Create

### Step 1: Create Bucket (5 min)
```
https://supabase.com
→ Login
→ Neuro360 project
→ Storage
→ [+ Create bucket]

Form:
  Name: patient-reports
  Public: ☐ NO
  Size: 52428800
  [Create]
```

### Step 2: Apply Security (3 min)
```
→ SQL Editor
→ New query
→ Paste: supabase/single-bucket-policies.sql
→ [Run]
→ ✅ Success
```

### Step 3: Verify (2 min)
```bash
npm run verify:storage
```

---

## ✅ Verification Checklist

```
☐ Bucket name: patient-reports
☐ Privacy: Private
☐ Size: 50MB
☐ Policies: 4 applied
☐ Script: ✅ passed
☐ Test: Upload success
```

---

## 📁 File Structure

```
patient-reports/
  └─ {clinic-id}/
      └─ {patient-id}/
          └─ 2025-01-15_file.edf
```

---

## 🆘 Quick Fixes

| Error | Fix |
|-------|-----|
| Bucket exists | Use existing one |
| Permission denied | Re-run SQL |
| Upload fails | Check F12 console |
| File too large | Max 50MB |
| Wrong format | Only .edf/.eeg/.bdf |

---

## 💻 Quick Commands

```bash
# Verify
npm run verify:storage

# Start app
npm run dev
```

---

## 🔗 Full Guide

📖 See: `CREATE_BUCKET_HINDI.md`

---

**Total Time: 10 minutes** ⏱️
