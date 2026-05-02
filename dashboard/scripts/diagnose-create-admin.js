#!/usr/bin/env node
/**
 * Local checks for create-admin support (Next.js route handler + env).
 * Run from repo root: node dashboard/scripts/diagnose-create-admin.js
 */

const fs = require('fs');
const path = require('path');

const dashboardRoot = path.join(__dirname, '..');
const functionsRoute = path.join(dashboardRoot, 'app', 'api', 'functions', '[name]', 'route.ts');

console.log('Diagnosing create-admin (dashboard API)…\n');

if (!fs.existsSync(functionsRoute)) {
  console.error('Missing route file:', functionsRoute);
  process.exit(1);
}
const routeSource = fs.readFileSync(functionsRoute, 'utf8');
if (!routeSource.includes("resolved.name === 'create-admin'")) {
  console.error('Route file exists but create-admin branch not found.');
  process.exit(1);
}
console.log('OK: app/api/functions/[name]/route.ts includes create-admin handler.');

const envPath = path.join(dashboardRoot, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('\nNo dashboard/.env file (copy .env.example and set DATABASE_URL, AUTH_SECRET).');
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDb = /\bDATABASE_URL=/.test(envContent);
  const hasAuth = /\bAUTH_SECRET=/.test(envContent);
  console.log('\n.env present:', hasDb ? 'DATABASE_URL set' : 'DATABASE_URL missing');
  console.log('            ', hasAuth ? 'AUTH_SECRET set' : 'AUTH_SECRET missing');
}

console.log('\nNext steps:');
console.log('  1. npm run dev (in dashboard/)');
console.log('  2. Sign in as super admin');
console.log('  3. Use Admin UI to create admins, or run scripts/test-create-admin-auth.js in the browser console');
console.log('  4. If POST fails, check server logs and Postgres connectivity (DATABASE_URL).');
