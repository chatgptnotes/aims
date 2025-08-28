# 🧠 Neuro360 AWS Setup Guide

This guide will help you connect your Neuro360 project to AWS DynamoDB and S3 for production-ready data storage.

## 📋 Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI
3. **Node.js**: Version 16 or higher
4. **npm**: For installing dependencies

## 🚀 Quick Setup (Automated)

### Option 1: Using the Setup Script (Recommended)

#### For Linux/Mac:
```bash
# Make the script executable
chmod +x setup-aws.sh

# Run the setup script
./setup-aws.sh dev
```

#### For Windows:
```cmd
# Run the batch file
setup-aws.bat dev
```

The script will:
- ✅ Deploy CloudFormation stack with all required resources
- ✅ Create DynamoDB tables
- ✅ Create S3 bucket
- ✅ Create IAM user with proper permissions
- ✅ Generate access keys
- ✅ Output all configuration values

### Option 2: Manual Setup

If you prefer to set up manually, follow these steps:

## 🔧 Manual Setup Steps

### Step 1: Install AWS CLI

**Windows:**
```cmd
# Download and install from AWS website
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
```

**Linux/Mac:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Step 2: Configure AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `ap-south-1`)
- Default output format (`json`)

### Step 3: Deploy Infrastructure

```bash
# Deploy CloudFormation stack
aws cloudformation deploy \
    --template-file aws-infrastructure.yaml \
    --stack-name neuro360-infrastructure-dev \
    --parameter-overrides Environment=dev \
    --capabilities CAPABILITY_IAM \
    --region ap-south-1
```

### Step 4: Get Resource Names

```bash
# Get S3 bucket name
aws cloudformation describe-stacks \
    --stack-name neuro360-infrastructure-dev \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text

# Get DynamoDB table names
aws cloudformation describe-stacks \
    --stack-name neuro360-infrastructure-dev \
    --query 'Stacks[0].Outputs[?OutputKey==`ClinicsTableName`].OutputValue' \
    --output text
```

### Step 5: Create IAM Access Keys

```bash
# Get IAM user name
IAM_USER=$(aws cloudformation describe-stacks \
    --stack-name neuro360-infrastructure-dev \
    --query 'Stacks[0].Outputs[?OutputKey==`IAMUserName`].OutputValue' \
    --output text)

# Create access keys
aws iam create-access-key --user-name $IAM_USER
```

## 📝 Environment Configuration

Create a `.env` file in your project root with the following values:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# OAuth Configuration (Optional - for production)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# App Configuration
VITE_APP_NAME=Neuro360
VITE_APP_URL=http://localhost:3000

# AWS (S3) Configuration
VITE_AWS_REGION=ap-south-1
VITE_AWS_BUCKET_NAME=your-s3-bucket-name
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key

