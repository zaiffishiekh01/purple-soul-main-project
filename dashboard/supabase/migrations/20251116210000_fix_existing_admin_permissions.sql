/*
  # Fix Existing Admin User Permissions

  1. Changes
    - Mark ALL existing admin users as super admins
    - Create admin roles for all existing admins with full permissions
    - Ensure all existing admins have access to all features

  2. Purpose
    - Fix issue where existing admins have no menu items visible
    - Ensure backward compatibility with existing admin accounts
*/

-- Mark all existing admin users as super admin
UPDATE admin_users
SET is_super_admin = true
WHERE is_super_admin = false OR is_super_admin IS NULL;

-- Create admin roles with all permissions for existing admins
INSERT INTO admin_roles (admin_id, role_name, permissions, created_by)
SELECT
  au.id,
  'Super Admin',
  '{
    "vendor_management": true,
    "order_management": true,
    "product_management": true,
    "finance_management": true,
    "analytics_monitoring": true
  }'::jsonb,
  au.id
FROM admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles ar WHERE ar.admin_id = au.id
)
ON CONFLICT (admin_id) DO UPDATE
SET
  role_name = 'Super Admin',
  permissions = '{
    "vendor_management": true,
    "order_management": true,
    "product_management": true,
    "finance_management": true,
    "analytics_monitoring": true
  }'::jsonb,
  updated_at = now();
