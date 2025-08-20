@echo off
echo ========================================
echo    AWS S3 Setup for Neuro360
echo ========================================
echo.

echo Step 1: Checking current configuration...
echo.

if exist .env (
    echo ✅ .env file found
    findstr "VITE_AWS_ACCESS_KEY_ID" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ AWS Access Key ID is configured
    ) else (
        echo ❌ AWS Access Key ID not found in .env
    )
    
    findstr "VITE_AWS_SECRET_ACCESS_KEY" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ AWS Secret Access Key is configured
    ) else (
        echo ❌ AWS Secret Access Key not found in .env
    )
    
    findstr "VITE_AWS_BUCKET_NAME" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ AWS Bucket Name is configured
    ) else (
        echo ❌ AWS Bucket Name not found in .env
    )
) else (
    echo ❌ .env file not found
    echo Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created from env.example
)

echo.
echo ========================================
echo    Setup Instructions
echo ========================================
echo.
echo 1. Go to AWS Console: https://aws.amazon.com/
echo 2. Create S3 bucket named: neuro360-reports-demo
echo 3. Create IAM user with S3 permissions
echo 4. Get Access Key ID and Secret Access Key
echo 5. Update .env file with your credentials
echo.
echo ========================================
echo    .env File Template
echo ========================================
echo.
echo Add these lines to your .env file:
echo.
echo VITE_AWS_REGION=ap-south-1
echo VITE_AWS_BUCKET_NAME=neuro360-reports-demo
echo VITE_AWS_ACCESS_KEY_ID=AKIA...YOUR_ACCESS_KEY_HERE
echo VITE_AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
echo.
echo ========================================
echo    Testing Configuration
echo ========================================
echo.
echo After updating .env file:
echo 1. Restart your application: npm run dev
echo 2. Check browser console for AWS S3 messages
echo 3. Try uploading a file to test
echo.
echo For detailed instructions, see: AWS_S3_SETUP_GUIDE.md
echo.
pause
