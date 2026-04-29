-- Fix Vendor Deletion & Separate Vendors from Admins
-- Run this ENTIRE script in Supabase SQL Editor

-- ==========================================
-- PART 1: Create Database Function to Delete Vendors (Bypasses RLS)
-- ==========================================

CREATE OR REPLACE FUNCTION delete_vendor_bypass(p_vendor_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges, bypassing RLS
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Delete the vendor
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

COMMENT ON FUNCTION delete_vendor_bypass IS 'Deletes a vendor bypassing RLS. Callable by authenticated admins.';

-- ==========================================
-- PART 2: Fix RLS Policies for Vendors
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "vendors_delete_policy" ON vendors;
DROP POLICY IF EXISTS "vendors_read_policy" ON vendors;
DROP POLICY IF EXISTS "vendors_insert_policy" ON vendors;
DROP POLICY IF EXISTS "vendors_update_policy" ON vendors;

-- Create comprehensive RLS policies

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

-- Delete: Use the SECURITY DEFINER function instead of direct policy
-- This policy is here for compatibility but the function handles actual deletion
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

-- ==========================================
-- PART 3: Create View for Vendors Only (Excluding Admins)
-- ==========================================

CREATE OR REPLACE VIEW vendors_excluding_admins AS
SELECT v.*
FROM vendors v
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users au WHERE au.user_id = v.user_id
);

COMMENT ON VIEW vendors_excluding_admins IS 'Vendors list excluding users who are also admins.';

-- ==========================================
-- PART 4: Verify Everything
-- ==========================================

-- Check if functions were created
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_vendor_bypass', 'create_admin_user_bypass');

-- Check policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'vendors'
ORDER BY cmd, policyname;

-- Check if view was created
SELECT schemaname, viewname
FROM pg_views
WHERE viewname = 'vendors_excluding_admins';

-- ==========================================
-- DONE! Test vendor deletion now
-- ==========================================
