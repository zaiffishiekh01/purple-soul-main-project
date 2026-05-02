@echo off
echo ============================================
echo create-admin is a Next.js Route Handler
echo ============================================
echo.
echo There is no separate Supabase Edge deploy step.
echo Handler: app\api\functions\[name]\route.ts  (branch: create-admin)
echo.
echo Deploy by shipping this dashboard app (e.g. npm run build, then npm run start,
echo or your Docker / hosting pipeline). Ensure DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL are set.
echo.
echo Smoke public APIs (optional):
echo   npm run smoke:api
echo.
pause
