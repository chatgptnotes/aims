# Storage Buckets Setup Guide - Supabase

## Error Samajhte Hain

```
Error: StorageApiError: new row violates row-level security policy
```

**Problem**: Bucket create karne ke liye:
- Service role key chahiye (security risk)
- Ya manual creation via Dashboard

**Solution**: Manually Dashboard se buckets create karo

---

## Why This Error Happens?

```
Code trying to create bucket using Anon Key:
   ↓
Supabase Security: ❌ Not Allowed!
   ↓
RLS Policy blocks the request
   ↓
Error: 400 Bad Request
```

**Fix**: Use Supabase Dashboard (has admin access)

---

## Step-by-Step Guide

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Login
3. Select your project: **AIMS**

### Step 2: Navigate to Storage

```
Dashboard
   → Left Sidebar
      → Storage (📦 icon)
```

You'll see the Storage page.

### Step 3: Create First Bucket - "eeg-files"

1. Click: **"New bucket"** button (top right)
2. A popup will appear
3. Fill in:
   ```
   Name: eeg-files
   Public bucket: ❌ (keep it OFF - private)
   File size limit: 100 MB
   Allowed MIME types: (leave empty for all)
   ```
4. Click: **"Create bucket"**

### Step 4: Create Second Bucket - "reports"

1. Click: **"New bucket"** button again
2. Fill in:
   ```
   Name: reports
   Public bucket: ❌ (OFF)
   File size limit: 50 MB
   ```
3. Click: **"Create bucket"**

### Step 5: Create Third Bucket - "protocols"

1. Click: **"New bucket"** button again
2. Fill in:
   ```
   Name: protocols
   Public bucket: ❌ (OFF)
   File size limit: 10 MB
   ```
3. Click: **"Create bucket"**

### Step 6: Create Fourth Bucket - "backups"

1. Click: **"New bucket"** button again
2. Fill in:
   ```
   Name: backups
   Public bucket: ❌ (OFF)
   File size limit: 500 MB
   ```
3. Click: **"Create bucket"**

### Step 7: Verify All Buckets Created

You should now see 4 buckets:
- ✅ eeg-files
- ✅ reports
- ✅ protocols
- ✅ backups

---

## Step 8: Set RLS Policies (IMPORTANT!)

### Option A: Via UI (Easier)

For each bucket:

1. Click on bucket name (e.g., "eeg-files")
2. Go to **"Policies"** tab
3. Click **"New policy"**
4. Choose: **"Custom policy"**
5. Fill in:
   ```
   Policy name: Allow authenticated users full access
   Target roles: authenticated

   SELECT: ✅ Enabled
   INSERT: ✅ Enabled
   UPDATE: ✅ Enabled
   DELETE: ✅ Enabled

   USING expression: true
   WITH CHECK expression: true
   ```
6. Click: **"Save policy"**

Repeat for all 4 buckets.

### Option B: Via SQL (Faster)

1. Go to: **SQL Editor**
2. Copy this SQL:

```sql
-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for INSERT (upload)
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('eeg-files', 'reports', 'protocols', 'backups')
);

-- Policy for SELECT (download)
CREATE POLICY "Allow authenticated users to download"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('eeg-files', 'reports', 'protocols', 'backups')
);

-- Policy for UPDATE
CREATE POLICY "Allow authenticated users to update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('eeg-files', 'reports', 'protocols', 'backups')
);

-- Policy for DELETE
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('eeg-files', 'reports', 'protocols', 'backups')
);
```

3. Click: **"Run"**
4. Should show: ✅ Success

---

## Verification

### Check 1: Buckets Exist

```sql
-- Run in SQL Editor
SELECT id, name, public, created_at
FROM storage.buckets
WHERE name IN ('eeg-files', 'reports', 'protocols', 'backups');
```

Should return 4 rows.

### Check 2: RLS Policies Applied

```sql
-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

Should show your policies.

### Check 3: Test from App

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Check console - should see:
   ```
   ☁️ All required storage buckets are available
   ☁️ Cloud storage initialized successfully
   ```

3. ❌ Should NOT see:
   ```
   POST https://...supabase.co/storage/v1/bucket 400
   Failed to create bucket protocols: StorageApiError
   ```

---

## Alternative: Simpler Approach

Agar buckets nahi chahiye abhi, toh code already update ho gaya hai:
- ✅ Error nahi aayega
- ✅ Local storage use karega
- ✅ Console warning show karega

App kaam karega without buckets!

---

## When Do You Need Buckets?

Buckets chahiye jab:
1. ✅ File upload feature use karna ho (EEG files, reports)
2. ✅ Cloud backup chahiye
3. ✅ Multiple users ke files store karne hain
4. ✅ Large files handle karne hain

Agar simple testing kar rahe ho:
- ❌ Buckets optional hain
- ✅ App work karega without them

---

## Bucket Configuration Details

| Bucket Name | Purpose | Size Limit | Public |
|-------------|---------|------------|--------|
| eeg-files | EEG/EDF files storage | 100 MB | No |
| reports | Generated reports (PDF) | 50 MB | No |
| protocols | Treatment protocols | 10 MB | No |
| backups | System backups | 500 MB | No |

---

## Common Issues

### Issue 1: "New bucket" button not visible

**Solution**:
- Check if you're in Storage section
- Check if you have admin access to project

### Issue 2: Bucket creation fails

**Solution**:
- Check bucket name (lowercase, no spaces)
- Check project has storage enabled

### Issue 3: RLS policy error when uploading

**Solution**:
- Run the SQL policies (Step 8)
- Check user is authenticated
- Check bucket name is correct

---

## Quick Summary

**If you want cloud storage:**
1. Create 4 buckets via Dashboard
2. Set RLS policies via SQL
3. Restart app
4. Test file upload

**If you don't need it yet:**
1. Do nothing
2. App will use local storage
3. No errors will show
4. Create buckets later when needed

---

## Current Status

✅ **Code Fixed**: App won't try to create buckets
✅ **Error Removed**: 400 Bad Request gone
✅ **Graceful Fallback**: Uses local storage if no buckets
ℹ️  **Optional**: Create buckets when you need cloud storage

---

**Recommendation**: Abhi ke liye buckets create karne ki zarurat nahi hai. App bina buckets ke kaam karega. Jab file upload feature test karna ho, tab create kar lena.
