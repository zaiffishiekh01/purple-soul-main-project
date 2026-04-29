-- Migration: 001_create_admin_user_bypass
-- Date: 2026-04-11
-- Purpose: Create SECURITY DEFINER function to add admins bypassing RLS

CREATE OR REPLACE FUNCTION create_admin_user_bypass(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'admin',
  p_is_super_admin BOOLEAN DEFAULT false,
  p_permissions JSONB DEFAULT '{}'::jsonb
) 
RETURNS JSONB
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
  WHEN unique_violation THEN
    RETURN jsonb_build_object('error', 'An admin with this user_id already exists');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION create_admin_user_bypass IS 'Creates admin user bypassing RLS. SECURITY DEFINER.';

-- Track migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('001_create_admin_user_bypass', 'Create admin user bypass function')
ON CONFLICT (migration_id) DO NOTHING;
