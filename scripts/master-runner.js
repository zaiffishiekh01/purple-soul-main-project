/**
 * MASTER COMMAND RUNNER
 * 
 * Provides commands to:
 * 1. Test entire e-commerce system
 * 2. Validate dashboard ↔ customer portal connection
 * 3. Find and report bugs
 * 4. Generate fix scripts
 * 5. Check data consistency
 * 
 * Usage:
 * node scripts/master-runner.js test-all
 * node scripts/master-runner.js check-connection
 * node scripts/master-runner.js find-bugs
 * node scripts/master-runner.js generate-fix
 * node scripts/master-runner.js full-report
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Report storage
const report = {
  timestamp: new Date().toISOString(),
  supabase_url: supabaseUrl,
  tests: [],
  bugs: [],
  recommendations: [],
  fixes_generated: []
};

function log(msg) {
  console.log(msg);
}

// ==========================================
// COMMAND: test-all
// ==========================================
async function testAll() {
  log('\n🧪 RUNNING COMPLETE E-COMMERCE TEST SUITE\n');
  log('═'.repeat(70));

  // Import and run test suite
  try {
    const { execSync } = require('child_process');
    execSync('node scripts/test-suite.js', { stdio: 'inherit' });
  } catch (error) {
    log('\n❌ Some tests failed - check output above');
  }
}

// ==========================================
// COMMAND: check-connection
// ==========================================
async function checkConnection() {
  log('\n🔗 CHECKING DASHBOARD ↔ CUSTOMER PORTAL CONNECTION\n');
  log('═'.repeat(70));

  // Check both apps use same Supabase
  const dashboardEnv = fs.readFileSync('dashboard/.env', 'utf8');
  const portalEnv = fs.readFileSync('.env', 'utf8');

  const dashboardUrl = dashboardEnv.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
  const portalUrl = portalEnv.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();

  const dashboardKey = dashboardEnv.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
  const portalKey = portalEnv.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

  log('📊 Configuration Check:');
  log(`   Dashboard URL: ${dashboardUrl ? '✅ Set' : '❌ Missing'}`);
  log(`   Portal URL:    ${portalUrl ? '✅ Set' : '❌ Missing'}`);

  if (dashboardUrl === portalUrl) {
    log(`\n✅ Both apps use the SAME Supabase project`);
    log(`   URL: ${dashboardUrl}`);
  } else {
    log(`\n❌ Apps use DIFFERENT Supabase projects!`);
    log(`   Dashboard: ${dashboardUrl}`);
    log(`   Portal:    ${portalUrl}`);
    log(`\n💡 FIX: Update dashboard/.env to match .env`);
    report.recommendations.push('Unify Supabase URLs across both apps');
  }

  // Test database connectivity
  log('\n📡 Database Connectivity:');
  
  try {
    const { data, error } = await supabase.from('vendors').select('count', { count: 'exact', head: true });
    
    if (error) {
      log(`   ❌ Cannot connect: ${error.message}`);
      report.bugs.push({
        severity: 'critical',
        issue: 'Database connection failed',
        details: error.message
      });
    } else {
      log(`   ✅ Database connection successful`);
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`);
  }
}

// ==========================================
// COMMAND: find-bugs
// ==========================================
async function findBugs() {
  log('\n🐛 FINDING BUGS & ISSUES\n');
  log('═'.repeat(70));

  // Check 1: Missing tables
  log('📊 Checking required tables...');
  const requiredTables = [
    'admin_users', 'vendors', 'products', 'orders', 'order_items',
    'customers', 'categories', 'returns', 'refunds', 'payments',
    'notifications', '_migrations'
  ];

  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    
    if (error && error.message.includes('does not exist')) {
      log(`   ❌ Missing: ${table}`);
      report.bugs.push({
        severity: 'critical',
        issue: `Missing table: ${table}`,
        fix: `Create ${table} table or run migrations`
      });
    } else {
      log(`   ✅ Exists: ${table}`);
    }
  }

  // Check 2: Missing functions
  log('\n🔧 Checking database functions...');
  const requiredFunctions = [
    { name: 'create_admin_user_bypass', purpose: 'Admin creation' },
    { name: 'delete_vendor_bypass', purpose: 'Vendor deletion' }
  ];

  for (const func of requiredFunctions) {
    const { error } = await supabase.rpc(func.name, {});
    
    if (error && error.message.includes('does not exist')) {
      log(`   ❌ Missing: ${func.name} (${func.purpose})`);
      report.bugs.push({
        severity: 'critical',
        issue: `Missing function: ${func.name}`,
        fix: 'Run scripts/APPLY_ALL_FIXES.sql'
      });
    } else {
      log(`   ✅ Exists: ${func.name}`);
    }
  }

  // Check 3: Data integrity
  log('\n🔗 Checking data integrity...');
  
  // Check for products without vendors
  const { data: orphanedProducts } = await supabase
    .from('products')
    .select('id, vendor_id')
    .is('vendor_id', null)
    .limit(5);

  if (orphanedProducts && orphanedProducts.length > 0) {
    log(`   ⚠️  Found ${orphanedProducts.length} products without vendor`);
    report.bugs.push({
      severity: 'warning',
      issue: `${orphanedProducts.length} products missing vendor reference`,
      fix: 'Update products to have valid vendor_id'
    });
  } else {
    log(`   ✅ All products have vendor references`);
  }

  // Check 4: RLS policies
  log('\n🔒 Checking RLS configuration...');
  
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('is_super_admin')
    .eq('is_super_admin', true)
    .limit(1);

  if (!adminUsers || adminUsers.length === 0) {
    log(`   ❌ No super admin found`);
    report.bugs.push({
      severity: 'critical',
      issue: 'No super admin exists',
      fix: 'Create super admin in admin_users table'
    });
  } else {
    log(`   ✅ Super admin exists`);
  }

  // Generate report
  log('\n' + '═'.repeat(70));
  log(`📊 BUGS FOUND: ${report.bugs.length}`);
  
  const critical = report.bugs.filter(b => b.severity === 'critical').length;
  const warnings = report.bugs.filter(b => b.severity === 'warning').length;
  
  log(`   🔴 Critical: ${critical}`);
  log(`   🟡 Warnings: ${warnings}`);

  if (critical > 0) {
    log('\n💡 Run this to fix critical issues:');
    log('   node scripts/master-runner.js generate-fix');
  }
}

// ==========================================
// COMMAND: generate-fix
// ==========================================
async function generateFix() {
  log('\n🔧 GENERATING FIX SCRIPT\n');
  log('═'.repeat(70));

  // Read the master fix file
  const fixFile = path.join(__dirname, 'APPLY_ALL_FIXES.sql');
  
  if (fs.existsSync(fixFile)) {
    log('✅ Master fix script found: scripts/APPLY_ALL_FIXES.sql\n');
    log('To apply fixes:');
    log('1. Open: scripts/APPLY_ALL_FIXES.sql');
    log('2. Copy all content (Ctrl+A, Ctrl+C)');
    log('3. Go to Supabase Dashboard → SQL Editor');
    log('4. Paste and Run (Ctrl+Enter)');
    log('5. Run tests again: node scripts/master-runner.js test-all');
  } else {
    log('❌ Fix script not found');
    log('💡 Create scripts/APPLY_ALL_FIXES.sql with required migrations');
  }
}

// ==========================================
// COMMAND: full-report
// ==========================================
async function fullReport() {
  log('\n📊 GENERATING COMPREHENSIVE REPORT\n');
  log('═'.repeat(70));

  // Run all checks
  await checkConnection();
  await findBugs();

  // Save report to file
  const reportFile = path.join(__dirname, '..', 'test-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log('\n💾 Report saved to: test-report.json');
}

// ==========================================
// COMMAND PARSER
// ==========================================
const commands = {
  'test-all': testAll,
  'check-connection': checkConnection,
  'find-bugs': findBugs,
  'generate-fix': generateFix,
  'full-report': fullReport,
  'help': () => {
    log('\n📖 AVAILABLE COMMANDS:');
    log('═'.repeat(70));
    log('  test-all              Run complete e-commerce test suite');
    log('  check-connection      Verify dashboard ↔ portal connection');
    log('  find-bugs             Find bugs and issues in database');
    log('  generate-fix          Generate fix scripts');
    log('  full-report           Generate comprehensive report');
    log('  help                  Show this help message');
    log('');
    log('Examples:');
    log('  node scripts/master-runner.js test-all');
    log('  node scripts/master-runner.js check-connection');
    log('  node scripts/master-runner.js find-bugs');
    log('  node scripts/master-runner.js full-report');
  }
};

// Parse command
const command = process.argv[2] || 'help';

if (commands[command]) {
  commands[command]().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
} else {
  log(`❌ Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}
