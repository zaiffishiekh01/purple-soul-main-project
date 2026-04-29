-- Migration: 002_create_vendor_delete_bypass
-- Date: 2026-04-11
-- Purpose: Create SECURITY DEFINER function to delete vendors bypassing RLS

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

-- Track migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('002_create_vendor_delete_bypass', 'Create vendor delete bypass function')
ON CONFLICT (migration_id) DO NOTHING;
