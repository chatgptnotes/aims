@echo off
color 0C
cls
echo.
echo ===============================================================================
echo                    🔴 SIMPLE FIX - FOLLOW CAREFULLY
echo ===============================================================================
echo.
echo You are seeing 401 errors because:
echo.
echo   1. Server is NOT restarted after .env file was fixed
echo   2. Browser is serving OLD cached JavaScript
echo.
echo This script will:
echo   1. Kill ALL processes
echo   2. Clear ALL caches
echo   3. Start FRESH server
echo   4. Open in INCOGNITO mode
echo.
color 0E
echo ⚠️  IMPORTANT: You MUST wait for EACH step to complete!
echo.
color 0F
pause
cls

echo.
echo ===============================================================================
echo     STEP 1/5: Killing ALL Node and Browser processes...
echo ===============================================================================
echo.
echo Stopping Node.js...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js stopped
) else (
    echo ! No Node.js process found
)

echo.
echo Stopping Chrome...
taskkill /F /IM chrome.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Chrome stopped
) else (
    echo ! No Chrome process found
)

echo.
echo Stopping Edge...
taskkill /F /IM msedge.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Edge stopped
) else (
    echo ! No Edge process found
)

echo.
echo Waiting 3 seconds for processes to fully terminate...
timeout /t 3 /nobreak >nul
echo ✓ All processes stopped
echo.
pause

cls
echo.
echo ===============================================================================
echo     STEP 2/5: Clearing ALL caches...
echo ===============================================================================
echo.

echo Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Vite cache cleared
) else (
    echo ! No Vite cache found
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Node cache cleared
) else (
    echo ! No node cache found
)

if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Dist folder cleared
) else (
    echo ! No dist folder found
)

echo.
echo Clearing npm cache...
call npm cache clean --force
echo ✓ npm cache cleared

echo.
echo ✓ ALL caches cleared!
echo.
pause

cls
echo.
echo ===============================================================================
echo     STEP 3/5: Verifying .env file has CORRECT credentials...
echo ===============================================================================
echo.

findstr /C:"VITE_RAZORPAY_KEY_ID=rzp_live_xhAJH2vAW4eXzu" .env >nul
if %ERRORLEVEL% EQU 0 (
    color 0A
    echo ✅ SUCCESS! Correct Key ID found in .env file
    echo.
    echo    VITE_RAZORPAY_KEY_ID=rzp_live_xhAJH2vAW4eXzu
    echo.
    color 0F
) else (
    color 0C
    echo ❌ ERROR! Correct key NOT found in .env file!
    echo.
    echo Please manually check: D:\Neuro360\.env
    echo.
    pause
    exit /b 1
)

pause

cls
echo.
echo ===============================================================================
echo     STEP 4/5: Starting FRESH dev server...
echo ===============================================================================
echo.
echo This will open a NEW terminal window with the dev server.
echo.
echo ⚠️  IMPORTANT: DO NOT close that terminal window!
echo.
echo Starting server in 3 seconds...
timeout /t 3 /nobreak >nul

start "Neuro360 Dev Server - DO NOT CLOSE" cmd /k "npm run dev"

echo.
echo ✓ Dev server starting in separate window...
echo.
echo Waiting 15 seconds for server to fully start...
echo (Look for "Local: http://localhost:5173" in the other window)
echo.
timeout /t 15 /nobreak >nul

echo.
echo ✓ Server should be ready now!
echo.
pause

cls
echo.
echo ===============================================================================
echo     STEP 5/5: Opening in INCOGNITO MODE...
echo ===============================================================================
echo.
color 0C
echo ⚠️⚠️⚠️  THIS IS THE MOST IMPORTANT STEP! ⚠️⚠️⚠️
echo.
echo The browser MUST open in Incognito/InPrivate mode!
echo.
echo If it opens in NORMAL mode, close it and press Ctrl+Shift+N manually!
echo.
color 0F
pause

:: Try to open Chrome in Incognito
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

:: Try Edge InPrivate
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

:: Manual fallback
color 0C
cls
echo.
echo ===============================================================================
echo     ⚠️ COULD NOT AUTO-OPEN BROWSER
echo ===============================================================================
echo.
echo Please do this MANUALLY RIGHT NOW:
echo.
echo 1. Press: Ctrl + Shift + N
echo.
echo 2. In the Incognito window, type: localhost:5173
echo.
echo 3. Press: Enter
echo.
pause
goto :verify

:opened
echo.
echo ✓ Browser opened in Incognito/InPrivate mode
echo.
timeout /t 3 /nobreak >nul

:verify
cls
color 0A
echo.
echo ===============================================================================
echo     ✅ SETUP COMPLETE!
echo ===============================================================================
echo.
color 0F
echo Now verify in the browser:
echo.
echo 1. Press F12 (open Console)
echo.
echo 2. Look for:
color 0A
echo    ✅ "PRODUCTION: Key ID verified: rzp_live_xhA..."
echo.
color 0F
echo 3. Should NOT see:
color 0C
echo    ❌ "rzp_live_x_60FA3..."
echo    ❌ "rzp_live_x_atFO1..."
echo    ❌ "rzp_live_RIGlEwt..."
echo    ❌ 401 (Unauthorized) errors
echo.
color 0F
echo 4. If you see correct key:
echo    - Go to Subscription page
echo    - Click "Purchase Reports"
echo    - Select ₹1 package
echo    - Complete payment
echo    - IT WILL WORK! ✅
echo.
echo 5. If you see WRONG key:
echo    - You are NOT in Incognito mode
echo    - Close browser
echo    - Press Ctrl+Shift+N
echo    - Go to localhost:5173 again
echo.
color 0E
echo ===============================================================================
echo.
echo 📸 Take a screenshot of Console and share it!
echo.
echo Make sure screenshot shows:
echo   ✓ Browser URL bar (with "Incognito" or "InPrivate")
echo   ✓ Console with "Key ID verified: rzp_live_xhA..."
echo   ✓ No 401 errors
echo.
color 0F
pause
