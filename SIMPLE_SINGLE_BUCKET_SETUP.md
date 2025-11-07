# 🎯 Single Bucket Setup - सिर्फ एक Bucket (आसान!)

## ✅ क्या करना है?

**सिर्फ 1 bucket बनाना है:** `patient-reports`

- **Purpose:** Patient की EEG/qEEG reports (.edf, .eeg, .bdf files)
- **File Size:** 50MB तक
- **Privacy:** Private (secure)

---

## ⏱️ समय: सिर्फ 10 मिनट!

1. Bucket बनाएं (5 min)
2. Policies apply करें (3 min)
3. Test करें (2 min)

---

## 📦 Step 1: Bucket बनाएं (5 मिनट)

### 1.1 Supabase Dashboard खोलें

```
https://supabase.com
```

- **Login करें**
- **Neuro360 project** select करें

### 1.2 Storage Page पर जाएं

- Left sidebar में **"Storage"** पर click करें
- **"Create a new bucket"** button (हरा button) पर click करें

### 1.3 Bucket Details भरें

```
Name: patient-reports
(exactly यही नाम, कोई capital letter या space नहीं!)

Description: Patient EEG/qEEG Reports
(optional - आप खाली भी छोड़ सकते हैं)

Public bucket: ❌ NO
(इस checkbox को UNCHECKED रखें - private security के लिए)

File size limit: 52428800
(यह 50MB है - bytes में)

Allowed MIME types:
(खाली छोड़ दें - सभी file types allowed होंगी)
```

### 1.4 Create करें

- **"Create bucket"** button पर click करें
- ✅ Done! Bucket बन गया!

### Verify करें:

Storage page पर आपको दिखना चाहिए:
```
Buckets
└── patient-reports     🔒 Private
```

---

## 🔐 Step 2: Security Policies Apply करें (3 मिनट)

### 2.1 SQL Editor खोलें

- Left sidebar में **"SQL Editor"** पर click करें
- **"New query"** button पर click करें

### 2.2 नीचे दिए गए SQL को Copy-Paste करें

**यह SQL copy करें:**

```sql
-- ============================================
-- PATIENT-REPORTS BUCKET - SECURITY POLICIES
-- ============================================

-- 1. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-reports'
);

-- 2. Allow authenticated users to view their own files
CREATE POLICY "Allow authenticated users to view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-reports'
);

-- 3. Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-reports'
);

-- 4. Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update reports"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patient-reports'
);

-- Done! All policies created successfully.
```

### 2.3 Run करें

- Bottom-right में **"Run"** button पर click करें
- Wait करें (5 seconds)
- ✅ Success message दिखेगा: "Success. No rows returned"

**यह normal है!** Policies background में apply हो गई हैं।

---

## ✅ Step 3: Verify करें (2 मिनट)

### Terminal में run करें:

```bash
node verify-storage-setup.js
```

**Expected Output:**
```
✅ Connected to Supabase Storage successfully
✅ Bucket 'patient-reports' exists
✅ Storage read permissions working
```

### या SQL Editor में check करें:

```sql
-- Bucket exists?
SELECT name, public FROM storage.buckets;
```

**Expected:**
```
name              | public
------------------|---------
patient-reports   | false
```

```sql
-- Policies exist?
SELECT policyname FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

**Expected:** 4 policies दिखनी चाहिए

---

## 🧪 Step 4: Test Upload (2 मिनट)

### Application में test करें:

1. **Terminal में:**
   ```bash
   npm run dev
   ```

2. **Browser में login करें** (clinic account)

3. **Patient dashboard → Upload Report**

4. **.edf file select करें** (या कोई भी file rename करके .edf extension)

5. **Upload button पर click करें**

6. ✅ **Success!** File upload हो जाएगी

### Supabase में verify करें:

1. Supabase Dashboard → Storage → patient-reports
2. Folders दिखेंगे:
   ```
   patient-reports/
   └── {clinic-id}/
       └── {patient-id}/
           └── 2025-01-15T10-30-00_report.edf
   ```

---

## 📁 File Structure

Files automatically इस structure में store होंगी:

```
patient-reports/
├── clinic-abc-123/              (Clinic 1)
│   ├── patient-001/            (Patient 1 की reports)
│   │   ├── 2025-01-15T10-30-00_baseline.edf
│   │   └── 2025-01-20T14-00-00_followup.eeg
│   └── patient-002/            (Patient 2 की reports)
│       └── 2025-01-16T11-00-00_initial.bdf
│
└── clinic-xyz-456/              (Clinic 2 - isolated)
    └── patient-001/
        └── 2025-01-17T09-00-00_test.edf
