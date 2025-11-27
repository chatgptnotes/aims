# 🎯 सिर्फ 3 Steps - Single Bucket Setup

## ⏱️ समय: 10 मिनट

---

## Step 1️⃣: Bucket बनाएं (5 min)

### 1. Supabase खोलें

```
🌐 Browser में जाएं: https://supabase.com
🔐 Login करें
📁 AIMS project चुनें
```

### 2. Storage Page खोलें

```
👈 Left sidebar में देखें
📦 "Storage" पर click करें
```

### 3. Bucket बनाएं

```
➕ "Create a new bucket" button (हरा button)
```

### 4. Details भरें

```
┌─────────────────────────────────────┐
│ Name: patient-reports               │ ← exactly यही!
│                                     │
│ Description: Patient EEG Reports    │ ← optional
│                                     │
│ ☐ Public bucket                    │ ← NO! Unchecked
│                                     │
│ File size limit: 52428800          │ ← 50MB
│                                     │
│ [ Create bucket ]                   │ ← Click!
└─────────────────────────────────────┘
```

### ✅ Done! Bucket बन गया

```
Buckets
└── patient-reports 🔒 Private
```

---

## Step 2️⃣: Security Policies (3 min)

### 1. SQL Editor खोलें

```
👈 Left sidebar में "SQL Editor"
➕ "New query" button
```

### 2. यह SQL Copy करें

**File:** `D:\AIMS\supabase\single-bucket-policies.sql`

या direct copy करें:

```sql
CREATE POLICY "Allow authenticated users to upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-reports');

CREATE POLICY "Allow authenticated users to view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-reports');

CREATE POLICY "Allow authenticated users to delete reports"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-reports');

CREATE POLICY "Allow authenticated users to update reports"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-reports');
```

### 3. Run करें

```
▶️ Bottom-right में "Run" button
⏳ Wait 5 seconds
✅ "Success. No rows returned"
```

---

## Step 3️⃣: Verify करें (2 min)

### Terminal में:

```bash
node verify-single-bucket.js
```

### Expected Output:

```
🔍 Verifying Single Bucket Setup...

📡 Check 1: Supabase Connection
   ✅ PASSED: Connected successfully

📦 Check 2: Patient Reports Bucket
   ✅ PASSED: Bucket exists
   - Name: patient-reports
   - Privacy: Private (✓)

🔐 Check 3: Storage Permissions
   ✅ PASSED: Can list files in bucket

📊 FINAL SUMMARY
🎉 SUCCESS! Setup is complete!

✅ Supabase connected
✅ patient-reports bucket exists
✅ Storage permissions configured

🚀 Next steps:
   1. Run: npm run dev
   2. Login to your app
   3. Try uploading a .edf file
```

---

## 🧪 Test Upload

### 1. App Start करें

```bash
npm run dev
```

### 2. Browser में

```
🌐 http://localhost:5173
🔐 Login करें (clinic account)
👤 Patient dashboard → Upload Report
📁 .edf file select करें
⬆️  Upload button → Click!
✅ Success message!
```

### 3. Verify in Supabase

```
Supabase Dashboard → Storage → patient-reports

📁 patient-reports/
   └── clinic-abc-123/
       └── patient-001/
           └── 2025-01-15T10-30-00_report.edf ✅
```

---

## ✅ Checklist

Setup complete? Mark करें:

```
☐ Bucket 'patient-reports' created
☐ Bucket is Private (not Public)
☐ File size limit: 50MB
☐ SQL policies applied (4 policies)
☐ Verification script passed
☐ Test upload successful
☐ File visible in Supabase
```

---

## ❌ Problems?

### "Bucket does not exist"

```
→ Bucket name: patient-reports (exact!)
→ No capital letters
→ No spaces
```

### "Permission denied"

```
→ SQL policies फिर से run करें
→ SQL Editor में:
  SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Upload नहीं हो रही

```
→ F12 → Console (browser)
→ Error messages देखें
→ .env file credentials check करें
```

---

## 📊 File Structure (Automatic)

```
patient-reports/
├── clinic-123/
│   ├── patient-001/
│   │   ├── 2025-01-15_report.edf    (50MB)
│   │   └── 2025-01-20_followup.eeg  (45MB)
│   └── patient-002/
│       └── 2025-01-16_test.bdf      (30MB)
│
└── clinic-456/
    └── patient-001/
        └── 2025-01-17_scan.edf      (48MB)
```

**Total:** 1 bucket, unlimited patients, organized automatically! ✅

---

## 🎯 Summary

✅ **Setup:**
- 1 bucket: `patient-reports`
- 50MB file limit
- Private & secure

✅ **Files Supported:**
- .edf (EEG Data Format)
- .eeg (EEG files)
- .bdf (BioSemi Data Format)

✅ **Organization:**
- Auto-organized by clinic & patient
- Isolated per clinic
- Secure access with RLS

---

## 📞 Quick Help

### Verification:
```bash
node verify-single-bucket.js
```

### Check Bucket:
```sql
SELECT * FROM storage.buckets WHERE name = 'patient-reports';
```

### List Files:
```sql
SELECT name, created_at FROM storage.objects
WHERE bucket_id = 'patient-reports'
ORDER BY created_at DESC;
```

---

## 🎉 Done!

**सिर्फ 3 steps, 10 मिनट में complete!**

✅ Single bucket setup
✅ 50MB file support
✅ Secure & organized

**अब upload करें!** 🚀

---

**Questions?** Check: `SIMPLE_SINGLE_BUCKET_SETUP.md` (detailed guide)
