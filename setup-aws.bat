@echo off
setlocal enabledelayedexpansion

echo 🧠 Neuro360 AWS Infrastructure Setup
echo =====================================

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS CLI is not installed. Please install it first:
    echo    https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
    pause
    exit /b 1
)

REM Check if AWS credentials are configured
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS credentials not configured. Please run:
    echo    aws configure
    pause
    exit /b 1
)

REM Get AWS account ID
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
echo ✅ AWS Account ID: %ACCOUNT_ID%

REM Get region
for /f "tokens=*" %%i in ('aws configure get region') do set REGION=%%i
if "%REGION%"=="" (
    echo ❌ AWS region not configured. Please set AWS_DEFAULT_REGION or run aws configure
    pause
    exit /b 1
)
echo ✅ AWS Region: %REGION%

REM Set environment
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=dev
echo ✅ Environment: %ENVIRONMENT%

REM Stack name
set STACK_NAME=neuro360-infrastructure-%ENVIRONMENT%

echo.
echo 🚀 Deploying CloudFormation stack...

REM Deploy CloudFormation stack
aws cloudformation deploy --template-file aws-infrastructure.yaml --stack-name %STACK_NAME% --parameter-overrides Environment=%ENVIRONMENT% --capabilities CAPABILITY_IAM --region %REGION%

if errorlevel 1 (
    echo ❌ Failed to deploy CloudFormation stack
    pause
    exit /b 1
)

echo.
echo ✅ CloudFormation stack deployed successfully!

REM Get stack outputs
echo.
echo 📋 Getting stack outputs...

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text') do set S3_BUCKET=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='ClinicsTableName'].OutputValue" --output text') do set CLINICS_TABLE=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='PatientsTableName'].OutputValue" --output text') do set PATIENTS_TABLE=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='ReportsTableName'].OutputValue" --output text') do set REPORTS_TABLE=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='PaymentsTableName'].OutputValue" --output text') do set PAYMENTS_TABLE=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='SuperAdminsTableName'].OutputValue" --output text') do set SUPER_ADMINS_TABLE=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='SubscriptionsTableName'].OutputValue" --output text') do set SUBSCRIPTIONS_TABLE=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='UsageTableName'].OutputValue" --output text') do set USAGE_TABLE=%%i

for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey=='IAMUserName'].OutputValue" --output text') do set IAM_USER=%%i

REM Create access keys for the IAM user
echo.
echo 🔑 Creating access keys for IAM user...

for /f "tokens=*" %%i in ('aws iam create-access-key --user-name %IAM_USER% --region %REGION% --query "AccessKey.AccessKeyId" --output text') do set ACCESS_KEY_ID=%%i

for /f "tokens=*" %%i in ('aws iam create-access-key --user-name %IAM_USER% --region %REGION% --query "AccessKey.SecretAccessKey" --output text') do set SECRET_ACCESS_KEY=%%i

echo.
echo ✅ AWS Infrastructure Setup Complete!
echo =====================================
echo.
echo 📁 S3 Bucket: %S3_BUCKET%
echo 🗄️  DynamoDB Tables:
echo    - Clinics: %CLINICS_TABLE%
echo    - Patients: %PATIENTS_TABLE%
echo    - Reports: %REPORTS_TABLE%
echo    - Payments: %PAYMENTS_TABLE%
echo    - Super Admins: %SUPER_ADMINS_TABLE%
echo    - Subscriptions: %SUBSCRIPTIONS_TABLE%
echo    - Usage: %USAGE_TABLE%
echo.
echo 🔑 IAM User: %IAM_USER%
echo    Access Key ID: %ACCESS_KEY_ID%
echo    Secret Access Key: %SECRET_ACCESS_KEY%
echo.
echo 📝 Next Steps:
echo 1. Create a .env file in your project root with these values:
echo.
echo VITE_AWS_REGION=%REGION%
echo VITE_AWS_BUCKET_NAME=%S3_BUCKET%
echo VITE_AWS_ACCESS_KEY_ID=%ACCESS_KEY_ID%
echo VITE_AWS_SECRET_ACCESS_KEY=%SECRET_ACCESS_KEY%
echo VITE_DYNAMODB_TABLE_CLINICS=%CLINICS_TABLE%
echo VITE_DYNAMODB_TABLE_PATIENTS=%PATIENTS_TABLE%
echo VITE_DYNAMODB_TABLE_REPORTS=%REPORTS_TABLE%
echo VITE_DYNAMODB_TABLE_PAYMENTS=%PAYMENTS_TABLE%
echo VITE_DYNAMODB_TABLE_SUPER_ADMINS=%SUPER_ADMINS_TABLE%
echo VITE_DYNAMODB_TABLE_SUBSCRIPTIONS=%SUBSCRIPTIONS_TABLE%
echo VITE_DYNAMODB_TABLE_USAGE=%USAGE_TABLE%
echo.
echo 2. Install dependencies: npm install
echo 3. Start the development server: npm run dev
echo.
echo ⚠️  IMPORTANT: Keep your AWS credentials secure and never commit them to version control!
echo.
echo 🎉 Your Neuro360 project is now ready to use AWS DynamoDB and S3!

pause






