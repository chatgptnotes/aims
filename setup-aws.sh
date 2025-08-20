#!/bin/bash

# Neuro360 AWS Infrastructure Setup Script
# This script helps you set up DynamoDB tables and S3 bucket for your project

set -e

echo "🧠 Neuro360 AWS Infrastructure Setup"
echo "====================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run:"
    echo "   aws configure"
    exit 1
fi

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: $ACCOUNT_ID"

# Get region
REGION=${AWS_DEFAULT_REGION:-$(aws configure get region)}
if [ -z "$REGION" ]; then
    echo "❌ AWS region not configured. Please set AWS_DEFAULT_REGION or run aws configure"
    exit 1
fi
echo "✅ AWS Region: $REGION"

# Set environment
ENVIRONMENT=${1:-dev}
echo "✅ Environment: $ENVIRONMENT"

# Stack name
STACK_NAME="neuro360-infrastructure-$ENVIRONMENT"

echo ""
echo "🚀 Deploying CloudFormation stack..."

# Deploy CloudFormation stack
aws cloudformation deploy \
    --template-file aws-infrastructure.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM \
    --region $REGION

echo ""
echo "✅ CloudFormation stack deployed successfully!"

# Get stack outputs
echo ""
echo "📋 Getting stack outputs..."

S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

CLINICS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ClinicsTableName`].OutputValue' \
    --output text)

PATIENTS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`PatientsTableName`].OutputValue' \
    --output text)

REPORTS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ReportsTableName`].OutputValue' \
    --output text)

PAYMENTS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`PaymentsTableName`].OutputValue' \
    --output text)

SUPER_ADMINS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`SuperAdminsTableName`].OutputValue' \
    --output text)

SUBSCRIPTIONS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`SubscriptionsTableName`].OutputValue' \
    --output text)

USAGE_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UsageTableName`].OutputValue' \
    --output text)

IAM_USER=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`IAMUserName`].OutputValue' \
    --output text)

# Create access keys for the IAM user
echo ""
echo "🔑 Creating access keys for IAM user..."

ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name $IAM_USER --region $REGION)
ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

echo ""
echo "✅ AWS Infrastructure Setup Complete!"
echo "====================================="
echo ""
echo "📁 S3 Bucket: $S3_BUCKET"
echo "🗄️  DynamoDB Tables:"
echo "   - Clinics: $CLINICS_TABLE"
echo "   - Patients: $PATIENTS_TABLE"
echo "   - Reports: $REPORTS_TABLE"
echo "   - Payments: $PAYMENTS_TABLE"
echo "   - Super Admins: $SUPER_ADMINS_TABLE"
echo "   - Subscriptions: $SUBSCRIPTIONS_TABLE"
echo "   - Usage: $USAGE_TABLE"
echo ""
echo "🔑 IAM User: $IAM_USER"
echo "   Access Key ID: $ACCESS_KEY_ID"
echo "   Secret Access Key: $SECRET_ACCESS_KEY"
echo ""
echo "📝 Next Steps:"
echo "1. Create a .env file in your project root with these values:"
echo ""
echo "VITE_AWS_REGION=$REGION"
echo "VITE_AWS_BUCKET_NAME=$S3_BUCKET"
echo "VITE_AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
echo "VITE_AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
echo "VITE_DYNAMODB_TABLE_CLINICS=$CLINICS_TABLE"
echo "VITE_DYNAMODB_TABLE_PATIENTS=$PATIENTS_TABLE"
echo "VITE_DYNAMODB_TABLE_REPORTS=$REPORTS_TABLE"
echo "VITE_DYNAMODB_TABLE_PAYMENTS=$PAYMENTS_TABLE"
echo "VITE_DYNAMODB_TABLE_SUPER_ADMINS=$SUPER_ADMINS_TABLE"
echo "VITE_DYNAMODB_TABLE_SUBSCRIPTIONS=$SUBSCRIPTIONS_TABLE"
echo "VITE_DYNAMODB_TABLE_USAGE=$USAGE_TABLE"
echo ""
echo "2. Install dependencies: npm install"
echo "3. Start the development server: npm run dev"
echo ""
echo "⚠️  IMPORTANT: Keep your AWS credentials secure and never commit them to version control!"
echo ""
echo "🎉 Your Neuro360 project is now ready to use AWS DynamoDB and S3!"


