# Patient Reports Bucket Setup Guide
# पेशेंट रिपोर्ट्स बकेट सेटअप गाइड

## समस्या (Problem)
जब clinic किसी patient की report upload करता है, तो वो file Supabase के `patient-reports` bucket में store होनी चाहिए। लेकिन अभी bucket create नहीं हुआ है या visible नहीं है।

When a clinic uploads a patient report, the file should be stored in the Supabase `patient-reports` bucket. But the bucket is not created or not visible yet.

---

## ✅ कोड पहले से तैयार है (Code is Ready)

आपका code पूरी तरह तैयार है! जब भी कोई clinic patient की report upload करेगा:

Your code is completely ready! Whenever a clinic uploads a patient report:

1. **File Upload होगा** → Supabase Storage में `patient-reports` bucket में
2. **Path Structure**: `reports/{timestamp}_{filename}`
3. **Metadata Save होगा**: Database में clinic ID, patient ID, etc.
4. **Secure Access**: Signed URLs के through

**Example Path**: `reports/2025-10-29T11-30-00_brain-scan.pdf`

---

## 🚨 अभी क्या करना है (What to Do Now)

### Step 1: Supabase Dashboard में Bucket बनाएं

#### 1️⃣ Supabase Dashboard खोलें
```
https://app.supabase.com/project/omyltmcesgbhnqmhrrvq
```

#### 2️⃣ Storage Section में जाएं
- Left sidebar में **"Storage"** पर click करें
- आपको buckets की list दिखेगी (अभी शायद empty है)

#### 3️⃣ New Bucket बनाएं
- **"New bucket"** या **"Create bucket"** button पर click करें

#### 4️⃣ Bucket Configuration भरें

**बिल्कुल यही settings use करें:**

| Setting | Value | क्यों? |
|---------|-------|---------|
| **Bucket name** | `patient-reports` | ⚠️ EXACTLY यही नाम होना चाहिए |
| **Public bucket** | ❌ OFF (Private) | Security के लिए |
| **File size limit** | `200 MB` | बड़ी files के लिए |
| **Restrict MIME types** | ✅ ON | Security |
| **Allowed MIME types** | नीचे देखें ⬇️ | - |

**Allowed MIME types** (Copy करें):
```
application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, image/gif, application/octet-stream
```

#### 5️⃣ Save Button दबाएं
- ⚠️ **IMPORTANT**: Green "Save" या "Create bucket" button जरूर दबाएं!
- Bucket list में `patient-reports` दिखना चाहिए

---

### Step 2: RLS Policies Add करें (CRITICAL)

Bucket बनने के बाद, **RLS policies** जरूर add करें वरना uploads काम नहीं करेंगे!

After creating the bucket, you MUST add RLS policies or uploads won't work!

#### Option A: SQL Editor से (Fastest)

1. Supabase Dashboard में **SQL Editor** खोलें
2. **"New query"** button पर click करें
3. यह पूरा SQL copy करके paste करें:

```sql
-- Policy 1: Authenticated users file upload कर सकें
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-reports');

-- Policy 2: Authenticated users files read कर सकें
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'patient-reports');

-- Policy 3: Authenticated users files delete कर सकें
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'patient-reports');

-- Policy 4: Authenticated users file metadata update कर सकें
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-reports')
WITH CHECK (bucket_id = 'patient-reports');
```

4. **"Run"** button दबाएं
5. Success message दिखना चाहिए

#### Option B: Storage UI से (Step by step)

1. **Storage** > **patient-reports** bucket खोलें
2. **"Policies"** tab पर जाएं
3. 4 policies add करें (ऊपर दिए गए SQL के according)

---

### Step 3: Connection Test करें

Bucket और policies setup के बाद:

```bash
node test-supabase-storage.js
```

**आपको यह दिखना चाहिए:**
```
✅ Successfully listed buckets
   Found 1 bucket(s):
   👉 patient-reports (Private)

✅ Target bucket "patient-reports" found!
✅ Successfully accessed bucket
🎉 All tests passed!
```

---

### Step 4: Application में Test करें

1. **Development server start करें:**
```bash
cd apps\web
npm run dev
```

2. **Browser में खोलें:** http://localhost:3000

3. **Test upload:**
   - Clinic dashboard में login करें
   - किसी patient को select करें
   - "Upload Report" button दबाएं
   - कोई PDF/image file select करें
   - Upload करें

