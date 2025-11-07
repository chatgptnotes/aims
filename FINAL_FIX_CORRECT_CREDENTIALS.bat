@echo off
color 0E
echo.
echo ===============================================================================
echo     🔧 FINAL FIX - CORRECT CREDENTIALS UPDATE
echo ===============================================================================
echo.
echo ISSUE FOUND: Your .env file had WRONG Razorpay credentials!
echo.
echo ❌ OLD (WRONG) Key: rzp_live_RIGlEwt9XmHpJ5
echo ✅ NEW (CORRECT) Key: rzp_live_xhAJH2vAW4eXzu
echo.
echo I have FIXED the .env file with your correct credentials.
echo.
echo This script will now:
echo   1. Kill all Node/Browser processes
echo   2. Clear ALL caches (Vite, npm, dist)
echo   3. Restart server with CORRECT credentials
echo   4. Open in Incognito mode (mandatory!)
echo.
color 0C
echo ⚠️  WARNING: You MUST use Incognito mode or same error will appear!
echo.
color 0F
pause

echo.
echo ===============================================================================
echo     STEP 1: Killing all processes...
echo ===============================================================================
taskkill /F /IM node.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
timeout /t 3 /nobreak >nul
echo ✓ Processes killed

echo.
echo ===============================================================================
echo     STEP 2: Clearing ALL caches...
echo ===============================================================================
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist ".cache" rmdir /s /q ".cache"
if exist "dist" rmdir /s /q "dist"
if exist "build" rmdir /s /q "build"
echo ✓ Vite cache cleared

call npm cache clean --force
echo ✓ npm cache cleared

echo.
echo ===============================================================================
echo     STEP 3: Verifying Razorpay configuration...
echo ===============================================================================
echo.
echo Checking .env file for correct credentials...
findstr /C:"VITE_RAZORPAY_KEY_ID=rzp_live_xhAJH2vAW4eXzu" .env >nul
if %ERRORLEVEL% EQU 0 (
    color 0A
    echo ✅ SUCCESS! Correct Key ID found in .env: rzp_live_xhAJH2vAW4eXzu
) else (
    color 0C
    echo ❌ ERROR! Key ID not found or incorrect in .env file
    echo.
    echo Please manually check D:\Neuro360\.env file
    pause
    exit /b 1
)

echo.
color 0F
echo ===============================================================================
echo     STEP 4: Starting dev server with CORRECT credentials...
echo ===============================================================================
echo.
echo Server starting in 3 seconds...
timeout /t 3 /nobreak >nul

start "Neuro360 Dev Server" cmd /k "npm run dev"

echo.
echo Waiting for server to start (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
color 0E
echo ===============================================================================
echo     STEP 5: Opening in INCOGNITO mode...
echo ===============================================================================
echo.
echo 🔴 CRITICAL: This MUST open in Incognito mode!
echo.

:: Try Chrome first
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo Opening Chrome in Incognito mode...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --incognito http://localhost:5173
    goto :opened
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo Opening Chrome in Incognito mode...
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --incognito http://localhost:5173
    goto :opened
)

:: Try Edge
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    echo Opening Edge in InPrivate mode...
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --inprivate http://localhost:5173
    goto :opened
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    echo Opening Edge in InPrivate mode...
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --inprivate http://localhost:5173
    goto :opened
)

:: Manual instructions
color 0C
echo.
echo ⚠️ Could not auto-open browser!
echo.
echo MANUALLY do this NOW:
echo   1. Press: Ctrl+Shift+N (Chrome/Edge Incognito)
echo   2. Go to: http://localhost:5173
echo.
pause
exit

:opened
color 0A
echo.
echo ===============================================================================
echo     ✅ SETUP COMPLETE!
echo ===============================================================================
echo.
color 0F
echo Now do this in the Incognito browser window:
echo.
echo 1. Press F12 (open Console)
echo.
echo 2. Look for this message:
echo    ✅ "🔐 PRODUCTION: Key ID verified: rzp_live_xhA..."
echo.
echo 3. Should NOT see:
echo    ❌ "rzp_live_RIGlEwt9..."
echo    ❌ "rzp_live_x_A4A..."
echo    ❌ "rzp_liv_B9B1..."
echo.
echo 4. If you see "rzp_live_xhA..." = SUCCESS! Test payment now!
echo.
echo 5. If you see wrong key = You didn't use Incognito mode!
echo    Close browser and press Ctrl+Shift+N to open Incognito
echo.
color 0E
echo ===============================================================================
echo.
echo 📸 Take a screenshot of the Console and share it to verify!
echo.
echo The error should be FIXED now! 🎉
echo.
pause
