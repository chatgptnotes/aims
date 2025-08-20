# 🚀 AWS DynamoDB Setup Guide for Neuro360

## Current Status
Based on the code analysis, your project is currently using **localStorage** (browser storage) instead of AWS DynamoDB because AWS credentials are not configured.

## 🔍 How to Check Current Status

### Option 1: Check Browser Console
1. Open your app: http://localhost:3005/
2. Open browser console (F12)
3. Look for these messages:
   - ✅ `AWS DynamoDB configured successfully` = AWS is connected
   - ⚠️ `AWS credentials not configured, using localStorage fallback` = Using localStorage

### Option 2: Check Environment Variables
The app checks for these environment variables:
- `VITE_AWS_REGION`
- `VITE_AWS_ACCESS_KEY_ID` 
- `VITE_AWS_SECRET_ACCESS_KEY`

## 🛠️ How to Connect AWS DynamoDB

### Step 1: Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/)
2. Create a new account (free tier available)
3. Note down your AWS Account ID

### Step 2: Create IAM User
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach these policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess` (for file uploads)

### Step 3: Get Access Keys
1. After creating the IAM user, download the CSV file
2. Note down:
   - Access Key ID
   - Secret Access Key

### Step 4: Deploy AWS Infrastructure
Run one of these commands in your project directory:

**For Windows:**
```cmd
setup-aws.bat dev
```

**For Linux/Mac:**
```bash
chmod +x setup-aws.sh
./setup-aws.sh dev
```

This will create:
- DynamoDB tables
- S3 bucket
- All required AWS resources

### Step 5: Create .env File
Create a `.env` file in your project root:

```env
# AWS Configuration
VITE_AWS_REGION=ap-south-1
VITE_AWS_ACCESS_KEY_ID=your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Table Names (optional - will use defaults)
VITE_DYNAMODB_TABLE_CLINICS=neuro360-dev-clinics
VITE_DYNAMODB_TABLE_PATIENTS=neuro360-dev-patients
VITE_DYNAMODB_TABLE_REPORTS=neuro360-dev-reports
VITE_DYNAMODB_TABLE_PAYMENTS=neuro360-dev-payments
VITE_DYNAMODB_TABLE_SUPER_ADMINS=neuro360-dev-super-admins
VITE_DYNAMODB_TABLE_SUBSCRIPTIONS=neuro360-dev-subscriptions
VITE_DYNAMODB_TABLE_USAGE=neuro360-dev-usage
```

### Step 6: Restart Development Server
```bash
npm run dev
```

## 🔍 How to Verify AWS Connection

### Check Browser Console
After setup, you should see:
```
✅ AWS DynamoDB configured successfully
🚀 Using AWS DynamoDB for data storage
```

### Test Data Storage
1. Register a new clinic or super admin
2. Check AWS DynamoDB Console
3. Go to DynamoDB → Tables → neuro360-dev-clinics
4. You should see your data there

## 📊 DynamoDB Tables Created

The setup creates these tables:
- `neuro360-dev-clinics` - Clinic information
- `neuro360-dev-patients` - Patient records
- `neuro360-dev-reports` - EEG reports
- `neuro360-dev-payments` - Payment history
- `neuro360-dev-super-admins` - Super admin accounts
- `neuro360-dev-subscriptions` - Clinic subscriptions
- `neuro360-dev-usage` - Usage tracking

## 🆘 Troubleshooting

### Issue: "DynamoDB not configured"
**Solution:** Check your `.env` file and AWS credentials

### Issue: "Access Denied"
**Solution:** Check IAM user permissions

### Issue: "Table not found"
**Solution:** Run the setup script again

### Issue: "Region not found"
**Solution:** Use a valid AWS region (e.g., ap-south-1, us-east-1)

## 💰 Cost Estimation

With AWS Free Tier:
- **DynamoDB**: 25 GB storage, 25 WCU/RCU per month = FREE
- **S3**: 5 GB storage = FREE
- **Total**: ~$0/month for development

## 🎯 Next Steps

1. **Set up AWS account** (if not done)
2. **Run setup script** to create infrastructure
3. **Create .env file** with credentials
4. **Restart server** and test registration
5. **Check AWS Console** to verify data storage

## 📞 Need Help?

If you encounter issues:
1. Check browser console for error messages
2. Verify AWS credentials are correct
3. Ensure setup script completed successfully
4. Check AWS Console for table creation

---

**Current Status:** ⚠️ Using localStorage (AWS not configured)
**Target Status:** ✅ Using AWS DynamoDB