4. **Verify:**
   - Supabase Dashboard > Storage > patient-reports खोलें
   - `reports/` folder में आपकी uploaded file दिखनी चाहिए

---

## 📁 File Structure (कैसे Files Store होंगी)

```
patient-reports/  (bucket name)
├── reports/
│   ├── 2025-10-29T10-30-00_patient-report.pdf
│   ├── 2025-10-29T11-15-00_brain-scan.jpg
│   ├── 2025-10-29T12-00-00_eeg-report.pdf
│   └── ...
└── edf-files/
    └── {clinicId}/
        └── {patientId}/
            └── recording.edf
```

**Example**:
- Clinic: "Apollo Clinic" (ID: `clinic_123`)
- Patient: "Rahul Kumar" (ID: `patient_456`)
- File: `brain-report.pdf`
- **Stored at**: `reports/2025-10-29T14-30-00_brain-report.pdf`

---

## 🔍 Database में Data (कैसे Save होगा)

जब file upload होगी, database में यह information save होगी:

When a file is uploaded, this information is saved in the database:

```javascript
{
  clinicId: "clinic_123",
  patientId: "patient_456",
  title: "Brain Scan Report",
  fileName: "brain-report.pdf",
  fileSize: "2.5 MB",
  fileType: "application/pdf",
  uploadedBy: "Dr. Sharma",

  // Supabase Storage info
  storagePath: "reports/2025-10-29T14-30-00_brain-report.pdf",
  storageBucket: "patient-reports",
  storageFileName: "2025-10-29T14-30-00_brain-report.pdf",
  storageUploadedAt: "2025-10-29T14:30:00.000Z",
  fileUrl: "https://...supabase.co/storage/v1/object/sign/...",

  uploadStatus: "completed",
  storedInCloud: true
}
```

---

## ❌ Common Errors और Solutions

### Error 1: "Bucket not found"
**कारण**: Bucket create नहीं हुआ या name गलत है
**Solution**:
- Bucket name exactly `patient-reports` होना चाहिए
- Save button दबाना न भूलें
- Bucket list में check करें

### Error 2: "Permission denied" or "Access denied"
**कारण**: RLS policies missing हैं
**Solution**:
- Step 2 के according RLS policies add करें
- सभी 4 policies (INSERT, SELECT, DELETE, UPDATE) होने चाहिए

### Error 3: "File type not allowed"
**कारण**: MIME type allowed list में नहीं है
**Solution**:
- Bucket settings में जाएं
- Allowed MIME types में file type add करें
- Common types already included हैं (PDF, images, Office docs)

### Error 4: Upload succeed but file नहीं दिखती
**कारण**: Bucket path या filter issue
**Solution**:
- Supabase Storage में `reports/` folder check करें
- Refresh करें
- Filters clear करें

---

## 🎯 Final Checklist

Upload काम करने के लिए यह सब होना चाहिए:

- [ ] ✅ Bucket name exactly `patient-reports` है
- [ ] ✅ Bucket Private (not public) है
- [ ] ✅ Save button दबाया गया
- [ ] ✅ Bucket list में दिख रहा है
- [ ] ✅ 4 RLS policies add किए गए
- [ ] ✅ Test script success हो रहा है
- [ ] ✅ Application से upload test किया

---

## 📞 अगर Problem हो तो

1. **Browser Console check करें:**
   - F12 दबाएं
   - Console tab खोलें
   - Upload करते समय errors देखें

2. **Supabase Dashboard check करें:**
   - Storage > patient-reports खोलें
   - Files दिख रहे हैं या नहीं

3. **Test script run करें:**
   ```bash
   node test-supabase-storage.js
   ```
   - यह exact problem बताएगा

---

## ✅ Success का Sign

जब सब सही होगा तो:

1. **Upload करते समय:**
   ```
   ✅ File uploaded successfully!
   ```

2. **Browser Console में:**
   ```
   Uploading file to Supabase Storage: report.pdf
   File uploaded successfully: reports/2025-10-29...
   ```

3. **Supabase Storage में:**
   - `patient-reports` bucket में
   - `reports/` folder में
   - आपकी file दिखेगी

4. **Database में:**
   - Report record save होगा
   - `storagePath` field भरा होगा

---

**सारांश**: आपका code 100% ready है। बस Supabase Dashboard में bucket create करना है और RLS policies add करने हैं। फिर सब automatically काम करेगा! 🚀
