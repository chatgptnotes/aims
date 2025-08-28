# 🔧 AWS IAM Permissions Fix

## 🚨 Current Error
```
AccessDeniedException: User: arn:aws:iam::068882398356:user/neurosense-s3-user is not authorized to perform: dynamodb:Scan
```

## 🔍 Root Cause
Your IAM user `neurosense-s3-user` only has S3 permissions but **lacks DynamoDB permissions**.

## 🛠️ Quick Fix Options

### Option 1: Add DynamoDB Permissions to Existing User (Recommended)

1. **Go to AWS IAM Console:**
   - Open [AWS IAM Console](https://console.aws.amazon.com/iam/)
   - Navigate to Users → neurosense-s3-user

2. **Add DynamoDB Policy:**
   - Click on the user
   - Go to "Permissions" tab
   - Click "Add permissions" → "Attach policies directly"
   - Search for and select: `AmazonDynamoDBFullAccess`
   - Click "Next" → "Add permissions"

3. **Verify Permissions:**
   - The user should now have both S3 and DynamoDB access
   - Wait 1-2 minutes for permissions to propagate

### Option 2: Create New IAM User with Full Permissions

1. **Create New IAM User:**
   - Go to IAM Console → Users → "Create user"
   - Name: `neurosense-full-access`
   - Access type: Programmatic access

2. **Attach Policies:**
   - `AmazonS3FullAccess`
   - `AmazonDynamoDBFullAccess`

3. **Update .env File:**
   ```env
   VITE_AWS_ACCESS_KEY_ID=NEW_ACCESS_KEY_ID
   VITE_AWS_SECRET_ACCESS_KEY=NEW_SECRET_ACCESS_KEY
   VITE_AWS_REGION=ap-south-1
   ```

### Option 3: Use localStorage Only (Temporary Fix)

If you want to test immediately without fixing AWS:

1. **Create .env file with demo credentials:**
   ```env
   VITE_AWS_ACCESS_KEY_ID=demo_access_key
   VITE_AWS_SECRET_ACCESS_KEY=demo_secret_key
   VITE_AWS_REGION=ap-south-1
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

## 🔍 How to Verify Fix

### Check Browser Console
**After fix, you should see:**
- ✅ `AWS DynamoDB configured successfully`
- ✅ `Using AWS DynamoDB for data storage`
- ❌ No more "AccessDeniedException" errors

### Test Registration
1. Clear existing data using `clear-localstorage.html`
2. Try registering a new super admin
3. Check if data appears in AWS DynamoDB Console

## 📊 AWS Console Verification

1. **Go to DynamoDB Console:**
   - [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
   - Region: ap-south-1
   - Tables: neuro360-dev-clinics

2. **Check for Data:**
   - Click on "neuro360-dev-clinics" table
   - Go to "Explore table data"
   - You should see your registered super admin

## 🎯 Recommended Action

**For immediate fix:** Use Option 1 (add DynamoDB permissions)
**For testing:** Use Option 3 (localStorage only)

## 📞 Need Help?

If you still get errors:
1. Check IAM user permissions in AWS Console
2. Verify the user has both S3 and DynamoDB policies
3. Wait 2-3 minutes after adding permissions
4. Clear browser cache and try again

---

**Current Status:** ❌ AWS DynamoDB Access Denied
**Target Status:** ✅ AWS DynamoDB Working





