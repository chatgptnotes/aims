# ✅ Supabase Storage Setup Complete - Hindi Guide

## 🎉 क्या हो चुका है?

आपका AIMS application **पहले से ही Supabase Storage use कर रहा है**! AWS S3 कभी integrate नहीं था।

---

## 📦 Required Storage Buckets

आपको Supabase Dashboard में ये buckets बनाने हैं:

### 1. **patient-reports** (Primary Bucket)
- **Purpose:** Patient की .edf, .eeg, .bdf files store करने के लिए
- **Privacy:** Private (RLS policies के साथ)
- **Max File Size:** 50MB
- **File Structure:**
  ```
  patient-reports/
  ├── {clinic_id}/
  │   ├── {patient_id}/
  │   │   ├── 2025-01-15T10-30-00_sample.edf
  │   │   ├── 2025-01-16T14-20-00_test.eeg
  │   │   └── ...
  ```

### 2. **eeg-files** (Raw EEG Storage)
- **Purpose:** Raw EEG data files
- **Privacy:** Private
- **Max File Size:** 50MB
- **File Structure:**
  ```
  eeg-files/
  ├── {clinic_id}/
  │   ├── {patient_id}/
  │   │   ├── {session_id}_raw.edf
  │   │   └── ...
  ```

### 3. **reports** (Generated Reports)
- **Purpose:** AI-generated PDF/CSV/HTML reports
- **Privacy:** Private
- **Max File Size:** 50MB
- **File Structure:**
  ```
  reports/
  ├── {clinic_id}/
  │   ├── {patient_id}/
  │   │   ├── analysis_report.pdf
  │   │   ├── care_plan.pdf
  │   │   └── ...
  ```

### 4. **clinic-logos** (Branding)
- **Purpose:** Clinic logos और branding images
- **Privacy:** Public (logos को display करने के लिए)
- **Max File Size:** 5MB
- **File Structure:**
  ```
  clinic-logos/
  ├── {clinic_id}/
  │   ├── logo.png
  │   └── branding.jpg
  ```

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Supabase Dashboard खोलें

1. **Browser में जाएं:** https://supabase.com
2. **Login करें** अपने account से
3. **AIMS project select करें**

### Step 2: Storage Buckets बनाएं

1. **Left sidebar में "Storage" पर click करें**
2. **"Create a new bucket" button पर click करें**

#### Bucket 1 बनाएं:
```
Name: patient-reports
Public: ❌ NO (Private रखें)
File size limit: 52428800 (50MB)
Allowed MIME types: (Leave empty)
```
**"Create bucket" button पर click करें**

#### Bucket 2 बनाएं:
```
Name: eeg-files
Public: ❌ NO (Private)
File size limit: 52428800 (50MB)
```

#### Bucket 3 बनाएं:
```
Name: reports
Public: ❌ NO (Private)
File size limit: 52428800 (50MB)
```

#### Bucket 4 बनाएं:
```
Name: clinic-logos
Public: ✅ YES (Public - logos display के लिए)
File size limit: 5242880 (5MB)
```

### Step 3: Storage Policies Setup करें

1. **Supabase Dashboard में "SQL Editor" खोलें**
2. **"New query" button पर click करें**
3. **नीचे दी गई SQL file को copy करें और paste करें:**

📄 File location: `D:\AIMS\supabase\storage-policies.sql`

4. **"Run" button पर click करें**

यह SQL file automatically सभी security policies create कर देगी:
- ✅ Clinics अपने patients की files upload कर सकते हैं
- ✅ Clinics सिर्फ अपने patients की files देख सकते हैं
- ✅ Super admin सभी files access कर सकते हैं
- ✅ Unauthorized access blocked है

### Step 4: Verify Setup

SQL Editor में ये queries run करें:

```sql
-- Check if all buckets exist
SELECT * FROM storage.buckets;
```

**Expected Output:** आपको 4 buckets दिखने चाहिए:
- patient-reports
- eeg-files
- reports
- clinic-logos

```sql
-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

**Expected Output:** Multiple policies दिखने चाहिए (upload, view, delete permissions)

---

## 🔧 Code Changes Done

### 1. **storageService.js Updated** ✅

**Location:** `D:\AIMS\src\services\storageService.js`

**Changes:**
- ✅ Files अब clinic और patient के according organize होती हैं
- ✅ File path structure: `{clinic_id}/{patient_id}/{filename}`
- ✅ New methods added:
  - `listClinicFiles(clinicId)` - Clinic की सभी files list करें
  - `listPatientFiles(clinicId, patientId)` - Patient की files list करें

**Example Usage:**
```javascript
import StorageService from './services/storageService';

