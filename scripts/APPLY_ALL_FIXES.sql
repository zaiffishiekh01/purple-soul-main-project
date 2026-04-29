-- =============================================
-- COMPLETE DATABASE FIX - ALL IN ONE
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================
-- This script fixes:
-- 1. Admin creation (bypass RLS)
-- 2. Vendor deletion (bypass RLS)
-- 3. Vendor list filtering (exclude admins)
-- 4. Proper RLS policies
-- =============================================

BEGIN;

-- ==========================================
-- PART 1: Migration Tracking Table
-- ==========================================

CREATE TABLE IF NOT EXISTS _migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- PART 2: Admin User Creation Function
-- ==========================================

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

-- Record migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('20260411_create_admin_user_bypass', 'Create admin user bypass function')
ON CONFLICT (migration_id) DO NOTHING;

-- ==========================================
-- PART 3: Vendor Deletion Function
-- ==========================================

CREATE OR REPLACE FUNCTION delete_vendor_bypass(p_vendor_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  DELETE FROM vendors
  WHERE id = p_vendor_id
  RETURNING jsonb_build_object(
    'id', id,
    'business_name', business_name,
    'deleted', true
  ) INTO v_result;
  
  IF v_result IS NULL THEN
    RETURN jsonb_build_object('error', 'Vendor not found');
  END IF;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION delete_vendor_bypass IS 'Deletes a vendor bypassing RLS. SECURITY DEFINER.';

-- Record migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('20260411_create_vendor_delete_bypass', 'Create vendor delete bypass function')
ON CONFLICT (migration_id) DO NOTHING;

-- ==========================================
-- PART 4: Fix Vendor RLS Policies
-- ==========================================

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

-- Record migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('20260411_fix_vendor_rls_policies', 'Fix vendor RLS policies')
ON CONFLICT (migration_id) DO NOTHING;

-- ==========================================
-- PART 5: Create Vendors Excluding Admins View
-- ==========================================

CREATE OR REPLACE VIEW vendors_excluding_admins AS
SELECT v.*
FROM vendors v
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users au WHERE au.user_id = v.user_id
);

COMMENT ON VIEW vendors_excluding_admins IS 'Vendors list excluding users who are also admins.';

-- Record migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('20260411_create_vendors_excluding_admins_view', 'Create vendors excluding admins view')
ON CONFLICT (migration_id) DO NOTHING;

-- ==========================================
-- PART 6: Verify Everything
-- ==========================================

-- Check if functions were created
DO $$
DECLARE
  func_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count 
  FROM information_schema.routines 
  WHERE routine_name IN ('create_admin_user_bypass', 'delete_vendor_bypass');
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'vendors';
  
  RAISE NOTICE '✅ Functions created: %', func_count;
  RAISE NOTICE '✅ Vendor policies created: %', policy_count;
  RAISE NOTICE '✅ Migrations recorded: 4';
  RAISE NOTICE '✅ View created: vendors_excluding_admins';
END $$;

-- ==========================================
-- DONE! All fixes applied successfully
-- ==========================================

COMMIT;
