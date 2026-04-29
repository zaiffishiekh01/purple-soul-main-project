#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
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

const ACCOUNTS = [
  { email: 'customer@demo.com', password: 'Customer123!', name: 'Demo Customer', role: 'Customer' },
  { email: 'vendor@demo.com', password: 'Vendor123!', name: 'Demo Vendor', role: 'Vendor' },
  { email: 'admin@demo.com', password: 'Admin123!', name: 'Demo Administrator', role: 'Administrator' },
];

async function main() {
  console.log('\n🔧 Creating auth users...\n');

  for (const account of ACCOUNTS) {
    console.log(`Creating ${account.email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.name
      }
    });

    if (error) {
      if (error.message.includes('already')) {
        console.log(`  ✅ Already exists in auth`);
      } else {
        console.log(`  ❌ Error: ${error.message}`);
        continue;
      }
    } else {
      console.log(`  ✅ Created in auth.users`);
    }

    // Get user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === account.email);

    if (!user) {
      console.log(`  ❌ Could not find user`);
      continue;
    }

    // Assign role
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', account.role)
      .single();

    if (roleData) {
      await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role_id: roleData.id,
        }, {
          onConflict: 'user_id,role_id'
        });
      console.log(`  ✅ Role assigned`);
    }

    // Create vendor profile
    if (account.role === 'Vendor') {
      await supabase
        .from('vendors')
        .upsert({
          user_id: user.id,
          business_name: 'Sacred Crafts Studio',
          business_type: 'artisan',
          description: 'Handcrafted Islamic prayer items',
          contact_email: account.email,
          phone: '+1-555-0123',
          address: '123 Artisan Lane, Brooklyn, NY',
          status: 'active'
        }, {
          onConflict: 'user_id'
        });
      console.log(`  ✅ Vendor profile created`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ ALL ACCOUNTS ARE NOW READY TO USE:\n');
  console.log('='.repeat(70));

  ACCOUNTS.forEach(account => {
    console.log(`\n${account.role.toUpperCase()}`);
    console.log(`  Email:    ${account.email}`);
    console.log(`  Password: ${account.password}`);
  });

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
