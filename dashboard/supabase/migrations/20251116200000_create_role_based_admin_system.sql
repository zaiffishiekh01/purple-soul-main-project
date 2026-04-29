/*
  # Role-Based Admin System

  1. New Tables
    - `admin_roles`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, references admin_users)
      - `role_name` (text) - e.g., 'Super Admin', 'Vendor Manager', etc.
      - `permissions` (jsonb) - permission flags
      - `created_by` (uuid, references admin_users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `is_super_admin` flag to `admin_users` table
    - Add default permissions structure

  3. Security
    - Enable RLS on `admin_roles` table
    - Add policies for super admin access only

  4. Permissions Structure
    - vendor_management: boolean
    - order_management: boolean
    - product_management: boolean
    - finance_management: boolean
    - analytics_monitoring: boolean
*/

-- Add is_super_admin flag to admin_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_super_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
  role_name text NOT NULL,
  permissions jsonb DEFAULT '{
    "vendor_management": false,
    "order_management": false,
    "product_management": false,
    "finance_management": false,
    "analytics_monitoring": false
  }'::jsonb,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(admin_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_roles_admin_id ON admin_roles(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_permissions ON admin_roles USING gin(permissions);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all admin roles
CREATE POLICY "Super admins can view all admin roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can create admin roles"
  ON admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update admin roles"
  ON admin_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can delete admin roles"
  ON admin_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_super_admin = true
    )
  );

-- Admins can view their own role
CREATE POLICY "Admins can view their own role"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (
    admin_id IN (
      SELECT id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Function to automatically create super admin role for first admin
CREATE OR REPLACE FUNCTION create_default_super_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first admin user
  IF (SELECT COUNT(*) FROM admin_users) = 1 THEN
    -- Mark as super admin
    UPDATE admin_users SET is_super_admin = true WHERE id = NEW.id;

    -- Create super admin role with all permissions
    INSERT INTO admin_roles (admin_id, role_name, permissions, created_by)
    VALUES (
      NEW.id,
      'Super Admin',
      '{
        "vendor_management": true,
        "order_management": true,
        "product_management": true,
        "finance_management": true,
        "analytics_monitoring": true
      }'::jsonb,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default super admin role
DROP TRIGGER IF EXISTS trigger_create_default_super_admin_role ON admin_users;
CREATE TRIGGER trigger_create_default_super_admin_role
  AFTER INSERT ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_super_admin_role();

-- Function to get admin permissions
CREATE OR REPLACE FUNCTION get_admin_permissions(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_permissions jsonb;
  v_is_super_admin boolean;
BEGIN
  -- Check if user is super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM admin_users
  WHERE user_id = p_user_id;

  -- Super admins have all permissions
  IF v_is_super_admin THEN
    RETURN '{
      "vendor_management": true,
      "order_management": true,
      "product_management": true,
      "finance_management": true,
      "analytics_monitoring": true,
      "is_super_admin": true
    }'::jsonb;
  END IF;

  -- Get regular admin permissions
  SELECT permissions INTO v_permissions
  FROM admin_roles ar
  JOIN admin_users au ON au.id = ar.admin_id
  WHERE au.user_id = p_user_id;

  -- Add is_super_admin flag
  v_permissions = v_permissions || '{"is_super_admin": false}'::jsonb;

  RETURN COALESCE(v_permissions, '{
    "vendor_management": false,
    "order_management": false,
    "product_management": false,
    "finance_management": false,
    "analytics_monitoring": false,
    "is_super_admin": false
  }'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing first admin to be super admin (if exists)
DO $$
DECLARE
  v_first_admin_id uuid;
BEGIN
  SELECT id INTO v_first_admin_id
  FROM admin_users
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_first_admin_id IS NOT NULL THEN
    UPDATE admin_users SET is_super_admin = true WHERE id = v_first_admin_id;

    INSERT INTO admin_roles (admin_id, role_name, permissions, created_by)
    VALUES (
      v_first_admin_id,
      'Super Admin',
      '{
        "vendor_management": true,
        "order_management": true,
        "product_management": true,
        "finance_management": true,
        "analytics_monitoring": true
      }'::jsonb,
      v_first_admin_id
    )
    ON CONFLICT (admin_id) DO UPDATE
    SET permissions = '{
        "vendor_management": true,
        "order_management": true,
        "product_management": true,
        "finance_management": true,
        "analytics_monitoring": true
      }'::jsonb,
      role_name = 'Super Admin';
  END IF;
END $$;
