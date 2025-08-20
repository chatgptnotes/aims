# 🔧 AWS Credentials Fix Guide

## 🚨 Current Error
```
InvalidSignatureException: The request signature we calculated does not match the signature you provided. Check your AWS Secret Access Key and signing method.
```

## 🔍 Root Cause
Your app is trying to connect to AWS DynamoDB with **incorrect credentials**. The error shows:
- Region: `eu-north-1` 
- Status: `400 Bad Request`
- Issue: Invalid signature (wrong Access Key ID or Secret Access Key)

## 🛠️ Quick Fix Options

### Option 1: Use localStorage Only (Temporary Fix)
**For immediate testing, disable AWS completely:**

1. **Create a `.env` file** in your project root with:
```env
VITE_AWS_ACCESS_KEY_ID=demo_access_key
VITE_AWS_SECRET_ACCESS_KEY=demo_secret_key
VITE_AWS_REGION=ap-south-1
```

2. **Restart your development server:**
```bash
npm run dev
```

3. **Check browser console** - you should see:
```
⚠️ AWS credentials not configured, using localStorage fallback
```

### Option 2: Fix AWS Credentials (Permanent Fix)

#### Step 1: Get Real AWS Credentials
1. Go to [AWS Console](https://aws.amazon.com/)
2. Create IAM User with these permissions:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
3. Download the CSV file with Access Key ID and Secret Access Key

#### Step 2: Create Proper .env File
```env
# AWS Configuration
VITE_AWS_REGION=ap-south-1
VITE_AWS_ACCESS_KEY_ID=AKIA...your_real_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_real_secret_key

# DynamoDB Tables
VITE_DYNAMODB_TABLE_CLINICS=neuro360-dev-clinics
VITE_DYNAMODB_TABLE_PATIENTS=neuro360-dev-patients
VITE_DYNAMODB_TABLE_REPORTS=neuro360-dev-reports
VITE_DYNAMODB_TABLE_PAYMENTS=neuro360-dev-payments
VITE_DYNAMODB_TABLE_SUPER_ADMINS=neuro360-dev-super-admins
VITE_DYNAMODB_TABLE_SUBSCRIPTIONS=neuro360-dev-subscriptions
VITE_DYNAMODB_TABLE_USAGE=neuro360-dev-usage
```

#### Step 3: Deploy AWS Infrastructure
```bash
# For Windows
setup-aws.bat dev

# For Linux/Mac
./setup-aws.sh dev
```

#### Step 4: Restart Server
```bash
npm run dev
```

## 🔍 How to Verify Fix

### Check Browser Console
**After fix, you should see:**
- ✅ `AWS DynamoDB configured successfully` (if using real AWS)
- ⚠️ `AWS credentials not configured, using localStorage fallback` (if using localStorage)

### Test Registration
1. Go to http://localhost:3006/register
2. Try registering a new account
3. Check if the error is gone

## 🎯 Recommended Action

**For immediate testing:** Use Option 1 (localStorage)
**For production:** Use Option 2 (real AWS credentials)

## 📞 Need Help?

If you still get errors:
1. Check browser console for new error messages
2. Verify your `.env` file is in the project root
3. Make sure you restarted the development server
4. Clear browser cache and try again

---

**Current Status:** ❌ AWS Connection Failed (InvalidSignatureException)
**Target Status:** ✅ Working (localStorage or AWS)
