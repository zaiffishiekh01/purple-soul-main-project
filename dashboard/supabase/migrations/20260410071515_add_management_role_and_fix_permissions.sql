/*
  # Add Management Role and Fix Admin Permissions System

  ## Summary
  This migration adds the 'management' role to the admin system and fixes the
  role-based permission system so that each role has the correct access level.

  ## Role Hierarchy
  1. **super_admin** - Full platform control, can manage all admins, sees every sidebar link
  2. **admin** - Full e-commerce management (vendors, orders, products, finance, analytics) 
     but cannot manage other admins
  3. **management** - Limited to analytics, finance overview, and order monitoring
     (read-only reporting role)

  ## Changes
  1. Alter admin_users.role column to allow 'management' role
  2. Update get_admin_permissions() RPC to return role-based default permissions
     when no explicit permissions are set, and to handle 'management' role
  3. Add email column to admin_users if not exists (for display in UI)

  ## Notes
  - Existing admins are not affected
  - super_admin users always get all permissions regardless of stored permissions
  - 'admin' role with no explicit permissions defaults to all non-admin-management permissions
  - 'management' role defaults to analytics_monitoring + finance_management (read-focused)
*/

-- Step 1: Update the role check constraint to include 'management'
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'management', 'support'));

-- Step 2: Add email column for display purposes if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'email'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN email text;
  END IF;
END $$;

-- Step 3: Replace get_admin_permissions to handle all roles properly
CREATE OR REPLACE FUNCTION get_admin_permissions(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_permissions jsonb;
  v_is_super_admin boolean;
  v_role text;
  v_vendor_mgmt boolean := false;
  v_order_mgmt boolean := false;
  v_product_mgmt boolean := false;
  v_finance_mgmt boolean := false;
  v_analytics_monitor boolean := false;
BEGIN
  SELECT
    COALESCE(is_super_admin, false),
    role,
    permissions
  INTO v_is_super_admin, v_role, v_permissions
  FROM admin_users
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN '{"vendor_management":false,"order_management":false,"product_management":false,"finance_management":false,"analytics_monitoring":false,"is_super_admin":false}';
  END IF;

  -- super_admin gets everything
  IF v_is_super_admin OR v_role = 'super_admin' THEN
    RETURN '{"vendor_management":true,"order_management":true,"product_management":true,"finance_management":true,"analytics_monitoring":true,"is_super_admin":true}';
  END IF;

  -- If explicit permissions are stored, use them
  IF v_permissions IS NOT NULL AND jsonb_typeof(v_permissions) = 'object' THEN
    BEGIN
      v_vendor_mgmt := COALESCE((v_permissions->>'vendor_management')::boolean, false);
      v_order_mgmt := COALESCE((v_permissions->>'order_management')::boolean, false);
      v_product_mgmt := COALESCE((v_permissions->>'product_management')::boolean, false);
      v_finance_mgmt := COALESCE((v_permissions->>'finance_management')::boolean, false);
      v_analytics_monitor := COALESCE((v_permissions->>'analytics_monitoring')::boolean, false);
    EXCEPTION WHEN OTHERS THEN
      -- fallthrough to role defaults
      NULL;
    END;
  END IF;

  -- Apply role-based defaults if no explicit permissions were meaningful
  -- 'admin' role: full e-commerce access (no admin management)
  IF v_role = 'admin' AND NOT (v_vendor_mgmt OR v_order_mgmt OR v_product_mgmt OR v_finance_mgmt OR v_analytics_monitor) THEN
    v_vendor_mgmt := true;
    v_order_mgmt := true;
    v_product_mgmt := true;
    v_finance_mgmt := true;
    v_analytics_monitor := true;
  END IF;

  -- 'management' role: analytics and finance by default (reporting/oversight)
  IF v_role = 'management' AND NOT (v_vendor_mgmt OR v_order_mgmt OR v_product_mgmt OR v_finance_mgmt OR v_analytics_monitor) THEN
    v_finance_mgmt := true;
    v_analytics_monitor := true;
  END IF;

  RETURN jsonb_build_object(
    'vendor_management', v_vendor_mgmt,
    'order_management', v_order_mgmt,
    'product_management', v_product_mgmt,
    'finance_management', v_finance_mgmt,
    'analytics_monitoring', v_analytics_monitor,
    'is_super_admin', false,
    'role', v_role
  );
END;
$$;
