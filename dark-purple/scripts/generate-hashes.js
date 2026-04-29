const bcrypt = require('bcryptjs');

async function generateHashes() {
  const accounts = [
    { email: 'customer@test.com', password: 'Customer123!', name: 'Test Customer', role: 'Customer' },
    { email: 'vendor@test.com', password: 'Vendor123!', name: 'Test Vendor', role: 'Vendor' },
    { email: 'admin@test.com', password: 'Admin123!', name: 'Test Admin', role: 'Administrator' }
  ];

  console.log('\n-- SQL to create test accounts\n');

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 10);

    console.log(`-- ${acc.role}: ${acc.email} / ${acc.password}`);
    console.log(`INSERT INTO users (id, email, full_name, password_hash, role, status, email_verified)`);
    console.log(`VALUES (`);
    console.log(`  gen_random_uuid(),`);
    console.log(`  '${acc.email}',`);
    console.log(`  '${acc.name}',`);
    console.log(`  '${hash}',`);
    console.log(`  '${acc.role.toLowerCase()}',`);
    console.log(`  'active',`);
    console.log(`  true`);
    console.log(`)
ON CONFLICT (email) DO UPDATE
SET password_hash = '${hash}',
    full_name = '${acc.name}',
    status = 'active',
    email_verified = true;
`);

    console.log(`INSERT INTO user_roles (user_id, role_id)`);
    console.log(`SELECT u.id, r.id FROM users u, roles r`);
    console.log(`WHERE u.email = '${acc.email}' AND r.name = '${acc.role}'`);
    console.log(`ON CONFLICT (user_id, role_id) DO NOTHING;\n`);

    if (acc.role === 'Vendor') {
      console.log(`INSERT INTO vendors (user_id, business_name, business_type, description, contact_email, phone, address, status)`);
      console.log(`SELECT u.id, 'Sacred Crafts Co', 'artisan', 'Handcrafted Islamic prayer items', '${acc.email}', '+1-555-TEST', '123 Test St, Brooklyn, NY', 'active'`);
      console.log(`FROM users u WHERE u.email = '${acc.email}'`);
      console.log(`ON CONFLICT (user_id) DO UPDATE`);
      console.log(`SET business_name = 'Sacred Crafts Co', status = 'active';\n`);
    }
  }
}

generateHashes();
