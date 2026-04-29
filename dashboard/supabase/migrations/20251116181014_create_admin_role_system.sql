/*
  # Create Admin Role System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text) - 'super_admin', 'admin', 'support'
      - `permissions` (jsonb) - custom permissions
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for admin users to read their own data
    - Add policy for super_admins to manage all admin users

  3. Functions
    - `is_admin()` - Check if current user is an admin
    - `is_super_admin()` - Check if current user is a super admin

  4. Initial Data
    - Create super admin for existing user
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support')),
  permissions jsonb DEFAULT '{"manage_vendors": true, "manage_orders": true, "manage_products": true, "view_analytics": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can read their own data
CREATE POLICY "Admins can read own data"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Super admins can manage all admin users
CREATE POLICY "Super admins can manage all admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$;

-- Create super admin for existing admin@credlock.com user
INSERT INTO admin_users (user_id, role, permissions)
SELECT 
  id,
  'super_admin',
  '{"manage_vendors": true, "manage_orders": true, "manage_products": true, "manage_users": true, "view_analytics": true, "manage_finance": true}'::jsonb
FROM auth.users
WHERE email = 'admin@credlock.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'super_admin',
    permissions = '{"manage_vendors": true, "manage_orders": true, "manage_products": true, "manage_users": true, "view_analytics": true, "manage_finance": true}'::jsonb;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);