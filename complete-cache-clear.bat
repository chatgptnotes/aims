@echo off
echo.
echo ===============================================================================
echo     COMPLETE CACHE CLEAR - Fix Razorpay 401 Error
echo ===============================================================================
echo.
echo This script will:
echo   1. Kill all Node processes
echo   2. Clear Vite cache
echo   3. Clear dist folder
echo   4. Clear npm cache
echo   5. Restart dev server fresh
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [Step 1/5] Killing all Node processes...
echo -------------------------------------------------------------------------------
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node processes killed
) else (
    echo ℹ No Node processes were running
)
timeout /t 2 /nobreak >nul

echo.
echo [Step 2/5] Clearing Vite cache...
echo -------------------------------------------------------------------------------
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Vite cache cleared
) else (
    echo ℹ No Vite cache found
)

echo.
echo [Step 3/5] Clearing dist folder...
echo -------------------------------------------------------------------------------
if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Dist folder cleared
) else (
    echo ℹ No dist folder found
)

echo.
echo [Step 4/5] Clearing npm cache...
echo -------------------------------------------------------------------------------
npm cache clean --force
echo ✓ npm cache cleared

echo.
echo [Step 5/5] Verifying Razorpay configuration...
echo -------------------------------------------------------------------------------
node verify-razorpay-config.js

echo.
echo ===============================================================================
echo     CLEANUP COMPLETE! Starting fresh dev server...
echo ===============================================================================
echo.
echo ⚠️  CRITICAL: After server starts, you MUST:
echo    1. Open browser in INCOGNITO/PRIVATE mode (Ctrl+Shift+N)
echo    2. OR Clear ALL browser cache (Ctrl+Shift+Delete)
echo    3. Navigate to: http://localhost:5173
echo.
echo 📋 Check browser console for:
echo    ✓ "Key ID verified: rzp_live_xhA..." (YOUR correct key)
echo    ✗ NOT "rzp_live_x_A4A..." (old wrong key)
echo.
echo Starting server in 5 seconds...
timeout /t 5 /nobreak

echo.
echo ===============================================================================
npm run dev
