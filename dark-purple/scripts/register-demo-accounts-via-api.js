#!/usr/bin/env node

/**
 * Register Demo Accounts via API
 *
 * This script creates demo accounts using the registration API endpoint,
 * then assigns roles directly in the database.
 *
 * REQUIREMENTS:
 * - Dev server must be running (npm run dev)
 * - Or set API_URL environment variable for different host
 */

const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

const API_URL = process.env.API_URL || envVars.API_BASE_URL || 'http://localhost:3000';
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DEMO_ACCOUNTS = [
  {
    email: 'customer@demo.com',
    password: 'Customer123!',
    fullName: 'Demo Customer',
    role: 'customer',
  },
  {
    email: 'vendor@demo.com',
    password: 'Vendor123!',
    fullName: 'Demo Vendor',
    role: 'vendor',
    vendorInfo: {
      business_name: 'Sacred Crafts Studio',
      business_type: 'artisan',
      description: 'Handcrafted Islamic prayer items with traditional techniques',
      contact_email: 'vendor@demo.com',
      phone: '+1-555-0123',
      address: '123 Artisan Lane, Brooklyn, NY 11201',
      status: 'active'
    }
  },
  {
    email: 'admin@demo.com',
    password: 'Admin123!',
    fullName: 'Demo Administrator',
    role: 'admin',
  },
];

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function registerAccount(account) {
  console.log(`\n📝 Registering ${account.role}: ${account.email}`);

  try {
    const response = await makeRequest(
      `${API_URL}/api/auth/register`,
      'POST',
      {
        email: account.email,
        password: account.password,
        fullName: account.fullName,
      }
    );

    if (response.status === 201 || response.status === 200) {
      console.log(`   ✅ Registered successfully`);
      return { success: true, data: response.data };
    } else if (response.status === 409 || (response.data && response.data.message && response.data.message.includes('already exists'))) {
      console.log(`   ℹ️  Account already exists`);
      return { success: true, exists: true };
    } else {
      console.log(`   ❌ Registration failed: ${response.data.message || response.status}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ Cannot connect to ${API_URL}`);
      console.log(`   💡 Make sure the dev server is running: npm run dev`);
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }
    return { success: false, error };
  }
}

async function assignRoles() {
  console.log('\n🔧 Assigning roles in database...');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('   ❌ Missing Supabase credentials');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Get role IDs
    const { data: roles } = await supabase
      .from('roles')
      .select('id, name');

    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });

    // Assign roles for each account
    for (const account of DEMO_ACCOUNTS) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', account.email)
        .maybeSingle();

      if (!user) {
        console.log(`   ⚠️  User not found: ${account.email}`);
        continue;
      }

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role_id: roleMap[account.role],
        }, {
          onConflict: 'user_id,role_id',
          ignoreDuplicates: true,
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.log(`   ❌ Error assigning role for ${account.email}: ${roleError.message}`);
        continue;
      }

      console.log(`   ✅ Role "${account.role}" assigned to ${account.email}`);

      // Create vendor profile if needed
      if (account.role === 'vendor' && account.vendorInfo) {
        const { error: vendorError } = await supabase
          .from('vendors')
          .upsert({
            user_id: user.id,
            ...account.vendorInfo,
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false,
          });

        if (vendorError) {
          console.log(`   ⚠️  Vendor profile: ${vendorError.message}`);
        } else {
          console.log(`   ✅ Vendor profile created`);
        }
      }
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up demo accounts...');
  console.log(`   API: ${API_URL}`);
  console.log('');

  // Register all accounts
  const results = [];
  for (const account of DEMO_ACCOUNTS) {
    const result = await registerAccount(account);
    results.push({ account, result });
  }

  // Check if any registration failed due to connection
  const connectionFailed = results.some(r => !r.result.success && r.result.error && r.result.error.code === 'ECONNREFUSED');

  if (connectionFailed) {
    console.log('\n' + '='.repeat(70));
    console.log('\n❌ Setup Failed: Cannot connect to API');
    console.log('\n📋 To fix:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Run this script again');
    console.log('\nOr set API_URL environment variable if using different host.');
    console.log('\n' + '='.repeat(70) + '\n');
    process.exit(1);
  }

  // Assign roles in database
  const roleSuccess = await assignRoles();

  if (!roleSuccess) {
    console.log('\n' + '='.repeat(70));
    console.log('\n⚠️  Accounts registered but role assignment may have failed');
    console.log('\n📋 To manually assign roles:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Run the SQL from scripts/create-demo-accounts.sql');
    console.log('\n' + '='.repeat(70) + '\n');
    process.exit(1);
  }

  // Success!
  console.log('\n' + '='.repeat(70));
  console.log('\n🎉 Demo accounts setup complete!');
  console.log('\n📋 LOGIN CREDENTIALS:\n');
  console.log('='.repeat(70));

  DEMO_ACCOUNTS.forEach(account => {
    console.log(`\n${account.role.toUpperCase()} ACCOUNT`);
    console.log(`  Email:    ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log(`  Dashboard: /${account.role === 'customer' ? 'account' : account.role}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n📝 Next Steps:');
  console.log('1. Navigate to your site');
  console.log('2. Click "Sign In"');
  console.log('3. Use the credentials above');
  console.log('4. Explore the different dashboards');
  console.log('\n💡 TIP: Use different browser profiles to test multiple accounts');
  console.log('   simultaneously.');
  console.log('\n📚 See DEMO_CREDENTIALS.md for complete testing guide');
  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
