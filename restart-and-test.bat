@echo off
echo.
echo ===============================================================================
echo     RESTARTING DEV SERVER - Fresh Environment Variables
echo ===============================================================================
echo.

echo Step 1: Killing any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Verifying Razorpay credentials...
node verify-razorpay-config.js

echo.
echo Step 3: Starting fresh dev server...
echo.
echo ⚠️  IMPORTANT: After server starts:
echo    1. Open browser in INCOGNITO/PRIVATE mode
echo    2. Or clear browser cache (Ctrl+Shift+Delete)
echo    3. This ensures fresh JavaScript is loaded
echo.
echo Starting server in 3 seconds...
timeout /t 3 /nobreak >nul

npm run dev
