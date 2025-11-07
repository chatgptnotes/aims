@echo off
color 0B
echo.
echo ===============================================================================
echo     🔓 OPENING IN INCOGNITO MODE
echo ===============================================================================
echo.
echo This script will automatically open the app in Incognito mode
echo which ensures NO CACHED files are used!
echo.
pause

echo.
echo Detecting your default browser...

:: Try to open in Chrome Incognito
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo Opening in Chrome Incognito mode...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --incognito http://localhost:5173
    goto :success
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo Opening in Chrome Incognito mode...
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --incognito http://localhost:5173
    goto :success
)

:: Try to open in Edge InPrivate
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    echo Opening in Edge InPrivate mode...
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --inprivate http://localhost:5173
    goto :success
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    echo Opening in Edge InPrivate mode...
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --inprivate http://localhost:5173
    goto :success
)

:: Fallback - manual instructions
:manual
color 0E
echo.
echo ⚠️ Could not auto-open browser!
echo.
echo Please do this MANUALLY:
echo   1. Open your browser
echo   2. Press: Ctrl+Shift+N (Chrome/Edge)
echo      or:    Ctrl+Shift+P (Firefox)
echo   3. Go to: http://localhost:5173
echo.
pause
exit

:success
color 0A
echo.
echo ===============================================================================
echo     ✅ Incognito window opened!
echo ===============================================================================
echo.
echo Now:
echo   1. Check browser console (Press F12)
echo   2. Look for: "Key ID verified: rzp_live_xhA..."
echo   3. Should NOT see: "rzp_live_x66..." or "rzp_live_x_A4A..."
echo   4. Test payment - should work!
echo.
echo If still showing wrong key, run: NUCLEAR_FIX.bat
echo.
pause
