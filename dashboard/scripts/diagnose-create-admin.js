#!/usr/bin/env node
/**
 * Diagnostic script for create-admin edge function error
 * Run: node dashboard/scripts/diagnose-create-admin.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing create-admin edge function issue...\n');

// Check 1: Edge function file exists
const functionPath = path.join(__dirname, '..', 'supabase', 'functions', 'create-admin', 'index.ts');
if (fs.existsSync(functionPath)) {
  console.log('✅ Edge function file exists:', functionPath);
} else {
  console.log('❌ Edge function file NOT found at:', functionPath);
  process.exit(1);
}

// Check 2: Supabase config exists
const configPath = path.join(__dirname, '..', 'supabase', 'config.toml');
if (fs.existsSync(configPath)) {
  console.log('✅ Supabase config exists');
  const config = fs.readFileSync(configPath, 'utf-8');
  const projectRefMatch = config.match(/project_id\s*=\s*"([^"]+)"/);
  if (projectRefMatch) {
    console.log('✅ Project ID found:', projectRefMatch[1]);
  } else {
    console.log('⚠️  Project ID not found in config.toml');
  }
} else {
  console.log('❌ Supabase config.toml NOT found');
}

// Check 3: Check if .env file exists in dashboard
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasAnonKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  
  if (hasUrl && hasAnonKey) {
    console.log('✅ Supabase environment variables found in .env');
  } else {
    console.log('⚠️  Missing some Supabase env variables');
  }
} else {
  console.log('⚠️  No .env file found in dashboard directory');
}

console.log('\n📋 Next Steps:');
console.log('1. Open browser console (F12) and try creating an admin again');
console.log('2. Look for the detailed error message logged by the hook');
console.log('3. Common issues:');
console.log('   - Not logged in as Super Admin');
console.log('   - Edge function not deployed to Supabase');
console.log('   - Missing environment variables in Supabase');
console.log('\n🔧 To deploy the edge function:');
console.log('   cd dashboard');
console.log('   supabase functions deploy create-admin');
console.log('\n🔧 To set required secrets:');
console.log('   supabase secrets set SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key');
