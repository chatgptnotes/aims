# Test Your Bucket Connection NOW

## आपने बताया कि आपने already policies create कर लिए हैं ✅

Perfect! अब बस यह करें:

---

## Step 1: Save the Bucket (अगर नहीं किया)

आपके screenshot में:
- Green **"Save"** button दिख रहा है
- अगर अभी तक Save नहीं किया, तो **अभी Save करें**

---

## Step 2: Test Connection (Right Now!)

Terminal में यह command run करें:

```bash
cd C:\Users\poona\AIMS
node test-supabase-storage.js
```

---

## ✅ अगर Successful है तो यह दिखेगा:

```
🔍 Testing Supabase Storage Connection...

Configuration:
- Supabase URL: ✅ Set
- Supabase Key: ✅ Set
- Bucket Name: patient-reports

📦 Step 1: Listing all storage buckets...
✅ Successfully listed buckets
   Found 1 bucket(s):

   👉 patient-reports (Private)

✅ Target bucket "patient-reports" found!
   - Type: Private ✅
   - ID: xxxxx

📂 Step 2: Testing bucket access...
✅ Successfully accessed bucket

🎉 All tests passed!

✅ Your Supabase Storage is ready to use!
```

---

## ❌ अगर Error आए तो:

### Error: "Bucket not found"
**Solution**:
1. Screenshot में Save button click करें
2. Storage list में bucket दिखना चाहिए
3. फिर से test run करें

### Error: "Permission denied"
**Solution**: Policies add करने होंगे

Go to: **SQL Editor** और यह run करें:

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patient-reports');

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'patient-reports');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'patient-reports');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'patient-reports')
WITH CHECK (bucket_id = 'patient-reports');
```

---

## Step 3: Test Upload from Application

अगर test pass हो जाए, तो:

```bash
cd apps\web
npm run dev
```

1. Open: http://localhost:3000
2. Login as clinic user
3. Go to patient management
4. Upload a test report (PDF या image)
5. Success message आना चाहिए ✅

---

## Verification

Upload के बाद check करें:

### Supabase Dashboard में:
1. Storage > patient-reports
2. `reports/` folder खोलें
3. आपकी uploaded file दिखनी चाहिए

### File name format:
```
2025-10-29T14-30-00_original-filename.pdf
```

---

## तुरंत करें:

1. ✅ Save button click करें (screenshot में)
2. ✅ Test run करें: `node test-supabase-storage.js`
3. ✅ मुझे output बताएं

अगर test pass हो गया = **Connection ready!** 🚀
