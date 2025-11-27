# 🪣 Bucket बनाएं - Step by Step (Hindi Guide)

## 🎯 Goal: 50MB तक के .edf, .eeg, .bdf files store करने के लिए bucket

---

## 📋 Requirements

✅ **Bucket Name:** `patient-reports`
✅ **File Size Limit:** 50MB (52428800 bytes)
✅ **Allowed Formats:** .edf, .eeg, .bdf only
✅ **Privacy:** Private (secure)
✅ **Connection:** Project से automatically connected

---

## 🚀 Step-by-Step Instructions

### **Step 1: Supabase Dashboard खोलें**

#### 1.1 Browser में जाएं
```
🌐 URL: https://supabase.com
```

#### 1.2 Login करें
- Email और Password डालें
- "Sign in" पर click करें

#### 1.3 Project Select करें
- **Neuro360** project पर click करें
- Dashboard open होगा

---

### **Step 2: Storage Section खोलें**

#### 2.1 Left Sidebar में देखें

Left side में icons की list दिखेगी:

```
📊 Home
🏗️  Table Editor
🔐 Authentication
📦 Storage          ← यहाँ click करें!
💾 Database
⚡ Edge Functions
📈 Logs
⚙️  Settings
```

#### 2.2 Storage पर Click करें

**"Storage"** (bucket icon 📦) पर click करें

---

### **Step 3: New Bucket बनाएं**

#### 3.1 Create Button ढूंढें

Storage page पर आपको दिखेगा:

```
┌─────────────────────────────────────┐
│  Storage                            │
│                                     │
│  📦 Buckets                         │
│                                     │
│  [+ Create a new bucket]           │ ← यह हरा button
│                                     │
└─────────────────────────────────────┘
```

**"Create a new bucket"** button (हरा button) पर click करें

#### 3.2 Form दिखेगा - यह भरें

एक popup form खुलेगा:

```
┌─────────────────────────────────────────┐
│  Create a new bucket                    │
├─────────────────────────────────────────┤
│                                         │
│  Name *                                 │
│  ┌───────────────────────────────────┐ │
│  │ patient-reports                   │ │ ← exactly यही लिखें!
│  └───────────────────────────────────┘ │
│                                         │
│  Description (optional)                 │
│  ┌───────────────────────────────────┐ │
│  │ Patient EEG/qEEG Reports Storage  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ☐ Public bucket                       │ ← NO! Checkbox UNCHECK
│                                         │
│  File size limit (bytes)                │
│  ┌───────────────────────────────────┐ │
│  │ 52428800                          │ │ ← यह 50MB है
│  └───────────────────────────────────┘ │
│                                         │
│  Allowed MIME types (optional)          │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │ ← खाली छोड़ें
│  └───────────────────────────────────┘ │
│                                         │
│  [ Cancel ]         [ Create bucket ]  │ ← Create पर click!
│                                         │
└─────────────────────────────────────────┘
```

#### 3.3 Important Fields:

**Name:**
```
patient-reports
```
⚠️ **ध्यान दें:**
- सभी lowercase letters
- कोई space नहीं
- कोई capital letters नहीं
- exactly यही spelling!

**Public bucket:**
```
☐ NO (Unchecked रहना चाहिए)
```
⚠️ **Important:** Private security के लिए

**File size limit:**
```
52428800
```
💡 यह **50 MB** in bytes है

**Allowed MIME types:**
```
(खाली छोड़ दें - blank)
```
💡 File format validation code में already है

#### 3.4 Create Button पर Click करें

- Form check करें (सब सही है?)
- **"Create bucket"** button (नीचे right में)
- Click करें!

---

### **Step 4: Verify - Bucket बना या नहीं?**

#### 4.1 Storage Page पर वापस आ जाओगे

अब आपको दिखेगा:

```
┌─────────────────────────────────────────┐
│  Storage                                │
├─────────────────────────────────────────┤
│  📦 Buckets                             │
│                                         │
│  ✅ patient-reports  🔒 Private         │ ← यह दिखना चाहिए!
│     └─ 50 MB limit                      │
│                                         │
│  [+ Create a new bucket]                │
└─────────────────────────────────────────┘
```

#### 4.2 Bucket Details Check करें

**patient-reports** पर click करें:

