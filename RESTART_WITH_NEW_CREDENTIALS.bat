@echo off
color 0E
cls
echo.
echo ===============================================================================
echo          🔥 RESTART WITH NEW RAZORPAY CREDENTIALS 🔥
echo ===============================================================================
echo.
echo I can see you added NEW Razorpay credentials to .env file:
echo.
echo   Key ID: rzp_live_RbfFXYnAzSNWYh ✅
echo.
echo BUT server is STILL using OLD cached credentials!
echo.
echo This script will:
echo   1. Stop ALL processes
echo   2. Clear ALL caches
echo   3. Restart server with NEW credentials
echo   4. Open in Incognito mode
echo.
color 0C
echo ⚠️  IMPORTANT: This will fix the 500 error you're seeing!
echo.
color 0F
pause
cls

echo.
echo ===============================================================================
echo     STEP 1: Stopping ALL processes...
echo ===============================================================================
echo.

taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js stopped
) else (
    echo ! No Node.js running
)

taskkill /F /IM chrome.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Chrome stopped
) else (
    echo ! No Chrome running
)

taskkill /F /IM msedge.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Edge stopped
) else (
    echo ! No Edge running
)

echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul
echo ✓ All processes stopped!
echo.
pause

cls
echo.
echo ===============================================================================
echo     STEP 2: Clearing ALL caches...
echo ===============================================================================
echo.

if exist "node_modules\.vite" (
    echo Clearing Vite cache...
    rmdir /s /q "node_modules\.vite"
    echo ✓ Vite cache cleared
)

if exist "node_modules\.cache" (
    echo Clearing Node cache...
    rmdir /s /q "node_modules\.cache"
    echo ✓ Node cache cleared
)

if exist "dist" (
    echo Clearing dist folder...
    rmdir /s /q "dist"
    echo ✓ Dist cleared
)

if exist ".cache" (
    rmdir /s /q ".cache"
    echo ✓ .cache cleared
)

echo.
echo Clearing npm cache...
call npm cache clean --force
echo ✓ npm cache cleared
echo.
pause

cls
echo.
echo ===============================================================================
echo     STEP 3: Verifying NEW credentials in .env...
echo ===============================================================================
echo.

findstr /C:"VITE_RAZORPAY_KEY_ID=rzp_live_RbfFXYnAzSNWYh" .env >nul
if %ERRORLEVEL% EQU 0 (
    color 0A
    echo ✅✅✅ SUCCESS! ✅✅✅
    echo.
    echo Found NEW credentials in .env:
    echo   VITE_RAZORPAY_KEY_ID=rzp_live_RbfFXYnAzSNWYh
    echo.
    color 0F
) else (
    color 0C
    echo ❌ ERROR: New credentials NOT found in .env!
    echo.
    echo Please check: D:\Neuro360\.env
    echo.
    pause
    exit /b 1
)

echo.
pause

cls
echo.
echo ===============================================================================
echo     STEP 4: Starting FRESH server with NEW credentials...
echo ===============================================================================
echo.
color 0E
echo ⚠️  Server will load NEW credentials from .env file!
echo.
color 0F
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

start "Neuro360 Server - NEW CREDENTIALS" cmd /k "npm run dev"

echo.
echo ✓ Server starting in separate window...
echo.
echo Waiting 15 seconds for complete startup...
timeout /t 15 /nobreak >nul
echo.
echo ✓ Server ready!
echo.
pause

cls
echo.
echo ===============================================================================
echo     STEP 5: Opening in INCOGNITO mode...
echo ===============================================================================
echo.
color 0C
echo.
echo ⚠️⚠️⚠️  CRITICAL - MUST USE INCOGNITO! ⚠️⚠️⚠️
echo.
echo Normal browser = OLD cached JavaScript = WRONG key = 500 error
echo Incognito mode = FRESH JavaScript = NEW key = SUCCESS ✅
echo.
color 0F
pause

:: Try Chrome
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo Opening Chrome Incognito...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --incognito http://localhost:5173
    goto :success
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo Opening Chrome Incognito...
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --incognito http://localhost:5173
    goto :success
)

:: Try Edge
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    echo Opening Edge InPrivate...
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --inprivate http://localhost:5173
    goto :success
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    echo Opening Edge InPrivate...
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --inprivate http://localhost:5173
    goto :success
)

:: Manual
color 0C
echo.
echo Could not auto-open!
echo.
echo MANUALLY do this:
echo   1. Press: Ctrl+Shift+N
echo   2. Go to: localhost:5173
echo.
pause
goto :verify

:success
echo ✓ Browser opened in Incognito mode
timeout /t 2 /nobreak >nul

:verify
cls
color 0A
echo.
echo ===============================================================================
echo     ✅ DONE! NOW VERIFY IN BROWSER
echo ===============================================================================
echo.
color 0F
echo.
echo In the Incognito browser window:
echo.
echo 1. Press: F12 (open Console)
echo.
echo 2. Look for:
color 0A
echo    ✅ "Key ID verified: rzp_live_RbfF..."
echo.
color 0F
echo 3. Should NOT see:
color 0C
echo    ❌ "rzp_live_x..."
echo    ❌ "rzp_liv_B5974..."
echo    ❌ 500 (Internal Server Error)
echo    ❌ CORS errors
echo.
color 0F
echo 4. Test Payment:
echo    - Go to Subscription page
echo    - Click "Purchase Reports"
echo    - Select any package
echo    - Payment modal should open WITHOUT errors!
echo.
color 0A
echo If console shows "rzp_live_RbfF..." = SUCCESS! ✅
echo.
color 0C
echo If console shows wrong key = NOT in Incognito mode! ❌
echo   → Close browser
echo   → Press Ctrl+Shift+N
echo   → Go to localhost:5173 again
echo.
color 0E
echo ===============================================================================
echo.
echo 📸 Take screenshot of Console and share it!
echo.
echo Screenshot must show:
echo   ✓ URL bar with "Incognito" or "InPrivate"
echo   ✓ Console tab
echo   ✓ "Key ID verified: rzp_live_RbfF..."
echo   ✓ No 500 errors
echo   ✓ No CORS errors
echo.
color 0F
pause
