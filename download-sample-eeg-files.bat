@echo off
REM ===================================================================
REM  Download Sample EEG Files for Testing Neuro360 Upload
REM  This script downloads 3 sample EDF files from PhysioNet
REM ===================================================================

echo.
echo ========================================================
echo   Neuro360 - Sample EEG File Downloader
echo ========================================================
echo.

REM Create folder for test files
set "DOWNLOAD_DIR=%USERPROFILE%\Desktop\EEG_Test_Files"
echo Creating download folder: %DOWNLOAD_DIR%
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"

cd /d "%DOWNLOAD_DIR%"
echo.
echo Current directory: %CD%
echo.

echo --------------------------------------------------------
echo Downloading 3 Sample EEG Files...
echo --------------------------------------------------------
echo.

REM Small file 1 (120 KB) - 1 minute recording
echo [1/3] Downloading: S001R01.edf (Small - 120 KB)
echo       Subject 1 - Baseline Eyes Open (1 minute)
curl -O --progress-bar https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf
if errorlevel 1 (
    echo ERROR: Failed to download S001R01.edf
) else (
    echo SUCCESS: S001R01.edf downloaded
)
echo.

REM Small file 2 (120 KB) - 1 minute recording
echo [2/3] Downloading: S001R02.edf (Small - 120 KB)
echo       Subject 1 - Baseline Eyes Closed (1 minute)
curl -O --progress-bar https://physionet.org/files/eegmmidb/1.0.0/S001/S001R02.edf
if errorlevel 1 (
    echo ERROR: Failed to download S001R02.edf
) else (
    echo SUCCESS: S001R02.edf downloaded
)
echo.

REM Medium file (8 MB) - 8 hour sleep study
echo [3/3] Downloading: SC4001E0-PSG.edf (Medium - 8 MB)
echo       Sleep Study Recording (8 hours)
curl -O --progress-bar https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf
if errorlevel 1 (
    echo ERROR: Failed to download SC4001E0-PSG.edf
) else (
    echo SUCCESS: SC4001E0-PSG.edf downloaded
)
echo.

echo --------------------------------------------------------
echo Download Complete!
echo --------------------------------------------------------
echo.

REM List downloaded files
echo Downloaded Files:
echo.
dir *.edf /B
echo.

REM Show file sizes
echo File Sizes:
dir *.edf
echo.

echo ========================================================
echo Files saved to: %DOWNLOAD_DIR%
echo ========================================================
echo.
echo Next Steps:
echo 1. Open your Neuro360 application
echo 2. Navigate to Patient Reports
echo 3. Click "Upload New Report"
echo 4. Select one of these .edf files
echo 5. Watch the upload and processing workflow!
echo.
echo File Recommendations:
echo - Quick Test: S001R01.edf (120 KB, 1 minute)
echo - Full Test:  SC4001E0-PSG.edf (8 MB, 8 hours)
echo.

REM Open folder in Explorer
echo Opening folder in Explorer...
start "" "%DOWNLOAD_DIR%"

echo.
pause
