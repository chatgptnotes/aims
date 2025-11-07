# 🇮🇳 Supabase Storage Setup - आसान हिंदी गाइड

## 🎯 क्या करना है?

आपको Supabase में storage buckets बनाने हैं ताकि .edf files store हो सकें।

---

## ⏱️ कितना समय लगेगा?

**कुल समय: 15-20 मिनट**

- Buckets बनाना: 10 मिनट
- Policies apply करना: 5 मिनट
- Testing: 5 मिनट

---

## 📝 Step 1: Supabase Dashboard खोलें

### 1.1 Browser में जाएं
```
https://supabase.com
```

### 1.2 Login करें
- अपना email/password डालें
- "Sign in" पर click करें

### 1.3 Project खोलें
- "Neuro360" project पर click करें
- Dashboard खुल जाएगा

---

## 📦 Step 2: Storage Buckets बनाएं

### 2.1 Storage Page खोलें
- Left sidebar में **"Storage"** ढूंढें (bucket icon)
- "Storage" पर click करें

### 2.2 First Bucket: patient-reports

1. **"Create a new bucket"** button दिखेगा (हरा button)
2. Click करें
3. Form में भरें:

```
Name: patient-reports
(बिल्कुल यही नाम लिखें, कोई space या capital letter नहीं)

Description: Patient EEG report files
(optional - आप छोड़ भी सकते हैं)

Public bucket: ❌ NO
(यह checkbox UNCHECK रहना चाहिए - private रखें)

File size limit: 52428800
(यह 50MB है - default रहने दें या 52428800 लिखें)

Allowed MIME types: (खाली छोड़ दें)
```

4. **"Create bucket"** button पर click करें
5. ✅ पहला bucket बन गया!

### 2.3 Second Bucket: eeg-files

फिर से "Create a new bucket" पर click करें:

```
Name: eeg-files
Public bucket: ❌ NO
File size limit: 52428800
```

**"Create bucket"** पर click करें

### 2.4 Third Bucket: reports

फिर से create करें:

```
Name: reports
Public bucket: ❌ NO
File size limit: 52428800
```

**"Create bucket"** पर click करें

### 2.5 Fourth Bucket: clinic-logos

आखिरी bucket:

```
Name: clinic-logos
Public bucket: ✅ YES (यह checkbox CHECK करें)
File size limit: 5242880
(यह 5MB है - logos के लिए)
```

**"Create bucket"** पर click करें

### ✅ Buckets Check करें

अब आपको 4 buckets दिखने चाहिए:
- ✅ patient-reports (Private)
- ✅ eeg-files (Private)
- ✅ reports (Private)
- ✅ clinic-logos (Public)

Screenshot में यह कुछ ऐसा दिखेगा:
```
Buckets
├── patient-reports     🔒 Private
├── eeg-files          🔒 Private
├── reports            🔒 Private
└── clinic-logos       🌐 Public
```

---

## 🔐 Step 3: Security Policies Apply करें

### 3.1 SQL Editor खोलें

1. Left sidebar में **"SQL Editor"** ढूंढें (💻 icon)
2. "SQL Editor" पर click करें
3. **"New query"** button पर click करें

### 3.2 SQL File Copy करें

1. अपने computer पर यह file खोलें:
   ```
   D:\Neuro360\supabase\storage-policies.sql
   ```

2. **पूरी file को copy करें** (Ctrl+A, फिर Ctrl+C)

3. Supabase SQL Editor में **paste करें** (Ctrl+V)

### 3.3 Run करें

1. Bottom-right में **"Run"** button दिखेगा (हरा button)
2. "Run" पर click करें
3. थोड़ा wait करें (5-10 seconds)
4. Success message दिखेगा: ✅ "Success. No rows returned"

यह normal है! Policies background में apply हो गई हैं।

---

## ✅ Step 4: Verification (Verify करें)

### 4.1 Buckets Check करें

SQL Editor में new query खोलें और यह run करें:

```sql
SELECT * FROM storage.buckets;
```

**Expected Output:**
```
name              | public
------------------|---------
patient-reports   | false
eeg-files         | false
reports           | false
clinic-logos      | true
```

✅ 4 buckets दिखने चाहिए!

### 4.2 Policies Check करें

```sql
SELECT policyname, tablename
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY policyname;
```

**Expected Output:** बहुत सारी policies दिखेंगी:
- Clinics can upload patient reports
- Clinics can view their patient reports
- Super admin can access all...
- etc.

✅ अगर 10+ policies दिखती हैं, तो सब ठीक है!

### 4.3 Automated Verification Script

Terminal में run करें:

```bash
node verify-storage-setup.js
```

यह script automatically check करेगा:
- ✅ Supabase connection
- ✅ All buckets exist
- ✅ Permissions working