```
┌─────────────────────────────────────────┐
│  patient-reports                        │
├─────────────────────────────────────────┤
│  Bucket is empty                        │
│  Upload your first file                 │
│                                         │
│  Details:                               │
│  • Privacy: Private 🔒                  │
│  • Size limit: 50 MB                    │
│  • Created: Just now                    │
└─────────────────────────────────────────┘
```

✅ **Perfect! Bucket बन गया!**

---

### **Step 5: Security Policies Apply करें**

अब bucket को project से properly connect करने के लिए security policies चाहिए।

#### 5.1 SQL Editor खोलें

Left sidebar में:
```
💻 SQL Editor  ← यहाँ click करें
```

#### 5.2 New Query बनाएं

```
[+ New query]  ← यह button (top right में)
```

#### 5.3 SQL Code Copy करें

यह पूरा SQL copy करें:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-reports');

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-reports');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete reports"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-reports');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update reports"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-reports');
```

#### 5.4 SQL Editor में Paste करें

- SQL Editor में जाएं
- **Ctrl+A** (सब select करो)
- **Delete** (पुराना query delete करो)
- **Ctrl+V** (ऊपर का SQL paste करो)

#### 5.5 Run करें

```
▶️ Run  ← यह button (bottom-right में, हरा button)
```

- Click करें
- Wait करें (5 seconds)
- Success message दिखेगा:

```
✅ Success. No rows returned
```

यह **normal** है! Policies create हो गई हैं।

---

### **Step 6: Bucket को Project से Connect करें**

🎉 **Good news:** Bucket already connected है!

#### 6.1 Code में Already Connected है

File: `D:\Neuro360\src\services\storageService.js`

```javascript
class StorageService {
  constructor() {
    this.reportsBucket = 'patient-reports';  ← यहाँ bucket name है
    // ... rest of code
  }
}
```

✅ **Automatically connected!** कुछ नहीं करना!

#### 6.2 File Format Validation Already है

Same file में (line 218):

```javascript
validateFile(file) {
  // Only allow EEG/qEEG formats
  const validExtensions = ['.edf', '.eeg', '.bdf'];  ← formats
  const hasValidExtension = validExtensions.some(ext =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    throw new Error('Only .edf, .eeg, .bdf files allowed!');
  }

  // Check 50MB limit
  if (file.size > 50 * 1024 * 1024) {  ← 50MB check
    throw new Error('File exceeds 50MB limit');
  }
}
```

✅ **Already configured!**
- ✅ Only .edf, .eeg, .bdf allowed
- ✅ 50MB limit enforced
- ✅ Automatic validation

---

### **Step 7: Verify Complete Setup**

#### 7.1 Terminal में Command Run करें

```bash
npm run verify:storage
```

#### 7.2 Expected Output:

```
🔍 Verifying Single Bucket Setup...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Check 1: Supabase Connection
   ✅ PASSED: Connected successfully

📦 Check 2: Patient Reports Bucket
   ✅ PASSED: Bucket exists
   - Name: patient-reports
   - Privacy: Private (✓)
   - ID: [bucket-id]

🔐 Check 3: Storage Permissions
   ✅ PASSED: Can list files in bucket
   - Bucket is empty (ready for uploads)

📋 Check 4: All Buckets in Project
   Current buckets:
   ✅ patient-reports (Private)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FINAL SUMMARY

🎉 SUCCESS! Setup is complete!

✅ Supabase connected
✅ patient-reports bucket exists
✅ Storage permissions configured

🚀 Next steps:
   1. Run: npm run dev
   2. Login to your app
   3. Try uploading a .edf file
   4. Check Supabase Dashboard → Storage to verify
```

✅ **All green = Perfect setup!**

---

## 🧪 **Test Upload - Check करें Bucket काम कर रहा है?**

### Test 1: Start Application

```bash
npm run dev
```

### Test 2: Upload File

1. **Browser में application खुलेगा**
   - URL: http://localhost:5173

2. **Login करें**
   - Clinic account use करें

3. **Patient Dashboard खोलें**
   - Sidebar → Patients
   - कोई patient select करें

4. **Upload Report Button**
   - "Upload Report" button ढूंढें
   - Click करें

5. **File Select करें**
   - .edf, .eeg, या .bdf file चुनें
   - File size: 50MB से छोटी होनी चाहिए

6. **Upload करें**
   - "Upload" button → Click!
   - Progress bar दिखेगा
   - Success message आएगा! ✅

### Test 3: Verify in Supabase

1. **Supabase Dashboard → Storage**
2. **patient-reports bucket खोलें**
3. **Folders दिखेंगे:**

```
patient-reports/
└── {your-clinic-id}/
    └── {patient-id}/
        └── 2025-01-15T10-30-00_report.edf  ← Upload हुई file!
