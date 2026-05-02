/*
  # Fix Infinite Recursion in Admin Policies

  1. Problem
    - Admin RLS policies query admin_users table
    - This triggers RLS on admin_users, which queries admin_users again
    - Creates infinite recursion loop

  2. Solution
    - Make is_admin() and is_super_admin() functions SECURITY DEFINER
    - These functions will bypass RLS when checking admin status
    - Simplify admin_users RLS policies to use these functions

  3. Changes
    - Drop policies first
    - Recreate is_admin() and is_super_admin() as SECURITY DEFINER
    - Recreate policies using the secured functions
*/

-- Step 1: Drop all admin_users policies first
DROP POLICY IF EXISTS "Admins can read own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;

-- Step 2: Drop and recreate is_admin() function with SECURITY DEFINER
DROP FUNCTION IF EXISTS is_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Step 3: Drop and recreate is_super_admin() function with SECURITY DEFINER
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$;

-- Step 4: Recreate admin_users policies without recursion
-- Simple policy: admins can read their own data (no recursion)
CREATE POLICY "Admins can read own data"
ON admin_users FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Super admin policies use SECURITY DEFINER function (no recursion)
CREATE POLICY "Super admins can view all admin users"
ON admin_users FOR SELECT
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admins can insert admin users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update admin users"
ON admin_users FOR UPDATE
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can delete admin users"
ON admin_users FOR DELETE
TO authenticated
USING (is_super_admin());

-- Add comments
COMMENT ON FUNCTION is_admin() IS 'Checks if current user is an admin. SECURITY DEFINER prevents RLS recursion.';
COMMENT ON FUNCTION is_super_admin() IS 'Checks if current user is a super admin. SECURITY DEFINER prevents RLS recursion.';
