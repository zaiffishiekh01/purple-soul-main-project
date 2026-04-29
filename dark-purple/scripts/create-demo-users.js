/**
 * Script to create demo users for testing dashboards
 * Creates: admin@demo.com and vendor@demo.com
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDemoUsers() {
  console.log('Creating demo users...\n');

  // Get role IDs
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name');

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return;
  }

  const adminRole = roles.find(r => r.name === 'Administrator');
  const vendorRole = roles.find(r => r.name === 'Vendor');

  if (!adminRole || !vendorRole) {
    console.error('Required roles not found in database');
    return;
  }

  // Create admin user
  console.log('Creating admin user...');
  const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@demo.com',
    password: 'demo123456',
    email_confirm: true,
    user_metadata: {
      full_name: 'Demo Admin'
    }
  });

  if (adminError) {
    console.error('Admin creation error:', adminError.message);
  } else {
    console.log('✓ Admin user created:', adminAuth.user.email);

    // Assign admin role
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: adminAuth.user.id,
        role_id: adminRole.id,
        assigned_by: adminAuth.user.id
      });

    if (adminRoleError) {
      console.error('  Error assigning admin role:', adminRoleError.message);
    } else {
      console.log('  ✓ Administrator role assigned');
    }
  }

  // Create vendor user
  console.log('\nCreating vendor user...');
  const { data: vendorAuth, error: vendorError } = await supabase.auth.admin.createUser({
    email: 'vendor@demo.com',
    password: 'demo123456',
    email_confirm: true,
    user_metadata: {
      full_name: 'Demo Vendor'
    }
  });

  if (vendorError) {
    console.error('Vendor creation error:', vendorError.message);
  } else {
    console.log('✓ Vendor user created:', vendorAuth.user.email);

    // Assign vendor role
    const { error: vendorRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: vendorAuth.user.id,
        role_id: vendorRole.id,
        assigned_by: vendorAuth.user.id
      });

    if (vendorRoleError) {
      console.error('  Error assigning vendor role:', vendorRoleError.message);
    } else {
      console.log('  ✓ Vendor role assigned');
    }

    // Create vendor profile
    const { error: profileError } = await supabase
      .from('vendors')
      .insert({
        user_id: vendorAuth.user.id,
        business_name: 'Demo Vendor Shop',
        business_email: 'vendor@demo.com',
        status: 'approved',
        rating: 4.8,
        total_sales: 0
      });

    if (profileError) {
      console.error('  Error creating vendor profile:', profileError.message);
    } else {
      console.log('  ✓ Vendor profile created');
    }
  }

  console.log('\n=== Demo Users Created ===');
  console.log('\nAdmin Account:');
  console.log('  Email: admin@demo.com');
  console.log('  Password: demo123456');
  console.log('  URL: /admin');
  console.log('\nVendor Account:');
  console.log('  Email: vendor@demo.com');
  console.log('  Password: demo123456');
  console.log('  URL: /vendor');
  console.log('\nYou can now log in with these credentials to test the dashboards!\n');
}

createDemoUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
