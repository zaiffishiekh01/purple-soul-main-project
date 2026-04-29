#!/usr/bin/env node

/**
 * Setup Demo Accounts Script
 *
 * Creates test accounts for Customer, Vendor, and Admin roles
 * to explore the platform functionality.
 */

const bcrypt = require('bcryptjs');
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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env file');
  console.error('\n📌 To get your service role key:');
  console.error('1. Go to https://supabase.com/dashboard/project/qvzeptnrikucdpabizev/settings/api');
  console.error('2. Copy the "service_role" key (under "Project API keys")');
  console.error('3. Add it to your .env file:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEMO_ACCOUNTS = [
  {
    email: 'customer@demo.com',
    password: 'Customer123!',
    full_name: 'Demo Customer',
    role: 'customer',
    description: 'Regular customer account - can browse, shop, and manage orders'
  },
  {
    email: 'vendor@demo.com',
    password: 'Vendor123!',
    full_name: 'Demo Vendor',
    role: 'vendor',
    description: 'Vendor account - can manage products, orders, and inventory',
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
    full_name: 'Demo Administrator',
    role: 'admin',
    description: 'Admin account - full platform access for management'
  }
];

async function setupDemoAccounts() {
  console.log('🚀 Setting up demo accounts...\n');

  for (const account of DEMO_ACCOUNTS) {
    try {
      console.log(`\n📝 Creating ${account.role.toUpperCase()} account: ${account.email}`);

      // 1. Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', account.email)
        .maybeSingle();

      let userId;

      if (existingUser) {
        console.log(`   ℹ️  User already exists, updating...`);
        userId = existingUser.id;

        // Update existing user
        const passwordHash = await bcrypt.hash(account.password, 10);
        await supabase
          .from('users')
          .update({
            full_name: account.full_name,
            password_hash: passwordHash,
            status: 'active',
            email_verified: true
          })
          .eq('id', userId);

      } else {
        // Create new user
        const passwordHash = await bcrypt.hash(account.password, 10);

        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            email: account.email,
            full_name: account.full_name,
            password_hash: passwordHash,
            status: 'active',
            email_verified: true
          })
          .select()
          .single();

        if (userError) throw userError;
        userId = newUser.id;
        console.log(`   ✅ User created with ID: ${userId}`);
      }

      // 2. Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', account.role)
        .single();

      if (roleError) throw roleError;
      const roleId = roleData.id;

      // 3. Assign role to user
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .maybeSingle();

      if (!existingRole) {
        await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleId
          });
        console.log(`   ✅ Role "${account.role}" assigned`);
      } else {
        console.log(`   ℹ️  Role "${account.role}" already assigned`);
      }

      // 4. Create vendor profile if vendor role
      if (account.role === 'vendor' && account.vendorInfo) {
        const { data: existingVendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingVendor) {
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert({
              user_id: userId,
              business_name: account.vendorInfo.business_name,
              business_type: account.vendorInfo.business_type,
              description: account.vendorInfo.description,
              contact_email: account.vendorInfo.contact_email,
              phone: account.vendorInfo.phone,
              address: account.vendorInfo.address,
              status: account.vendorInfo.status
            });

          if (vendorError) throw vendorError;
          console.log(`   ✅ Vendor profile created`);
        } else {
          console.log(`   ℹ️  Vendor profile already exists`);
        }
      }

      console.log(`   ✅ ${account.role.toUpperCase()} account ready!`);

    } catch (error) {
      console.error(`   ❌ Error creating ${account.email}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n🎉 Demo accounts setup complete!\n');
  console.log('📋 CREDENTIALS FOR TESTING:\n');
  console.log('='.repeat(70));

  DEMO_ACCOUNTS.forEach(account => {
    console.log(`\n${account.role.toUpperCase()} ACCOUNT`);
    console.log(`  Email:    ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log(`  Access:   ${account.description}`);
    if (account.role === 'customer') {
      console.log(`  Dashboard: /account`);
    } else if (account.role === 'vendor') {
      console.log(`  Dashboard: /vendor`);
    } else if (account.role === 'admin') {
      console.log(`  Dashboard: /admin`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n📌 HOW TO TEST:\n');
  console.log('1. Navigate to your site homepage');
  console.log('2. Click "Sign In" in the header');
  console.log('3. Enter the credentials above');
  console.log('4. You will be redirected to the appropriate dashboard');
  console.log('\n💡 TIP: Use different browser profiles or incognito windows');
  console.log('   to test multiple accounts simultaneously.');
  console.log('\n' + '='.repeat(70) + '\n');
}

// Run the script
setupDemoAccounts()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
