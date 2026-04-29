-- Migration: 003_fix_vendor_rls_policies
-- Date: 2026-04-11
-- Purpose: Create comprehensive RLS policies for vendors table

-- Drop existing policies
DROP POLICY IF EXISTS "vendors_delete_policy" ON vendors;
DROP POLICY IF EXISTS "vendors_read_policy" ON vendors;
DROP POLICY IF EXISTS "vendors_insert_policy" ON vendors;
DROP POLICY IF EXISTS "vendors_update_policy" ON vendors;

-- Read: Admins can read all vendors
CREATE POLICY "vendors_read_policy"
ON vendors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
  )
);

-- Insert: Admins with vendor_management permission can create vendors
CREATE POLICY "vendors_insert_policy"
ON vendors
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND (au.is_super_admin = true OR (au.permissions->>'vendor_management')::boolean = true)
  )
);

-- Update: Admins with vendor_management permission can update vendors
CREATE POLICY "vendors_update_policy"
ON vendors
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND (au.is_super_admin = true OR (au.permissions->>'vendor_management')::boolean = true)
  )
);

-- Delete: Admins with vendor_management permission can delete vendors
CREATE POLICY "vendors_delete_policy"
ON vendors
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND (au.is_super_admin = true OR (au.permissions->>'vendor_management')::boolean = true)
  )
);

-- Track migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('003_fix_vendor_rls_policies', 'Fix vendor RLS policies')
ON CONFLICT (migration_id) DO NOTHING;
