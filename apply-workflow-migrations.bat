@echo off
REM ===================================================================
REM  Apply Workflow Tables Migrations to Supabase
REM  Creates workflows and uploaded_files tables
REM ===================================================================

echo.
echo ========================================================
echo   Apply Workflow Tables Migrations
echo ========================================================
echo.

echo This script will create the following tables in Supabase:
echo.
echo  [1] workflows - Tracks EEG processing workflow status
echo  [2] uploaded_files - Tracks uploaded EEG files
echo.
echo These tables are needed for:
echo  - Tracking upload progress
echo  - Monitoring processing status
echo  - Workflow history and analytics
echo.

echo ========================================================
echo How to Apply Migrations:
echo ========================================================
echo.
echo OPTION 1: Supabase Dashboard (Easiest)
echo ----------------------------------------
echo.
echo 1. Open Supabase Dashboard: https://supabase.com/dashboard
echo 2. Select your project: Neuro360
echo 3. Go to SQL Editor (left sidebar)
echo 4. Click "New Query"
echo 5. Copy and paste contents of BOTH files:
echo    - supabase\migrations\011_create_workflows_table.sql
echo    - supabase\migrations\012_create_uploaded_files_table.sql
echo 6. Click "Run" button
echo.
pause

echo.
echo OPTION 2: Supabase CLI (Advanced)
echo ----------------------------------
echo.
echo Prerequisites:
echo  - Supabase CLI installed
echo  - Linked to your project
echo.
echo Commands:
echo   supabase db push
echo   OR
echo   supabase migration up
echo.

pause

echo.
echo ========================================================
echo Migration Files Location:
echo ========================================================
echo.
echo File 1: supabase\migrations\011_create_workflows_table.sql
echo File 2: supabase\migrations\012_create_uploaded_files_table.sql
echo.

echo Opening migration files in Notepad...
echo.

REM Open both migration files
if exist "supabase\migrations\011_create_workflows_table.sql" (
    start notepad "supabase\migrations\011_create_workflows_table.sql"
) else (
    echo ERROR: Migration file 011 not found!
)

timeout /t 2 >nul

if exist "supabase\migrations\012_create_uploaded_files_table.sql" (
    start notepad "supabase\migrations\012_create_uploaded_files_table.sql"
) else (
    echo ERROR: Migration file 012 not found!
)

echo.
echo ========================================================
echo Next Steps:
echo ========================================================
echo.
echo 1. Copy the SQL from the opened Notepad windows
echo 2. Go to Supabase Dashboard SQL Editor
echo 3. Paste and run the SQL
echo 4. Refresh your application
echo 5. Try uploading an EEG file again!
echo.
echo ========================================================
echo After Migration:
echo ========================================================
echo.
echo You should see:
echo  - No more "workflows table not found" errors
echo  - Workflow tracking in console logs
echo  - Upload progress being saved
echo  - Workflow history available
echo.

echo ========================================================
echo IMPORTANT:
echo ========================================================
echo.
echo The application will work WITHOUT these migrations!
echo.
echo The code has been updated to continue working even if
echo the tables don't exist. However, you won't have:
echo  - Workflow tracking
echo  - Progress history
echo  - Analytics on uploads
echo.
echo It's recommended to apply these migrations for full
echo functionality.
echo.

pause

echo.
echo ========================================================
echo Need Help?
echo ========================================================
echo.
echo If you encounter errors:
echo.
echo 1. Check Supabase project is running
echo 2. Verify you have admin access
echo 3. Check for syntax errors in SQL
echo 4. Try running migrations one at a time
echo.
echo Common issues:
echo  - Table already exists: DROP TABLE first
echo  - Permission denied: Check user role
echo  - Syntax error: Copy SQL carefully
echo.

pause
