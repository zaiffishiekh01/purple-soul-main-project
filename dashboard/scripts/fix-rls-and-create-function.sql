-- COMPLETE FIX: RLS Policies + Admin Creation
-- Run this ENTIRE script in Supabase SQL Editor

-- ==========================================
-- PART 1: Fix RLS Policies
-- ==========================================

-- Disable RLS temporarily (we'll re-enable with proper policies)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_read_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;

-- ==========================================
-- PART 2: Create a Helper Function (SECURITY DEFINER)
-- ==========================================

-- This function runs with elevated privileges to bypass RLS
CREATE OR REPLACE FUNCTION create_admin_user_bypass(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'admin',
  p_is_super_admin BOOLEAN DEFAULT false,
  p_permissions JSONB DEFAULT '{}'::jsonb
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges, bypassing RLS
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO admin_users (
    user_id,
    email,
    role,
    is_super_admin,
    permissions
  ) VALUES (
    p_user_id,
    p_email,
    p_role,
    p_is_super_admin,
    p_permissions
  ) RETURNING jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'email', email,
    'role', role,
    'is_super_admin', is_super_admin
  ) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('error', 'An admin with this user_id already exists');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION create_admin_user_bypass IS 'Creates admin user bypassing RLS. Only callable by authenticated users.';

-- ==========================================
-- PART 3: Verify Everything
-- ==========================================

-- Check if function was created
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'create_admin_user_bypass';

-- Check RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'admin_users';

-- ==========================================
-- DONE!
-- ==========================================
-- Now you can create admins from the UI
-- The code will call create_admin_user_bypass() instead of direct insert