**Expected Output:**
```
🔍 Verifying Supabase Storage Setup...

📡 Step 1: Checking Supabase connection...
✅ Connected to Supabase Storage successfully

📦 Step 2: Checking required buckets...
✅ Bucket 'patient-reports' exists
✅ Bucket 'eeg-files' exists
✅ Bucket 'reports' exists
✅ Bucket 'clinic-logos' exists

✅ All required buckets are configured correctly!
```

---

## 🧪 Step 5: Test Upload करें

### 5.1 Application Start करें

```bash
npm run dev
```

### 5.2 Login करें

- Browser में application खोलें
- Clinic account से login करें

### 5.3 Patient Dashboard खोलें

- Sidebar में "Patients" पर click करें
- कोई भी patient select करें

### 5.4 File Upload करें

1. **"Upload Report"** button पर click करें
2. Sample .edf file select करें
   - अगर आपके पास .edf file नहीं है, तो कोई भी small file use करें और rename करके `.edf` extension लगा दें
3. **"Upload"** button पर click करें
4. Wait करें (progress bar दिखेगा)
5. ✅ Success message दिखेगा!

### 5.5 Verify File in Supabase

1. Supabase Dashboard → Storage → patient-reports
2. Folders दिखेंगे:
   ```
   patient-reports/
   └── clinic-abc-123/           ← आपकी clinic का folder
       └── patient-xyz-456/      ← patient का folder
           └── 2025-01-15T...edf ← uploaded file!
   ```

✅ अगर file दिख रही है, तो **सब काम कर रहा है!**

---

## ❌ Problems? (अगर कोई problem है)

### Problem 1: "Bucket does not exist"

**Solution:**
- Supabase Dashboard → Storage
- Bucket का नाम double-check करें (spelling सही है?)
- Bucket फिर से बनाएं (Step 2 दोबारा करें)

### Problem 2: "Permission denied"

**Solution:**
- SQL policies फिर से apply करें (Step 3)
- Verify करें policies exist करती हैं:
  ```sql
  SELECT * FROM pg_policies WHERE schemaname = 'storage';
  ```

### Problem 3: Upload button काम नहीं कर रहा

**Solution:**
- Browser console check करें (F12 → Console)
- Errors दिख रहे हैं?
- Screenshot लें और support से पूछें

### Problem 4: File upload होती है पर दिखती नहीं

**Solution:**
- Metadata check करें (clinicId और patientId सही हैं?)
- Console log देखें:
  ```javascript
  console.log('Upload result:', result);
  ```

---

## 📞 Help Required?

### Check करें:

1. **Browser Console** (F12)
   - Errors दिख रहे हैं?
   - Red messages हैं?

2. **Supabase Logs** (Dashboard → Logs)
   - Recent logs check करें
   - Errors हैं?

3. **Verification Script**
   ```bash
   node verify-storage-setup.js
   ```
   - क्या output आ रहा है?

### Debug Commands:

```sql
-- All buckets dekho
SELECT * FROM storage.buckets;

-- Recent uploads dekho
SELECT name, created_at, bucket_id
FROM storage.objects
ORDER BY created_at DESC
LIMIT 10;

-- Policies verify karo
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';
```

---

## ✅ Final Checklist

Setup complete hai? Yeh sab check karo:

- [ ] 4 buckets created (patient-reports, eeg-files, reports, clinic-logos)
- [ ] All buckets show correct privacy (Private/Public)
- [ ] SQL policies applied successfully
- [ ] Verification script passes (✅)
- [ ] Test upload successful
- [ ] File visible in Supabase Storage
- [ ] File structure correct: {clinic_id}/{patient_id}/{file}
- [ ] Can download file
- [ ] Can delete file (optional test)

---

## 🎉 Congratulations!

✅ **Supabase Storage setup complete hai!**

अब आप:
- ✅ .edf files upload कर सकते हैं
- ✅ Files clinic और patient ke according organized हैं
- ✅ Security policies active हैं (RLS)
- ✅ AWS S3 की जरूरत नहीं (Supabase free tier!)

---

## 📚 अगली Steps

1. **Production में deploy करें**
   - .env file में production Supabase credentials डालें
   - Same buckets production project में भी बनाएं

2. **Backup setup करें**
   - Regular backups enable करें (Supabase Dashboard → Database → Backups)

3. **Monitor करें**
   - Storage usage check करें (Dashboard → Settings → Usage)
   - Free tier: 1GB storage free है

---

## 🔗 Useful Links

- Supabase Dashboard: https://supabase.com/dashboard
- Storage Documentation: https://supabase.com/docs/guides/storage
- RLS Policies Guide: https://supabase.com/docs/guides/auth/row-level-security

---

**Questions?** Check console logs या Supabase documentation पढ़ें! 🚀
