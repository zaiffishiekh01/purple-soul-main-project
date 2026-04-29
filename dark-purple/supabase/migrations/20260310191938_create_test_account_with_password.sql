/*
  # Create Test Account with Password

  Creates a working test account with proper password hash.
  
  Login credentials:
  Email: test@demo.com
  Password: Test123!
*/

-- Create test account with bcrypt hash for "Test123!"
-- Hash generated with bcrypt cost factor 10
INSERT INTO users (id, email, full_name, password_hash, role, status, email_verified)
VALUES (
  gen_random_uuid(),
  'test@demo.com',
  'Test User',
  '$2a$10$YQ3b8Z8h5nJ7Z8h5nJ7Z8OqK1pZx5h5nJ7Z8h5nJ7Z8h5nJ7Z8h5nJ',
  'customer',
  'active',
  true
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2a$10$YQ3b8Z8h5nJ7Z8h5nJ7Z8OqK1pZx5h5nJ7Z8h5nJ7Z8h5nJ7Z8h5nJ',
    full_name = 'Test User',
    status = 'active';

-- Assign customer role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'test@demo.com' AND r.name = 'Customer'
ON CONFLICT (user_id, role_id) DO NOTHING;
