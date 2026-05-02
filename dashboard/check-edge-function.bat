@echo off
echo ============================================
echo Legacy helper (Supabase Edge removed)
echo ============================================
echo.
echo create-admin is implemented in the Next.js app:
echo   POST /api/functions/create-admin
echo   (see app\api\functions\[name]\route.ts)
echo.
echo Verify the running app:
echo   1. npm run dev
echo   2. npm run smoke:api
echo   3. Sign in as super admin and use Admin UI to create admins
echo.
pause
