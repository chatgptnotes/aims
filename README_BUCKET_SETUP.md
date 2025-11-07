# 🎯 Supabase Storage Bucket - Complete Setup Guide

## 📌 Overview

यह guide आपको दिखाएगा कि **Supabase में storage bucket** कैसे बनाएं और project से कैसे connect करें।

---

## 🎯 What You're Creating

**एक secure storage bucket** जो:
- ✅ 50MB तक की files store करे
- ✅ Only .edf, .eeg, .bdf formats accept करे
- ✅ Project से automatically connected हो
- ✅ Clinic और patient के according organized हो
- ✅ Private और secure हो

---

## ⏱️ Time Required

| Task | Time |
|------|------|
| Create bucket | 5 min |
| Apply security | 3 min |
| Verify setup | 2 min |
| **Total** | **10 min** |

---

## 📚 Documentation Files

मैंने आपके लिए ये guides बनाई हैं:

| File | Purpose | When to Use |
|------|---------|-------------|
| **`CREATE_BUCKET_HINDI.md`** | 📖 Complete step-by-step guide | पहली बार setup कर रहे हो |
| `START_HERE_HINDI.md` | 🚀 Quick start guide | तुरंत शुरू करना है |
| `BUCKET_SETUP_3_STEPS.md` | 📋 Visual 3-step guide | आसान steps चाहिए |
| `BUCKET_QUICK_REFERENCE.md` | 📄 Quick reference card | Print करके रखो |
| `SIMPLE_SINGLE_BUCKET_SETUP.md` | 📘 Detailed technical guide | सब details चाहिए |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Bucket
```
1. https://supabase.com → Login
2. Neuro360 project खोलें
3. Storage → Create bucket
4. Name: patient-reports
5. Private: ✓, Size: 52428800
6. Create!
```

### Step 2: Apply Security
```
1. SQL Editor खोलें
2. File: supabase/single-bucket-policies.sql
3. Copy → Paste → Run
```

### Step 3: Verify
```bash
npm run verify:storage
```

**✅ All checks pass? Done!**

---

## 📦 Bucket Configuration

```yaml
Bucket Name: patient-reports
Privacy: Private
File Size Limit: 50 MB (52,428,800 bytes)
Allowed Formats: .edf, .eeg, .bdf
Organization: {clinic-id}/{patient-id}/{filename}
Security: RLS Policies (4 policies)
Connection: Automatic via storageService.js
```

---

## 🔐 Security Features

### RLS Policies Applied:
1. **INSERT:** Authenticated users can upload
2. **SELECT:** Authenticated users can view
3. **DELETE:** Authenticated users can delete
4. **UPDATE:** Authenticated users can update

### File Validation (Automatic):
- ✅ Format check: Only .edf, .eeg, .bdf
- ✅ Size check: Max 50MB
- ✅ Extension validation
- ✅ MIME type handling

### Data Isolation:
- ✅ Each clinic has separate folder
- ✅ Patients organized under clinic
- ✅ No cross-clinic access
- ✅ Super admin can access all

---

## 📁 File Organization

Files automatically organize in this structure:

```
patient-reports/
├── clinic-abc-123/              (Clinic 1)
│   ├── patient-001/            (Patient 1 की files)
│   │   ├── 2025-01-15T10-30-00_baseline.edf    (50MB)
│   │   ├── 2025-01-20T14-15-00_followup.eeg    (45MB)
│   │   └── 2025-01-25T09-00-00_assessment.bdf  (40MB)
│   │
│   ├── patient-002/            (Patient 2 की files)
│   │   ├── 2025-01-16T11-00-00_initial.edf     (48MB)
│   │   └── 2025-01-22T15-30-00_progress.eeg    (42MB)
│   │
│   └── patient-003/            (Patient 3 की files)
│       └── 2025-01-18T13-45-00_screening.bdf   (35MB)
│
├── clinic-xyz-456/              (Clinic 2 - Completely Isolated)
│   ├── patient-001/            (Different patient, same ID)
│   │   └── 2025-01-17T10-00-00_test.edf        (46MB)
│   │
│   └── patient-004/
│       └── 2025-01-19T12-15-00_scan.eeg        (38MB)
│
└── clinic-def-789/              (Clinic 3 - Completely Isolated)
    └── patient-005/
        └── 2025-01-20T16-30-00_data.bdf        (44MB)
```

**Key Points:**
- 🔒 Each clinic's data is completely isolated
- 📁 Automatic folder creation (clinic-id → patient-id)
- 🕐 Timestamp added to filenames (unique names)
- 📊 Easy to navigate and manage

---

## 🔧 Project Connection

### Already Connected! ✅

Bucket automatically connected via:

**File:** `src/services/storageService.js`

```javascript
class StorageService {
  constructor() {
    this.reportsBucket = 'patient-reports';  // ← Bucket name
  }

  async uploadFile(file, fileName, metadata = {}) {
    // Validates format (.edf, .eeg, .bdf)
    this.validateFile(file);

    // Checks 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File exceeds 50MB');
    }

    // Organizes by clinic/patient
    const filePath = `${clinicId}/${patientId}/${fileName}`;

    // Uploads to bucket
    await supabase.storage
      .from('patient-reports')  // ← Bucket connection
      .upload(filePath, file);
  }

  validateFile(file) {
    // Only allow .edf, .eeg, .bdf
    const validExtensions = ['.edf', '.eeg', '.bdf'];
    if (!validExtensions.some(ext => file.name.endsWith(ext))) {
      throw new Error('Invalid format! Only .edf, .eeg, .bdf allowed');
    }
  }
}
```

**No configuration needed! Works automatically!** 🎉

