/*
  # Fix Admin Users Schema and Permissions Function

  1. Schema Changes
    - Add `is_super_admin` boolean column to `admin_users`
    - Migrate existing `role` data to `is_super_admin`
    - Keep `role` column for backward compatibility

  2. Function Updates
    - Update `get_admin_permissions` to work with current schema
    - Add fallback logic for both `is_super_admin` and `role` columns

  3. Data Migration
    - Set `is_super_admin = true` where role = 'super_admin'
    - Set `is_super_admin = false` for other roles
*/

-- Add is_super_admin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_super_admin boolean DEFAULT false;
  END IF;
END $$;

-- Migrate existing data: set is_super_admin based on role
UPDATE admin_users
SET is_super_admin = (role = 'super_admin')
WHERE is_super_admin IS NULL OR is_super_admin = false;

-- Update the get_admin_permissions function to work correctly
DROP FUNCTION IF EXISTS get_admin_permissions(uuid);

CREATE OR REPLACE FUNCTION get_admin_permissions(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_permissions jsonb;
  v_is_super_admin boolean;
  v_role text;
BEGIN
  -- Check if user is super admin (try both columns)
  SELECT 
    COALESCE(is_super_admin, false),
    role
  INTO v_is_super_admin, v_role
  FROM admin_users
  WHERE user_id = p_user_id;

  -- If not found, return default no permissions
  IF NOT FOUND THEN
    RETURN '{
      "vendor_management": false,
      "order_management": false,
      "product_management": false,
      "finance_management": false,
      "analytics_monitoring": false,
      "is_super_admin": false
    }'::jsonb;
  END IF;

  -- Check super admin status from either column
  IF v_is_super_admin OR v_role = 'super_admin' THEN
    RETURN '{
      "vendor_management": true,
      "order_management": true,
      "product_management": true,
      "finance_management": true,
      "analytics_monitoring": true,
      "is_super_admin": true
    }'::jsonb;
  END IF;

  -- Get regular admin permissions from admin_users.permissions jsonb column
  SELECT permissions INTO v_permissions
  FROM admin_users
  WHERE user_id = p_user_id;

  -- If permissions column has data, use it
  IF v_permissions IS NOT NULL THEN
    -- Ensure all required fields exist with defaults
    v_permissions = COALESCE(v_permissions, '{}'::jsonb);
    v_permissions = v_permissions 
      || jsonb_build_object('vendor_management', COALESCE((v_permissions->>'vendor_management')::boolean, false))
      || jsonb_build_object('order_management', COALESCE((v_permissions->>'order_management')::boolean, false))
      || jsonb_build_object('product_management', COALESCE((v_permissions->>'product_management')::boolean, false))
      || jsonb_build_object('finance_management', COALESCE((v_permissions->>'finance_management')::boolean, false))
      || jsonb_build_object('analytics_monitoring', COALESCE((v_permissions->>'analytics_monitoring')::boolean, false))
      || jsonb_build_object('is_super_admin', false);
    
    RETURN v_permissions;
  END IF;

  -- Fallback: try admin_roles table
  SELECT permissions INTO v_permissions
  FROM admin_roles ar
  JOIN admin_users au ON au.id = ar.admin_id
  WHERE au.user_id = p_user_id;

  IF v_permissions IS NOT NULL THEN
    RETURN v_permissions || '{"is_super_admin": false}'::jsonb;
  END IF;

  -- Default: no permissions
  RETURN '{
    "vendor_management": false,
    "order_management": false,
    "product_management": false,
    "finance_management": false,
    "analytics_monitoring": false,
    "is_super_admin": false
  }'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_admin_permissions(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_admin_permissions(uuid) IS 
'Returns admin permissions for a user, checking both is_super_admin column and role text, with fallback to permissions jsonb';