// Upload file with clinic and patient info
const result = await StorageService.uploadFile(
  file,
  'sample.edf',
  {
    clinicId: 'clinic-123',
    patientId: 'patient-456'
  }
);
// File saved at: patient-reports/clinic-123/patient-456/2025-01-15T10-30-00_sample.edf

// List all files for a patient
const files = await StorageService.listPatientFiles('clinic-123', 'patient-456');
```

### 2. **.env.example Cleaned** ✅

**Location:** `D:\AIMS\.env.example`

**Changes:**
- ❌ AWS credentials references removed
- ✅ Only Supabase configuration remains

---

## 📱 How Upload Works Now

### Upload Flow:

```
User uploads .edf file
        ↓
Component passes file with metadata:
  - clinicId
  - patientId
        ↓
storageService.uploadFile()
  - Validates file (.edf, .eeg, .bdf only)
  - Creates path: {clinicId}/{patientId}/{timestamp}_{filename}
  - Uploads to Supabase Storage bucket
        ↓
File saved at:
patient-reports/clinic-123/patient-456/2025-01-15T10-30-00_sample.edf
        ↓
RLS Policy checks:
  - Is user authenticated?
  - Does clinic_id match user's clinic?
  - ✅ Allow / ❌ Deny
```

### Security:

✅ **Each clinic can only:**
- Upload files to their own folder
- View files in their own folder
- Delete files in their own folder

❌ **Clinics CANNOT:**
- Access other clinics' files
- View files outside their folder
- Delete other clinics' data

✅ **Super Admin can:**
- Access all files
- View all clinics' data
- Manage all uploads

---

## 🧪 Testing Upload

### Test करने के लिए:

1. **Application run करें:**
   ```bash
   npm run dev
   ```

2. **Login करें** as clinic user

3. **Patient dashboard खोलें**

4. **"Upload Report" button पर click करें**

5. **Sample .edf file upload करें**

6. **Supabase Dashboard में verify करें:**
   - Storage → patient-reports bucket खोलें
   - आपको folder structure दिखेगा:
     ```
     patient-reports/
     └── {your-clinic-id}/
         └── {patient-id}/
             └── {timestamp}_filename.edf
     ```

---

## 🔍 Debug Commands

### Check Upload Logs:

Browser Console में (F12) देखें:
```
Uploading file to Supabase Storage: sample.edf
File uploaded successfully: clinic-123/patient-456/2025-01-15T10-30-00_sample.edf
```

### Check Storage in Supabase:

SQL Editor में run करें:
```sql
-- List all uploaded files
SELECT
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'patient-reports'
ORDER BY created_at DESC
LIMIT 10;
```

### Check File Permissions:

```sql
-- Check if current user can access files
SELECT
  o.*,
  p.role
FROM storage.objects o
JOIN profiles p ON p.id = auth.uid()
WHERE o.bucket_id = 'patient-reports'
AND o.name LIKE '%' || auth.uid()::text || '%';
```

---

## ❌ Common Issues & Solutions

### Issue 1: "Bucket does not exist"

**Solution:**
1. Supabase Dashboard → Storage
2. Create bucket manually with exact name
3. Refresh application

### Issue 2: "Upload failed: permission denied"

**Solution:**
1. Supabase Dashboard → SQL Editor
2. Run `storage-policies.sql` again
3. Verify policies exist:
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'objects';
   ```

### Issue 3: "File size exceeds limit"

**Solution:**
- Maximum file size है 50MB
- Large files को compress करें या
- Bucket settings में file size limit बढ़ाएं

### Issue 4: "Invalid file format"

**Solution:**
- Allowed formats: `.edf`, `.eeg`, `.bdf`
- File extension check case-sensitive नहीं है
- File rename करें proper extension के साथ

---

## 📊 File Organization Examples

### Example 1: Multiple Patients, One Clinic