---

## 🧪 Testing

### Test 1: Verify Setup
```bash
npm run verify:storage
```

**Expected:**
```
✅ Supabase connected
✅ patient-reports bucket exists
✅ Storage permissions configured
🎉 SUCCESS!
```

### Test 2: Upload File
```bash
npm run dev
```

1. Login → Patient Dashboard
2. Upload Report → Select .edf file
3. Upload → ✅ Success!
4. Check Supabase → File visible!

### Test 3: Check File Location
```sql
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'patient-reports'
ORDER BY created_at DESC
LIMIT 5;
```

---

## ❌ Troubleshooting

### Problem: "Bucket does not exist"

**Cause:** Bucket not created or wrong name

**Fix:**
1. Check bucket name: `patient-reports` (exact spelling)
2. Go to Supabase → Storage
3. Verify bucket exists
4. If not, create it (Step 1)

---

### Problem: "Permission denied"

**Cause:** RLS policies not applied

**Fix:**
1. Go to SQL Editor
2. Run: `supabase/single-bucket-policies.sql`
3. Verify:
   ```sql
   SELECT COUNT(*) FROM pg_policies
   WHERE tablename = 'objects' AND schemaname = 'storage';
   ```
4. Should return: 4

---

### Problem: "File too large"

**Cause:** File > 50MB

**Fix:**
1. Check file size:
   ```bash
   # Windows
   dir /s filename.edf

   # Get size in MB
   ```
2. Compress file या
3. Increase bucket limit:
   - Supabase → Storage → patient-reports → Edit
   - File size limit: 104857600 (100MB)

---

### Problem: "Invalid file format"

**Cause:** File extension not .edf, .eeg, .bdf

**Fix:**
1. Check file extension
2. Rename file:
   ```
   ✅ report.edf
   ✅ data.eeg
   ✅ scan.bdf
   ❌ report.pdf
   ❌ data.csv
   ```

---

### Problem: Upload button not working

**Cause:** Frontend issue or .env misconfiguration

**Fix:**
1. Press F12 → Console
2. Check for red errors
3. Verify .env file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart app: `npm run dev`

---

## 📊 Storage Limits

### Supabase Free Tier:

| Resource | Limit |
|----------|-------|
| **Storage** | 1 GB total |
| **File size** | 50 MB per file |
| **Bandwidth** | 2 GB/month |
| **Files** | Unlimited |

### Calculations:

**50MB files:**
- 1 GB = ~20 files (50MB each)
- 100 files = need 5GB (paid plan)

**Paid Plans:**
- Pro: 100 GB ($25/month)
- Team: 100 GB + more features
- Enterprise: Custom

---

## 💻 Useful Commands

### Verification:
```bash
# Check bucket setup
npm run verify:storage

# Start application
npm run dev

# Build for production
npm run build
```

### SQL Queries:
```sql
-- List all buckets
SELECT * FROM storage.buckets;

-- List files in bucket
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'patient-reports'
ORDER BY created_at DESC;

-- Check policies
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Count files per clinic
SELECT
  (metadata->>'clinicId') as clinic,
  COUNT(*) as file_count
FROM storage.objects
WHERE bucket_id = 'patient-reports'
GROUP BY clinic;

-- Check storage usage
SELECT
  bucket_id,
  COUNT(*) as files,
  SUM((metadata->>'size')::bigint) as total_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_mb
FROM storage.objects
GROUP BY bucket_id;
```

---

## 🎯 Success Criteria

Setup successful अगर:

✅ **Bucket Created:**
- [ ] Name: `patient-reports`
- [ ] Privacy: Private
- [ ] Size limit: 50MB

✅ **Security Applied:**
- [ ] 4 RLS policies active
- [ ] Only authenticated access
- [ ] Clinic isolation working

✅ **Project Connected:**
- [ ] storageService.js configured
- [ ] File validation working
- [ ] Upload/download working

✅ **Testing Passed:**
- [ ] Verification script ✅
- [ ] Test upload successful
- [ ] File visible in Supabase
- [ ] Proper organization

---

## 📞 Support & Resources

### Documentation:
- 📖 Full guide: `CREATE_BUCKET_HINDI.md`
- 🚀 Quick start: `START_HERE_HINDI.md`
- 📋 Visual guide: `BUCKET_SETUP_3_STEPS.md`
- 📄 Quick ref: `BUCKET_QUICK_REFERENCE.md`

### SQL Scripts:
- 🔐 Policies: `supabase/single-bucket-policies.sql`
- ✅ Verification: `verify-single-bucket.js`

### Code Files:
- 📦 Storage service: `src/services/storageService.js`
- ⚙️ Config: `.env.example`

### External Links:
- Supabase Dashboard: https://supabase.com/dashboard
- Storage Docs: https://supabase.com/docs/guides/storage
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

## 🎉 Conclusion

**Setup Complete!** 🚀

अब आप:
- ✅ 50MB तक की EEG/qEEG files upload कर सकते हैं
- ✅ Secure private storage use कर रहे हैं
- ✅ Automatic file organization है
- ✅ Clinic-wise data isolation है
- ✅ Project से fully connected है

**Happy uploading!** 🎊

---

## 📝 Next Steps

1. **Production Deploy:**
   - Production Supabase project में same bucket बनाएं
   - Environment variables update करें
   - Deploy!

2. **Monitoring:**
   - Storage usage track करें
   - File upload logs देखें
   - Performance monitor करें

3. **Scaling:**
   - Usage बढ़े तो paid plan consider करें
   - Backup strategy implement करें
   - CDN for faster access

---

**Questions? Check the detailed guides या console logs देखो!** 💪
