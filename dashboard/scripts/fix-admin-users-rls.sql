-- Fix RLS policies for admin_users table
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admin_users';

-- Step 2: Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Enable read for admin_users" ON admin_users;
DROP POLICY IF EXISTS "Enable insert for admin_users" ON admin_users;
DROP POLICY IF EXISTS "Enable update for admin_users" ON admin_users;
DROP POLICY IF EXISTS "Enable delete for admin_users" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_read_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;

-- Step 3: Create proper RLS policies

-- Policy 1: Super admins can READ all admin users
CREATE POLICY "admin_users_read_policy"
ON admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.is_super_admin = true
  )
);

-- Policy 2: Super admins can INSERT new admin users
CREATE POLICY "admin_users_insert_policy"
ON admin_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.is_super_admin = true
  )
);

-- Policy 3: Super admins can UPDATE admin users
CREATE POLICY "admin_users_update_policy"
ON admin_users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.is_super_admin = true
  )
);

-- Policy 4: Super admins can DELETE admin users (but not super admins)
CREATE POLICY "admin_users_delete_policy"
ON admin_users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.is_super_admin = true
  )
  AND is_super_admin = false  -- Can't delete other super admins
);

-- Step 4: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_users';

-- Step 5: If policies still don't work, temporarily disable RLS (for testing only)
-- Uncomment the line below if you want to disable RLS entirely:
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
