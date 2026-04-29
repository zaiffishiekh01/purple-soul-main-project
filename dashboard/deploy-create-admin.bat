@echo off
echo ============================================
echo DEPLOYING create-admin EDGE FUNCTION
echo ============================================
echo.
echo This will deploy the create-admin edge function to:
echo Project: naesxujdffcmatntrlfr
echo.
echo Make sure you have:
echo 1. Supabase CLI installed
echo 2. Logged in (supabase login)
echo.
pause

cd /d "%~dp0"

echo.
echo Deploying create-admin function...
echo.

supabase functions deploy create-admin --project-ref naesxujdffcmatntrlfr

echo.
echo ============================================
echo DEPLOYMENT COMPLETE
echo ============================================
echo.
echo Next steps:
echo 1. Set required secrets (if not already set):
echo    supabase secrets set SUPABASE_URL=https://naesxujdffcmatntrlfr.supabase.co SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY --project-ref naesxujdffcmatntrlfr
echo.
echo 2. Test creating an admin in the dashboard
echo.
pause