```
patient-reports/
├── clinic-abc-123/
│   ├── patient-001/
│   │   ├── 2025-01-15T10-00-00_baseline.edf
│   │   └── 2025-01-20T11-30-00_followup.edf
│   ├── patient-002/
│   │   ├── 2025-01-16T09-15-00_initial.edf
│   │   └── 2025-01-18T14-00-00_assessment.edf
│   └── patient-003/
│       └── 2025-01-17T16-45-00_screening.edf
```

### Example 2: Multiple Clinics

```
patient-reports/
├── clinic-abc-123/
│   └── patient-001/
│       └── 2025-01-15T10-00-00_baseline.edf
├── clinic-xyz-456/
│   └── patient-001/  (Different patient, same ID but different clinic)
│       └── 2025-01-15T11-00-00_baseline.edf
└── clinic-def-789/
    └── patient-002/
        └── 2025-01-16T12-00-00_initial.edf
```

**Note:** हर clinic का अपना isolated folder है, इसलिए:
- ✅ Patient IDs different clinics में repeat हो सकते हैं
- ✅ कोई data mixing नहीं होगी
- ✅ Privacy maintained रहेगी

---

## 🎯 Next Steps

### ✅ Already Done:
- [x] Storage service Supabase के लिए configured है
- [x] File upload clinic/patient structure के साथ organize है
- [x] AWS references removed from code
- [x] Security policies ready (SQL file में)

### 🚀 You Need to Do:

1. **Supabase Dashboard में 4 buckets बनाएं** (10 minutes)
2. **SQL policies run करें** (2 minutes)
3. **Test upload करें** (5 minutes)
4. **Verify files bucket में दिख रहे हैं** (2 minutes)

**Total Time:** ~20 minutes

---

## 📞 Support

### If Upload Fails:

1. **Browser Console check करें** (F12 → Console tab)
2. **Supabase Dashboard logs देखें** (Logs & Analytics)
3. **Verify bucket permissions:**
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'objects'
   AND schemaname = 'storage';
   ```

### If Files Not Visible:

1. **Check RLS policies applied हैं या नहीं**
2. **Verify clinic_id correct है:**
   ```javascript
   console.log('Current user:', supabase.auth.getUser());
   ```
3. **Check file path structure:**
   ```sql
   SELECT name FROM storage.objects
   WHERE bucket_id = 'patient-reports';
   ```

---

## 🎓 Important Notes

1. **Bucket Names Case-Sensitive Hैं:**
   - ✅ `patient-reports` (correct)
   - ❌ `Patient-Reports` (wrong)
   - ❌ `patient_reports` (wrong)

2. **File Path Structure Important है:**
   - ✅ `{clinic_id}/{patient_id}/{file}` (correct)
   - ❌ `{patient_id}/{file}` (missing clinic_id)
   - ❌ `reports/{clinic_id}/{file}` (extra folder)

3. **Metadata Always Pass करें:**
   ```javascript
   // ✅ Correct
   StorageService.uploadFile(file, 'test.edf', {
     clinicId: 'clinic-123',
     patientId: 'patient-456'
   });

   // ❌ Wrong (files 'unknown-clinic' folder में जाएंगी)
   StorageService.uploadFile(file, 'test.edf');
   ```

4. **RLS Policies Essential हैं:**
   - Policies के बिना: ❌ Permission denied errors
   - Policies के साथ: ✅ Secure file access

---

## ✅ Checklist

Before going live, verify:

- [ ] All 4 buckets created in Supabase Dashboard
- [ ] Storage policies SQL script executed successfully
- [ ] Test upload successful
- [ ] Files visible in correct folder structure
- [ ] Clinic can access only their files
- [ ] Super admin can access all files
- [ ] File download working
- [ ] File delete working
- [ ] Error handling tested

---

## 🎉 Summary

**What Changed:**
1. ✅ Storage service अब clinic/patient के according files organize करती है
2. ✅ AWS references remove हो गए
3. ✅ Security policies ready हैं
4. ✅ Upload workflow complete है

**What You Need to Do:**
1. 🎯 Supabase Dashboard में buckets बनाएं
2. 🎯 SQL policies run करें
3. 🎯 Test upload करें

**Result:**
- 📁 Files organized by clinic and patient
- 🔒 Secure access with RLS policies
- ⚡ Fast uploads with Supabase Storage
- 💰 No AWS costs!

---

बस इतना ही! अब आप Supabase Storage use करने के लिए ready हैं! 🚀

Questions? Check the SQL policies file या console logs देखें for debugging.
