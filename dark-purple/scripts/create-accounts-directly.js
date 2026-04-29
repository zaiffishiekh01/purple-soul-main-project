#!/usr/bin/env node

/**
 * Create Demo Accounts Directly via Supabase Admin API
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

async function createAccount(account) {
  console.log(`\n📝 Creating ${account.role}: ${account.email}`);

  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName
      }
    });

    if (authError) {
      if (authError.message.includes('already')) {
        console.log(`   ℹ️  Auth user already exists`);
      } else {
        console.log(`   ❌ Auth error: ${authError.message}`);
        return false;
      }
    } else {
      console.log(`   ✅ Auth user created`);
    }

    // Get or create user in users table
    let userId = authUser?.user?.id;

    if (!userId) {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const found = existingUser?.users?.find(u => u.email === account.email);
      userId = found?.id;
    }

    if (!userId) {
      console.log(`   ❌ Could not get user ID`);
      return false;
    }

    // Create user record
    const passwordHash = await bcrypt.hash(account.password, 10);
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: account.email,
        full_name: account.fullName,
        password_hash: passwordHash,
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.log(`   ⚠️  User table: ${userError.message}`);
    } else {
      console.log(`   ✅ User record created`);
    }

    // Get role ID
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', account.role)
      .single();

    if (roleData) {
      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleData.id,
        }, {
          onConflict: 'user_id,role_id'
        });

      if (roleError) {
        console.log(`   ⚠️  Role assignment: ${roleError.message}`);
      } else {
        console.log(`   ✅ Role "${account.role}" assigned`);
      }
    }

    // Create vendor profile if needed
    if (account.role === 'vendor' && account.vendorInfo) {
      const { error: vendorError } = await supabase
        .from('vendors')
        .upsert({
          user_id: userId,
          ...account.vendorInfo,
        }, {
          onConflict: 'user_id'
        });

      if (vendorError) {
        console.log(`   ⚠️  Vendor profile: ${vendorError.message}`);
      } else {
        console.log(`   ✅ Vendor profile created`);
      }
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating demo accounts directly via Supabase...\n');

  for (const account of DEMO_ACCOUNTS) {
    await createAccount(account);
  }

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

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
