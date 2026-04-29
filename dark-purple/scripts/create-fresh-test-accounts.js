const bcrypt = require('bcryptjs');
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAccount(email, password, fullName, roleName) {
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: roleName.toLowerCase(),
      status: 'active',
      email_verified: true
    }, {
      onConflict: 'email'
    })
    .select()
    .single();

  if (userError) {
    console.error(`Error creating ${email}:`, userError);
    return null;
  }

  // Assign role
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (role) {
    await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role_id: role.id
      }, {
        onConflict: 'user_id,role_id'
      });
  }

  // Create vendor profile if needed
  if (roleName === 'Vendor') {
    await supabase
      .from('vendors')
      .upsert({
        user_id: user.id,
        business_name: 'Sacred Crafts Co',
        business_type: 'artisan',
        description: 'Handcrafted Islamic prayer items',
        contact_email: email,
        phone: '+1-555-TEST',
        address: '123 Test Street, Brooklyn, NY',
        status: 'active'
      }, {
        onConflict: 'user_id'
      });
  }

  return user;
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('Creating Test Accounts...');
  console.log('='.repeat(70) + '\n');

  const accounts = [
    { email: 'customer@test.com', password: 'Customer123!', name: 'Test Customer', role: 'Customer' },
    { email: 'vendor@test.com', password: 'Vendor123!', name: 'Test Vendor', role: 'Vendor' },
    { email: 'admin@test.com', password: 'Admin123!', name: 'Test Admin', role: 'Administrator' }
  ];

  for (const account of accounts) {
    const user = await createTestAccount(account.email, account.password, account.name, account.role);
    if (user) {
      console.log(`✅ ${account.role}: ${account.email}`);
    } else {
      console.log(`❌ Failed to create ${account.email}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('TEST CREDENTIALS - READY TO USE');
  console.log('='.repeat(70));

  accounts.forEach(account => {
    console.log(`\n${account.role.toUpperCase()}`);
    console.log(`  Email:    ${account.email}`);
    console.log(`  Password: ${account.password}`);
  });

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