```

✅ **File दिखी? Perfect! सब काम कर रहा है!**

---

## 📊 **Summary - क्या हो गया?**

### ✅ Bucket Created:
- **Name:** patient-reports
- **Privacy:** Private (secure 🔒)
- **Size Limit:** 50MB per file
- **Format:** .edf, .eeg, .bdf only

### ✅ Security Applied:
- RLS Policies active
- Only authenticated users can access
- Each clinic isolated from others

### ✅ Project Connected:
- Code automatically uses bucket
- File validation automatic
- Size checking automatic
- Format validation automatic

### ✅ File Organization:
```
patient-reports/
├── clinic-1/
│   └── patient-1/
│       ├── file1.edf
│       └── file2.eeg
└── clinic-2/
    └── patient-1/
        └── file3.bdf
```

**Automatic organization by clinic & patient!**

---

## ❌ **Troubleshooting - Problems?**

### Problem 1: Bucket नहीं बन रहा

**Error:** "Bucket name already exists"

**Solution:**
- Bucket name unique होना चाहिए
- Check करें: Storage page में already `patient-reports` है?
- अगर है, तो Step 5 (policies) से continue करें

---

### Problem 2: Permission Error

**Error:** "Permission denied" या "Policy violation"

**Solution:**
- SQL policies फिर से run करें (Step 5)
- Verify करें:
  ```sql
  SELECT policyname FROM pg_policies
  WHERE tablename = 'objects' AND schemaname = 'storage';
  ```
- 4 policies दिखनी चाहिए

---

### Problem 3: Upload नहीं हो रही

**Error:** "Upload failed" या button काम नहीं करता

**Solution:**
1. **Browser Console check करें:**
   - Press F12
   - Console tab खोलें
   - Red errors हैं?

2. **.env file check करें:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. **Bucket name verify करें:**
   ```bash
   npm run verify:storage
   ```

---

### Problem 4: "File too large"

**Error:** "File exceeds 50MB limit"

**Solution:**
- File size check करें:
  - Right-click file → Properties
  - Size should be < 50MB
- Compress file या
- Bucket limit बढ़ाएं:
  - Supabase → Storage → patient-reports → Edit
  - File size limit: 104857600 (100MB)

---

### Problem 5: "Invalid file format"

**Error:** "Only .edf, .eeg, .bdf files allowed"

**Solution:**
- File extension check करें
- File rename करें proper extension के साथ:
  ```
  ✅ report.edf
  ✅ data.eeg
  ✅ scan.bdf
  ❌ report.pdf
  ❌ data.txt
  ```

---

## 🎯 **Final Checklist**

Setup complete? सब check करो:

```
☑️  Bucket created: patient-reports
☑️  Bucket is Private (not Public)
☑️  File size limit: 50MB (52428800)
☑️  SQL policies applied (4 policies)
☑️  Verification script passed
☑️  Test upload successful
☑️  File visible in Supabase Dashboard
☑️  Only .edf, .eeg, .bdf formats accepted
☑️  Files organized by clinic/patient
```

**सब ✅? Perfect! आप ready हो!** 🎉

---

## 📞 **Quick Help Commands**

```bash
# Setup verify करें
npm run verify:storage

# App start करें
npm run dev

# Bucket details देखें (SQL में)
SELECT * FROM storage.buckets WHERE name = 'patient-reports';

# Files list करें (SQL में)
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'patient-reports'
ORDER BY created_at DESC;

# Policies check करें (SQL में)
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## 🎉 **Congratulations!**

✅ **Bucket successfully created and connected!**

अब आप:
- ✅ 50MB तक की files upload कर सकते हैं
- ✅ Only .edf, .eeg, .bdf formats allowed
- ✅ Automatic file organization
- ✅ Secure private storage
- ✅ Project से connected

**Happy uploading! 🚀**

---

## 📚 **Related Documentation**

- Complete guide: `SIMPLE_SINGLE_BUCKET_SETUP.md`
- Quick start: `START_HERE_HINDI.md`
- SQL policies: `supabase/single-bucket-policies.sql`
- Verification: `verify-single-bucket.js`

---

**Questions? Problems? Console logs check करो या documentation पढ़ो!** 💪
