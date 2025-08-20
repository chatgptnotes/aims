# 🚀 AWS S3 Setup Guide - Patient Reports Storage

## 📋 Overview
This guide will help you configure AWS S3 to store patient reports in your Neuro360 application.

## 🔧 Step 1: AWS Account Setup

### 1.1 Create AWS Account
- Go to [AWS Console](https://aws.amazon.com/)
- Sign up for a new account (if you don't have one)
- Complete the registration process

### 1.2 Create S3 Bucket
1. **Login to AWS Console**
2. **Go to S3 Service**
3. **Click "Create bucket"**
4. **Bucket Configuration:**
   ```
   Bucket name: neuro360-reports-demo
   Region: ap-south-1 (Mumbai)
   ```
5. **Block Public Access Settings:**
   - ✅ Block all public access (keep checked for security)
6. **Click "Create bucket"**

## 🔑 Step 2: Create IAM User & Access Keys

### 2.1 Create IAM User
1. **Go to IAM Service** in AWS Console
2. **Click "Users" → "Add user"**
3. **User Details:**
   ```
   User name: neuro360-s3-user
   Access type: Programmatic access
   ```
4. **Click "Next: Permissions"**

### 2.2 Attach S3 Policy
1. **Click "Attach existing policies directly"**
2. **Search for "S3"**
3. **Select "AmazonS3FullAccess"** (or create custom policy for better security)
4. **Click "Next: Tags" → "Next: Review" → "Create user"**

### 2.3 Get Access Keys
1. **After creating user, click "Show" next to Secret access key**
2. **Copy both:**
   - Access Key ID (starts with AKIA...)
   - Secret Access Key (long string)

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Create .env File
Create a `.env` file in your project root:

```env
# AWS S3 Configuration
VITE_AWS_REGION=ap-south-1
VITE_AWS_BUCKET_NAME=neuro360-reports-demo
VITE_AWS_ACCESS_KEY_ID=AKIA...YOUR_ACCESS_KEY_HERE
VITE_AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE

# Other configurations...
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Neuro360
VITE_APP_URL=http://localhost:3000
```

### 3.2 Important Security Notes
- ✅ **NEVER commit .env file to git**
- ✅ **Add .env to .gitignore**
- ✅ **Keep your access keys secure**

## 🔒 Step 4: S3 Bucket Security (Optional but Recommended)

### 4.1 Create Custom IAM Policy
For better security, create a custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::neuro360-reports-demo",
                "arn:aws:s3:::neuro360-reports-demo/*"
            ]
        }
    ]
}
```

### 4.2 Bucket CORS Configuration
Add CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        "ExposeHeaders": []
    }
]
```

## 🧪 Step 5: Test Configuration

### 5.1 Restart Your Application
```bash
npm run dev
```

### 5.2 Check Console Logs
Look for these messages in browser console:
- ✅ "Real AWS S3 client initialized successfully"
- ❌ "AWS credentials not configured - using mock S3 service"

### 5.3 Test File Upload
1. **Login to your clinic account**
2. **Go to Patient Management**
3. **Upload a test PDF file**
4. **Check if file appears in AWS S3 bucket**

## 🔍 Step 6: Verify S3 Storage

### 6.1 Check AWS S3 Console
1. **Go to S3 Console**
2. **Click on your bucket: `neuro360-reports-demo`**
3. **Look for uploaded files in `reports/` folder**

### 6.2 File Structure
Your files will be stored as:
```
neuro360-reports-demo/
├── reports/
│   ├── 2024-01-15T10-30-45-123Z_sample_report.pdf
│   ├── 2024-01-15T11-15-22-456Z_patient_report.pdf
│   └── ...
```

## 🚨 Troubleshooting

### Problem: "AWS credentials not configured"
**Solution:** Check your `.env` file and make sure:
- Access Key ID starts with `AKIA`
- Secret Access Key is at least 40 characters
- No extra spaces or quotes

### Problem: "Access Denied" error
**Solution:** 
1. Check IAM user permissions
2. Verify bucket name is correct
3. Ensure region matches

### Problem: CORS error
**Solution:**
1. Add CORS configuration to S3 bucket
2. Check allowed origins in CORS policy

## 📊 Monitoring

### Check Upload Status
- **Browser Console:** Look for "✅ File uploaded successfully to S3"
- **S3 Console:** Check bucket contents
- **Application:** Files should show with cloud icon (☁️)

### File Access
- **Download:** Files can be downloaded from patient management
- **Security:** Files are private by default
- **URLs:** Signed URLs are generated for secure access

## 🔄 Migration from Mock to Real S3

If you have existing files in localStorage:
1. **Export data** from localStorage
2. **Upload files** to S3 bucket
3. **Update database records** with S3 keys

## 📞 Support

If you encounter issues:
1. **Check AWS Console** for error messages
2. **Verify credentials** in .env file
3. **Test with AWS CLI** if needed
4. **Check browser console** for detailed errors

---

**🎉 Congratulations!** Your patient reports will now be stored securely in AWS S3 bucket.
