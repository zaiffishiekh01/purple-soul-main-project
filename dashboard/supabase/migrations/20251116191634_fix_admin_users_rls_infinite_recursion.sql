/*
  # Fix Admin Users RLS Infinite Recursion

  1. Changes
    - Drop the problematic "Super admins can manage all admin users" policy
    - Recreate policies without recursion using SECURITY DEFINER functions

  2. Security
    - Admins can read their own data
    - Super admins can manage all admin users (fixed recursion)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;

-- Super admins can view all admin users using the helper function
CREATE POLICY "Super admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_super_admin() OR auth.uid() = user_id);

-- Super admins can insert admin users
CREATE POLICY "Super admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- Super admins can update admin users
CREATE POLICY "Super admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Super admins can delete admin users
CREATE POLICY "Super admins can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (is_super_admin());
