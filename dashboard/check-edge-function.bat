@echo off
REM Check if create-admin edge function is deployed
echo 🔍 Checking if create-admin edge function is deployed...
echo.
echo To check, run:
echo   supabase functions list --project-ref naesxujdffcmatntrlfr
echo.
echo To deploy the function, run:
echo   cd dashboard
echo   supabase functions deploy create-admin --project-ref naesxujdffcmatntrlfr
echo.
echo To view function logs, run:
echo   supabase functions logs create-admin --project-ref naesxujdffcmatntrlfr
echo.
pause
