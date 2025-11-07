# ⚡ Supabase Storage - Quick Start Guide (हिंदी)

## 🎯 एक नज़र में क्या करें

### ✅ Already Done (पहले से हो चुका है)
- ✅ Code Supabase Storage use कर रहा है
- ✅ AWS S3 references remove हो गए
- ✅ Files clinic/patient structure में organize होंगी
- ✅ Security policies ready हैं

### 🚀 आपको सिर्फ ये करना है:

1. **Supabase में 4 buckets बनाएं** (10 min)
2. **SQL policies apply करें** (5 min)
3. **Test upload करें** (5 min)

---

## 📦 Buckets बनाने का Short Guide

### Supabase Dashboard → Storage → Create bucket

**4 Buckets:**

```
1. patient-reports  (Private, 50MB)
2. eeg-files       (Private, 50MB)
3. reports         (Private, 50MB)
4. clinic-logos    (Public, 5MB)
```

**How to create:**
- Name type करें (exact spelling!)
- Public: NO (सिर्फ clinic-logos के लिए YES)
- Create पर click करें

---

## 🔐 Policies Apply करना

### Supabase Dashboard → SQL Editor → New Query

**Copy-Paste करें:** `D:\Neuro360\supabase\storage-policies.sql`

**Run करें!**

---

## ✅ Verify करना

### Terminal में run करें:

```bash
node verify-storage-setup.js
```

**Expected Output:**
```
✅ Connected to Supabase Storage
✅ All required buckets exist
✅ Storage permissions working
```

---

## 🧪 Test Upload

1. `npm run dev` - App start करें
2. Login करें (clinic account)
3. Patient dashboard → Upload Report
4. .edf file select करें
5. Upload करें!

---

## 📁 File Structure (Automatic)

```
patient-reports/
├── {clinic-id}/
│   └── {patient-id}/
│       └── 2025-01-15T10-30-00_file.edf
```

**Metadata हमेशा pass करें:**
```javascript
StorageService.uploadFile(file, 'test.edf', {
  clinicId: 'clinic-123',
  patientId: 'patient-456'
});
```

---

## ❌ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Bucket does not exist" | Bucket name spelling check करें |
| "Permission denied" | SQL policies apply करें |
| "File too large" | Max 50MB allowed है |
| "Invalid format" | Only .edf, .eeg, .bdf allowed |

---

## 🆘 Help Commands

```bash
# Setup verify करें
node verify-storage-setup.js

# App start करें
npm run dev

# Logs देखें
F12 → Console (browser में)
```

```sql
-- Buckets check करें
SELECT * FROM storage.buckets;

-- Policies check करें
SELECT * FROM pg_policies WHERE schemaname = 'storage';

-- Files list करें
SELECT * FROM storage.objects WHERE bucket_id = 'patient-reports';
```

---

## 📄 Documentation Files

| File | Purpose |
|------|---------|
| `SUPABASE_STORAGE_SETUP_COMPLETE.md` | Complete detailed guide |
| `HINDI_SETUP_INSTRUCTIONS.md` | Step-by-step Hindi guide |
| `storage-policies.sql` | SQL policies script |
| `verify-storage-setup.js` | Verification script |
| **This file** | Quick reference |

---

## 🎯 Next Steps After Setup

1. ✅ Production deploy करें
2. ✅ Regular backups enable करें
3. ✅ Storage usage monitor करें

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Storage Docs:** https://supabase.com/docs/guides/storage
- **Project Settings:** Dashboard → Settings → API

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Create buckets | 10 min |
| Apply policies | 5 min |
| Test upload | 5 min |
| **TOTAL** | **~20 min** |

---

## 💡 Pro Tips

1. **Bucket names:** Case-sensitive हैं, exact spelling use करें
2. **Metadata:** हमेशा clinicId और patientId pass करें
3. **Testing:** Test upload से पहले verification script run करें
4. **Debugging:** Browser console always check करें (F12)
5. **Backup:** Production में deploy से पहले test environment में try करें

---

## ✅ Final Checklist

- [ ] 4 buckets created
- [ ] SQL policies applied
- [ ] Verification script passed
- [ ] Test upload successful
- [ ] File visible in correct folder
- [ ] Ready for production! 🚀

---

**बस इतना ही!** अब आप Supabase Storage use करने के लिए ready हैं! 🎉
