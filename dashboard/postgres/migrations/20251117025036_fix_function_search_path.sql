/*
  # Fix Function Search Path

  1. Security Improvement
    - Set stable search_path for security functions
    - Prevents search_path injection attacks
    - Follows PostgreSQL security best practices

  2. Changes
    - Drop and recreate get_admin_permissions function with stable search_path
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_admin_permissions(uuid);

-- Recreate with stable search_path
CREATE OR REPLACE FUNCTION get_admin_permissions(admin_user_id uuid)
RETURNS TABLE (
  can_manage_vendors boolean,
  can_manage_products boolean,
  can_manage_orders boolean,
  can_view_finance boolean,
  can_manage_payouts boolean,
  can_manage_admins boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.can_manage_vendors,
    ap.can_manage_products,
    ap.can_manage_orders,
    ap.can_view_finance,
    ap.can_manage_payouts,
    ap.can_manage_admins
  FROM admin_permissions ap
  WHERE ap.admin_user_id = get_admin_permissions.admin_user_id;
END;
$$;

-- Add comment explaining the security measure
COMMENT ON FUNCTION get_admin_permissions(uuid) IS
'Securely retrieves admin permissions with stable search_path to prevent injection attacks';
