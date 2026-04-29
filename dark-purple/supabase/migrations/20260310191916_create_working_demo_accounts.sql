/*
  # Create Working Demo Accounts

  This migration creates fully functional demo accounts by:
  1. Removing incomplete user records from users table
  2. The accounts will be created through Supabase Auth UI
  3. Setting up proper role assignments
  
  After this migration, register these accounts through the signup form:
  - customer@demo.com / Customer123!
  - vendor@demo.com / Vendor123!
  - admin@demo.com / Admin123!
*/

-- Clean up incomplete user records that exist in users but not in auth.users
DELETE FROM user_roles 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email IN ('customer@demo.com', 'vendor@demo.com', 'admin@demo.com')
  AND id NOT IN (SELECT id FROM auth.users)
);

DELETE FROM vendors
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email IN ('customer@demo.com', 'vendor@demo.com', 'admin@demo.com')
  AND id NOT IN (SELECT id FROM auth.users)
);

DELETE FROM users 
WHERE email IN ('customer@demo.com', 'vendor@demo.com', 'admin@demo.com')
AND id NOT IN (SELECT id FROM auth.users);

-- Make sure demo@purplesoul.com has customer role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'demo@purplesoul.com'
  AND r.name = 'Customer'
ON CONFLICT (user_id, role_id) DO NOTHING;
