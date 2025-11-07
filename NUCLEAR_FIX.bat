@echo off
color 0C
echo.
echo ===============================================================================
echo     ⚠️  NUCLEAR OPTION - COMPLETE SYSTEM RESET ⚠️
echo ===============================================================================
echo.
echo This will:
echo   - Kill ALL Node processes
echo   - Delete ALL caches (Vite, npm, browser-related)
echo   - Delete node_modules and reinstall
echo   - Clear EVERYTHING and start fresh
echo.
echo ⏱️  Time: ~5 minutes (depending on internet speed)
echo.
color 0E
echo Press Ctrl+C to cancel, or
pause

color 0F
echo.
echo ===============================================================================
echo     STEP 1: Killing all processes...
echo ===============================================================================
taskkill /F /IM node.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo ===============================================================================
echo     STEP 2: Deleting ALL cache directories...
echo ===============================================================================
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist ".cache" rmdir /s /q ".cache"
if exist "dist" rmdir /s /q "dist"
if exist "build" rmdir /s /q "build"
echo ✓ Cache directories deleted

echo.
echo ===============================================================================
echo     STEP 3: Clearing npm cache...
echo ===============================================================================
call npm cache clean --force
call npm cache verify

echo.
echo ===============================================================================
echo     STEP 4: Deleting and reinstalling node_modules...
echo ===============================================================================
echo This may take 3-5 minutes...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
call npm install

echo.
echo ===============================================================================
echo     STEP 5: Verifying Razorpay configuration...
echo ===============================================================================
call node verify-razorpay-config.js

echo.
color 0A
echo ===============================================================================
echo     ✅ NUCLEAR CLEANUP COMPLETE!
echo ===============================================================================
echo.
color 0E
echo ⚠️⚠️⚠️  CRITICAL - READ THIS CAREFULLY! ⚠️⚠️⚠️
echo.
echo After server starts, you MUST do BOTH:
echo.
echo   1. CLOSE ALL BROWSER WINDOWS (including this one)
echo.
echo   2. CLEAR BROWSER DATA:
echo      - Press Windows key
echo      - Type: "Clear browsing data"
echo      - Or press: Ctrl+Shift+Delete
echo      - Select: "All time"
echo      - Check ALL boxes
echo      - Click "Clear data"
echo.
echo   3. RESTART BROWSER
echo.
echo   4. OPEN IN INCOGNITO MODE:
echo      - Press: Ctrl+Shift+N
echo      - Go to: http://localhost:5173
echo.
echo If you DON'T do this, you'll STILL see the wrong key! 🔴
echo.
color 0F
echo Starting server in 10 seconds...
echo Press Ctrl+C to cancel
timeout /t 10

echo.
echo ===============================================================================
call npm run dev
