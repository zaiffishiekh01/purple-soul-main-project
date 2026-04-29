const bcrypt = require('bcryptjs');

async function main() {
  const password = 'Test123!';
  const hash = await bcrypt.hash(password, 10);

  console.log('\n='.repeat(70));
  console.log('\nBcrypt hash for "Test123!":');
  console.log(hash);
  console.log('\nSQL to create user:');
  console.log('='.repeat(70));
  console.log(`
INSERT INTO users (id, email, full_name, password_hash, role, status, email_verified)
VALUES (
  gen_random_uuid(),
  'test@demo.com',
  'Test User',
  '${hash}',
  'customer',
  'active',
  true
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '${hash}',
    full_name = 'Test User',
    status = 'active';

-- Assign role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'test@demo.com' AND r.name = 'Customer'
ON CONFLICT (user_id, role_id) DO NOTHING;
  `);
  console.log('='.repeat(70));
  console.log('\nLogin with:');
  console.log('Email: test@demo.com');
  console.log('Password: Test123!');
  console.log('\n' + '='.repeat(70) + '\n');
}

main();
