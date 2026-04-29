-- Fix: Drop existing function first, then recreate
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing function (all overloads)
DROP FUNCTION IF EXISTS create_admin_user(UUID, TEXT, TEXT, BOOLEAN, JSONB);
DROP FUNCTION IF EXISTS create_admin_user();

-- Step 2: Recreate it
CREATE OR REPLACE FUNCTION create_admin_user(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'admin',
  p_is_super_admin BOOLEAN DEFAULT false,
  p_permissions JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION create_admin_user IS 'Creates an admin user record. SECURITY DEFINER function.';

-- Verify it was created
SELECT 
  routine_name,
  argument_names,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'create_admin_user';