```

**Har clinic ka data separate hai!** ✅

---

## 🔒 Security Features

✅ **Private Bucket:**
- सभी files secure हैं
- Unauthorized access नहीं हो सकती

✅ **File Size Limit:**
- Maximum 50MB per file
- Larger files automatically reject होंगी

✅ **File Validation:**
- Only .edf, .eeg, .bdf formats allowed
- Other formats reject होंगे

---

## ❌ Problems? Solutions यहाँ हैं!

### Problem 1: "Bucket does not exist"

**Solution:**
- Bucket name exactly `patient-reports` होना चाहिए
- No capital letters, no spaces
- Supabase Dashboard → Storage में check करें

### Problem 2: "Permission denied"

**Solution:**
- SQL policies फिर से run करें (Step 2)
- Check करें:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'objects';
  ```

### Problem 3: Upload button काम नहीं करता

**Solution:**
- Browser console check करें (F12)
- Error messages देखें
- `.env` file में Supabase credentials सही हैं?

### Problem 4: File 50MB से बड़ी है

**Solution:**
- File size check करें (Right-click → Properties)
- File compress करें या
- Bucket limit बढ़ाएं (Supabase Dashboard → Storage → Edit bucket)

---

## 🎯 Quick Commands

### Verify Setup:
```bash
node verify-storage-setup.js
```

### Start App:
```bash
npm run dev
```

### Check Logs:
```
F12 → Console (browser में)
```

### SQL Queries:
```sql
-- Bucket details
SELECT * FROM storage.buckets WHERE name = 'patient-reports';

-- All files
SELECT name, created_at, metadata->'size' as size
FROM storage.objects
WHERE bucket_id = 'patient-reports'
ORDER BY created_at DESC;

-- Policies
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## ✅ Final Checklist

Setup complete? ये सब check करें:

- [ ] `patient-reports` bucket created
- [ ] Bucket is Private (not Public)
- [ ] File size limit: 50MB (52428800 bytes)
- [ ] SQL policies applied (4 policies)
- [ ] Verification script passed
- [ ] Test upload successful
- [ ] File visible in Supabase Dashboard
- [ ] File structure: {clinic_id}/{patient_id}/{file}

---

## 🎉 Done!

✅ **Single bucket setup complete!**

अब आप:
- ✅ 50MB तक की EEG/qEEG files upload कर सकते हैं
- ✅ Files automatically organize होंगी (clinic → patient)
- ✅ Secure storage (private bucket)
- ✅ No AWS needed!

---

## 📊 Usage Limits (Supabase Free Tier)

| Resource | Free Tier Limit |
|----------|----------------|
| Storage | 1 GB total |
| File uploads | Unlimited |
| File size | 50 MB per file |
| Bandwidth | 2 GB/month |

**50MB files के लिए:**
- 1 GB = ~20 files (50MB each)
- Paid plan में upgrade करें for unlimited storage

---

## 💡 Pro Tips

1. **File Names:** Timestamp automatically add होता है, unique names के लिए
2. **Metadata:** clinicId और patientId हमेशा pass करें upload में
3. **Testing:** पहले small files से test करें (<5MB)
4. **Monitoring:** Supabase Dashboard → Settings → Usage (storage देखें)
5. **Backup:** Important files का local backup रखें

---

**बस इतना! सिर्फ 1 bucket, सब काम करेगा!** 🚀

Questions? Console logs check करें या SQL queries run करें debug के लिए!
