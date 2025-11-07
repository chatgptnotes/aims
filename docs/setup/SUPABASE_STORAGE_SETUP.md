# Supabase Storage Setup Instructions

## Overview
This project has been migrated from AWS S3 to Supabase Storage. Follow these steps to create and configure the required storage bucket.

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://app.supabase.com/project/omyltmcesgbhnqmhrrvq
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket** (or **New bucket**)
4. Configure the bucket:
   - **Name**: `patient-reports` (MUST be exactly this name)
   - **Public bucket**: `No` / OFF (Keep it private for security)
   - **File size limit**: `200 MB` or leave default
   - **Restrict MIME types**: `Yes` / ON (recommended)
   - **Allowed MIME types**: Add these (comma-separated):
     ```
     application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, image/gif, application/octet-stream
     ```

5. Click **Save** or **Create bucket**
6. **IMPORTANT**: Verify the bucket appears in your Storage list after creation

## Step 2: Set Up Storage Policies (RLS)

After creating the bucket, you need to set up Row Level Security (RLS) policies to control access:

### Policy 1: Allow authenticated users to upload files
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-reports'
);
```

### Policy 2: Allow authenticated users to read their files
```sql
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-reports'
);
```

### Policy 3: Allow authenticated users to delete their files
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-reports'
);
```

### Policy 4: Allow authenticated users to update file metadata
```sql
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patient-reports'
)
WITH CHECK (
  bucket_id = 'patient-reports'
);
```

## Step 3: Configure Bucket Settings (Optional)

In the Supabase Dashboard, you can configure additional settings:

1. Go to **Storage** > **patient-reports** bucket
2. Click on the **Settings** tab
3. Configure:
   - **File size limit**: 200 MB (adjust as needed)
   - **Allowed MIME types**:
     - `application/pdf`
     - `image/jpeg`
     - `image/png`
     - `application/octet-stream` (for .edf files)

## Step 4: Verify Storage Service

After creating the bucket, test the storage service:

1. Run `npm install` to ensure all dependencies are installed
2. Start the development server: `npm run dev`
3. Try uploading a test file through the application
4. Check the Supabase Storage dashboard to verify the file was uploaded

## Bucket Structure

Files will be organized in the following structure:
```
patient-reports/
├── reports/
│   ├── {timestamp}_{filename}
│   └── ...
└── edf-files/
    ├── {clinicId}/
    │   ├── {patientId}/
    │   │   ├── {filename}
    │   │   └── ...
    │   └── ...
    └── ...
```

## Migration Notes

### What Changed:
- ✅ Removed all AWS SDK dependencies (@aws-sdk/*)
- ✅ Deleted `awsS3Service.js` and `dynamoService.js`
- ✅ Created new `storageService.js` for Supabase Storage
- ✅ Updated all file upload/download operations to use Supabase
- ✅ Updated environment variables

### Database Fields Updated:
Old AWS fields have been replaced with Supabase equivalents:
- `s3Key` → `storagePath`
- `s3Bucket` → `storageBucket`
- `s3Region` → (removed)
- `s3FileName` → `storageFileName`
- `s3UploadedAt` → `storageUploadedAt`
- `s3ETag` → (removed)
- `s3Url` → maintained as `fileUrl`

The code maintains backward compatibility by checking for both old and new field names.

## Troubleshooting

### Bucket Not Found Error
If you see "Bucket 'patient-reports' not found":
1. Verify the bucket name is exactly `patient-reports` (case-sensitive)
2. Check that you created it in the correct Supabase project
3. Ensure your Supabase credentials in `.env` are correct

### Permission Denied Error
If uploads fail with permission errors:
1. Check that RLS policies are properly configured
2. Verify the user is authenticated before uploading
3. Check the browser console for detailed error messages

### File Upload Fails
If file uploads fail:
1. Check file size (must be under 200MB by default)
2. Verify file type is allowed
3. Check network connectivity to Supabase
4. Review browser console for detailed error messages

## Support

For issues with Supabase Storage, refer to:
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage API Reference](https://supabase.com/docs/reference/javascript/storage)