# AWS DynamoDB Configuration
VITE_DYNAMODB_TABLE_CLINICS=neuro360-dev-clinics
VITE_DYNAMODB_TABLE_PATIENTS=neuro360-dev-patients
VITE_DYNAMODB_TABLE_REPORTS=neuro360-dev-reports
VITE_DYNAMODB_TABLE_PAYMENTS=neuro360-dev-payments
VITE_DYNAMODB_TABLE_SUPER_ADMINS=neuro360-dev-super-admins
VITE_DYNAMODB_TABLE_SUBSCRIPTIONS=neuro360-dev-subscriptions
VITE_DYNAMODB_TABLE_USAGE=neuro360-dev-usage
```

## 🗄️ DynamoDB Tables Structure

The following tables will be created:

### 1. `clinics` Table
```json
{
  "id": "clinic_001",
  "name": "NeuroCare Clinic",
  "email": "admin@neurocare.com",
  "password": "hashed_password",
  "role": "clinic_admin",
  "isActive": true,
  "reportsUsed": 5,
  "reportsAllowed": 50,
  "subscriptionStatus": "active",
  "trialStartDate": "2024-01-15T10:00:00Z",
  "trialEndDate": "2024-02-15T10:00:00Z",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 2. `patients` Table
```json
{
  "id": "patient_001",
  "clinicId": "clinic_001",
  "name": "John Doe",
  "age": 45,
  "gender": "male",
  "notes": "Patient notes here",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 3. `reports` Table
```json
{
  "id": "report_001",
  "clinicId": "clinic_001",
  "patientId": "patient_001",
  "fileName": "john_doe_eeg_report.pdf",
  "s3Key": "reports/2024-01-15T10-30-45Z_john_doe_eeg_report.pdf",
  "fileType": "application/pdf",
  "fileSize": "2.5MB",
  "uploadedAt": "2024-01-15T10:30:45Z"
}
```

### 4. `payments` Table
```json
{
  "id": "payment_001",
  "clinicId": "clinic_001",
  "amount": 999,
  "stripePaymentId": "pi_1234567890",
  "packageName": "Basic Package",
  "reportsAdded": 10,
  "createdAt": "2024-01-15T09:00:00Z"
}
```

## 📁 S3 Bucket Structure

Files will be stored in the following structure:

```
your-s3-bucket/
├── reports/
│   ├── 2024-01-15T10-30-45Z_patient1_report.pdf
│   ├── 2024-01-15T11-20-30Z_patient2_eeg.edf
│   └── 2024-01-16T09-15-22Z_patient3_report.pdf
└── public/
    └── hero-brain.png
```

## 🔐 Security Features

- **S3 Bucket**: Private by default, files accessed via signed URLs
- **DynamoDB**: Encrypted at rest
- **IAM**: Least privilege access
- **CloudFormation**: Infrastructure as code for reproducibility

## 💰 Cost Estimation

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| S3 Storage | 1GB | ~$0.023 |
| S3 Requests | 10,000 | ~$0.40 |
| DynamoDB | 25 WCU/25 RCU | ~$1.25 |
| **Total** | **~$1.67/month** |

## 🧪 Testing the Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test File Upload
1. Go to Admin Panel
2. Navigate to Patient Reports
3. Upload a PDF or EDF file
4. Check S3 bucket for the uploaded file

### 4. Test Database Operations
1. Create a new clinic
2. Add a patient
3. Check DynamoDB tables for the new records

## 🔄 Migration from localStorage

The project automatically falls back to localStorage if AWS credentials are not configured. To migrate existing data:

1. **Export localStorage data**:
```javascript
// In browser console
const clinics = JSON.parse(localStorage.getItem('clinics'));
const patients = JSON.parse(localStorage.getItem('patients'));
const reports = JSON.parse(localStorage.getItem('reports'));
console.log(JSON.stringify({ clinics, patients, reports }, null, 2));
```

2. **Import to DynamoDB** (using AWS CLI or DynamoDB console)

## 🚨 Troubleshooting

### Common Issues:

1. **"Access Denied" errors**:
   - Check IAM permissions
   - Verify access keys are correct
   - Ensure region matches

2. **"Table not found" errors**:
   - Verify table names in .env file
   - Check if CloudFormation deployment completed

3. **"Invalid credentials" errors**:
   - Regenerate access keys
   - Check AWS CLI configuration

### Debug Commands:

```bash
# Check AWS identity
aws sts get-caller-identity

# List DynamoDB tables
aws dynamodb list-tables

# List S3 buckets
aws s3 ls

# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name neuro360-infrastructure-dev
```

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure AWS resources are properly deployed
4. Check AWS CloudWatch logs for detailed error information

## 🎉 Next Steps

After successful setup:

1. **Deploy to Production**: Update environment variables for production
2. **Set up Monitoring**: Configure CloudWatch alarms
3. **Backup Strategy**: Set up automated backups
4. **Security Review**: Conduct security audit
5. **Performance Optimization**: Monitor and optimize queries

---

**🎯 Your Neuro360 project is now ready for production with AWS!**






