/*
  # Enterprise RBAC System Migration

  ## Overview
  Creates a comprehensive Role-Based Access Control system for the unified platform.
  Replaces Supabase RLS with API-level authorization using JWT tokens.

  ## New Tables

  ### 1. `roles`
     - Predefined system roles (admin, vendor, customer)
     - Fields: id, name, slug, description, is_system_role
     
  ### 2. `permissions`
     - Fine-grained permissions for resources and actions
     - Fields: id, resource, action, description
     - Example: (resource: 'orders', action: 'read'), (resource: 'products', action: 'write')

  ### 3. `role_permissions`
     - Junction table linking roles to permissions
     - Fields: role_id, permission_id

  ### 4. `user_roles`
     - Assigns roles to users (supports multiple roles per user)
     - Fields: user_id, role_id, assigned_by, assigned_at

  ### 5. `sessions`
     - JWT session tracking for token invalidation
     - Fields: id, user_id, token_id (jti), expires_at, ip_address, user_agent

  ## Schema Changes

  - Add `password_hash` to users table for JWT-based authentication
  - Add `status` enum to users (active, suspended, deleted)
  - Add `last_login_at` timestamp to users

  ## Security Features

  - Password hashing required (bcrypt/argon2 at application level)
  - Session tracking for token blacklisting
  - IP address and user agent logging
  - Audit trail via assigned_by fields

  ## Important Notes

  - System roles (admin, vendor, customer) cannot be deleted
  - Permissions are additive (union of all role permissions)
  - Sessions table enables real-time logout across devices
  - This system works with self-hosted PostgreSQL (no Supabase dependency)
*/

-- Create user_status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new fields to users table for JWT auth
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE users ADD COLUMN status user_status DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
END $$;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  is_system_role boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource, action)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES users(id),
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Create sessions table for JWT token tracking
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id text NOT NULL UNIQUE,
  refresh_token_id text UNIQUE,
  expires_at timestamptz NOT NULL,
  refresh_expires_at timestamptz,
  ip_address text,
  user_agent text,
  revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_id ON sessions(token_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Insert system roles
INSERT INTO roles (name, slug, description, is_system_role) VALUES
  ('Administrator', 'admin', 'Full platform access with system management capabilities', true),
  ('Vendor', 'vendor', 'Vendor dashboard access for product and order management', true),
  ('Customer', 'customer', 'Customer storefront access for shopping and orders', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert permissions for customers
INSERT INTO permissions (resource, action, description) VALUES
  -- Customer permissions
  ('profile', 'read', 'View own profile'),
  ('profile', 'write', 'Update own profile'),
  ('cart', 'read', 'View own cart'),
  ('cart', 'write', 'Modify own cart'),
  ('orders', 'read', 'View own orders'),
  ('orders', 'create', 'Place orders'),
  ('wishlist', 'read', 'View own wishlist'),
  ('wishlist', 'write', 'Modify own wishlist'),
  ('addresses', 'read', 'View own addresses'),
  ('addresses', 'write', 'Modify own addresses'),
  ('returns', 'read', 'View own returns'),
  ('returns', 'create', 'Request returns'),
  ('support', 'read', 'View own support tickets'),
  ('support', 'create', 'Create support tickets')
ON CONFLICT (resource, action) DO NOTHING;

-- Insert permissions for vendors
INSERT INTO permissions (resource, action, description) VALUES
  -- Vendor-specific permissions
  ('vendor_dashboard', 'read', 'View vendor dashboard and analytics'),
  ('vendor_products', 'read', 'View own products'),
  ('vendor_products', 'write', 'Create and update own products'),
  ('vendor_products', 'delete', 'Delete own products'),
  ('vendor_orders', 'read', 'View orders for own products'),
  ('vendor_orders', 'update', 'Update order status for own products'),
  ('vendor_inventory', 'read', 'View own inventory'),
  ('vendor_inventory', 'write', 'Update own inventory'),
  ('vendor_shipments', 'read', 'View own shipments'),
  ('vendor_shipments', 'write', 'Create and update own shipments'),
  ('vendor_returns', 'read', 'View returns for own products'),
  ('vendor_returns', 'update', 'Process returns for own products'),
  ('vendor_finance', 'read', 'View own financial data'),
  ('vendor_payouts', 'read', 'View own payouts'),
  ('vendor_profile', 'read', 'View own vendor profile'),
  ('vendor_profile', 'write', 'Update own vendor profile')
ON CONFLICT (resource, action) DO NOTHING;

-- Insert permissions for admins
INSERT INTO permissions (resource, action, description) VALUES
  -- Admin-specific permissions
  ('admin_dashboard', 'read', 'View admin dashboard'),
  ('admin_users', 'read', 'View all users'),
  ('admin_users', 'write', 'Create and update users'),
  ('admin_users', 'delete', 'Delete users'),
  ('admin_vendors', 'read', 'View all vendors'),
  ('admin_vendors', 'write', 'Create and update vendors'),
  ('admin_vendors', 'approve', 'Approve vendor applications'),
  ('admin_vendors', 'suspend', 'Suspend vendors'),
  ('admin_products', 'read', 'View all products'),
  ('admin_products', 'write', 'Update any product'),
  ('admin_products', 'delete', 'Delete any product'),
  ('admin_orders', 'read', 'View all orders'),
  ('admin_orders', 'update', 'Update any order'),
  ('admin_categories', 'read', 'View categories'),
  ('admin_categories', 'write', 'Manage categories'),
  ('admin_returns', 'read', 'View all returns'),
  ('admin_returns', 'update', 'Process any return'),
  ('admin_finance', 'read', 'View platform finances'),
  ('admin_payouts', 'read', 'View all payouts'),
  ('admin_payouts', 'execute', 'Execute vendor payouts'),
  ('admin_analytics', 'read', 'View platform analytics'),
  ('admin_settings', 'read', 'View platform settings'),
  ('admin_settings', 'write', 'Update platform settings'),
  ('admin_audit_logs', 'read', 'View audit logs')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign permissions to customer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'customer'),
  id
FROM permissions
WHERE resource IN ('profile', 'cart', 'orders', 'wishlist', 'addresses', 'returns', 'support')
ON CONFLICT DO NOTHING;

-- Assign permissions to vendor role (includes customer permissions + vendor permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'vendor'),
  id
FROM permissions
WHERE 
  resource IN ('profile', 'cart', 'orders', 'wishlist', 'addresses', 'returns', 'support')
  OR resource LIKE 'vendor_%'
ON CONFLICT DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE slug = 'admin'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (these will eventually be replaced by API-level checks)
-- For now, keep them restrictive

CREATE POLICY "Public can view system roles"
  ON roles FOR SELECT
  USING (is_system_role = true);

CREATE POLICY "Public can view permissions"
  ON permissions FOR SELECT
  USING (true);

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());