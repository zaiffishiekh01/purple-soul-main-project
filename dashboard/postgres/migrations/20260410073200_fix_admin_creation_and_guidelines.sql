-- =============================================
-- Fix Admin Creation & Product Guidelines
-- Run this ONCE in Supabase SQL Editor
-- =============================================

-- =============================================
-- PART 1: Fix Product Guidelines RLS Policies
-- =============================================

-- Drop old policies that use EXISTS (causing recursion)
DROP POLICY IF EXISTS "Admins can insert guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can update guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can view all guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Vendors can view active guidelines" ON product_guidelines;

-- Create new policies using is_admin() function (SECURITY DEFINER - no recursion)
CREATE POLICY "Admins can insert guidelines"
  ON product_guidelines FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update guidelines"
  ON product_guidelines FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete guidelines"
  ON product_guidelines FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can view all guidelines"
  ON product_guidelines FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Vendors can view active guidelines"
  ON product_guidelines FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default guidelines if table is empty
DO $guidelines$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM product_guidelines;
  
  IF v_count = 0 THEN
    INSERT INTO product_guidelines (title, content, section_order, is_active) VALUES
    ('Image Requirements', 
     '# Image Requirements

## Image Quality
- Minimum resolution: 800x800 pixels
- Recommended resolution: 1200x1200 pixels or higher
- Maximum file size: 5MB per image
- Accepted formats: JPG, PNG, WebP

## Image Content
- Product must be clearly visible and in focus
- Use plain white or neutral backgrounds
- Show the product from multiple angles
- Include scale reference (ruler, hand, or common object)

## Prohibited
- Watermarks or logos not belonging to your brand
- Misleading or edited images that alter product appearance
- Stock photos that don''t match the actual product
- Images with text overlays or promotional banners',
     1, true),

    ('Product Description Guidelines',
     '# Product Description Guidelines

## Required Information
- Product name (clear and descriptive)
- Key features and specifications
- Materials used
- Dimensions and weight
- Country of origin
- Care/maintenance instructions

## Description Format
- Use clear, concise language
- Highlight unique selling points
- Include relevant keywords naturally
- Avoid exaggeration or misleading claims

## Prohibited Content
- Profanity or offensive language
- Competitor brand mentions
- False claims or certifications
- External links or contact information',
     2, true),

    ('Pricing & Commission',
     '# Pricing & Commission

## How Pricing Works
- You set the base price for your product
- Platform commission is added on top (visible to customer)
- Example: Base $100 + 15% commission = Customer sees $115
- You receive $100, platform earns $15

## Pricing Rules
- Prices must be in USD
- Minimum price: $1.00
- Include all applicable taxes in your base price
- Sale prices must be lower than regular price

## Commission Rates
- Standard commission: 15% (configurable by admin)
- Commission is calculated on base price
- Final customer price = Base price + (Base price × Commission %)',
     3, true),

    ('Shipping & Fulfillment',
     '# Shipping & Fulfillment

## Shipping Requirements
- All orders must be shipped within 2 business days
- Provide accurate tracking information
- Use approved shipping programs only
- Package items securely to prevent damage

## Shipping Programs
- View available programs in Shipping & Logistics settings
- Each program has defined rates and weight limits
- Vendor rate = Base rate + Your markup
- Markup is your additional profit

## International Shipping
- Customs duties are buyer''s responsibility
- Include commercial invoice for international orders
- Declare accurate product value and description',
     4, true),

    ('Returns & Refunds',
     '# Returns & Refunds

## Return Policy
- Standard return window: 30 days from delivery
- Products must be in original condition
- Return shipping paid by: per configured return rules

## Return Process
1. Customer initiates return request
2. Admin/vendor reviews and approves
3. Return shipping label generated
4. Product received and inspected
5. Refund processed to customer

## Non-Returnable Items
- Digital products (once downloaded)
- Custom or personalized items
- Perishable goods
- Intimate or hygiene products (if opened)',
     5, true),

    ('Product Categories & Classification',
     '# Product Categories & Classification

## Category Selection
- Choose the most specific category available
- Products must match category definition
- Misc/Other category requires admin approval

## Required Attributes
- Each category has specific required fields
- Fill all mandatory fields before publishing
- Accurate classification helps customers find products

## Facets & Filters
- Add relevant filter attributes
- Helps customers narrow search results
- Include size, color, material where applicable',
     6, true);
  END IF;
END $guidelines$;

-- =============================================
-- PART 2: Fix Admin Access Requests
-- =============================================

-- Create admin_access_requests table if missing
CREATE TABLE IF NOT EXISTS admin_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_access_requests_status ON admin_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_access_requests_email ON admin_access_requests(email);

ALTER TABLE admin_access_requests ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can insert access requests" ON admin_access_requests;
DROP POLICY IF EXISTS "Admins can view access requests" ON admin_access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON admin_access_requests;

-- Create new policies
CREATE POLICY "Anyone can insert access requests"
  ON admin_access_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert access requests (anon)"
  ON admin_access_requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view access requests"
  ON admin_access_requests FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update access requests"
  ON admin_access_requests FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================
-- PART 3: Ensure create-admin edge function works
-- =============================================

-- The edge function requires is_super_admin check
-- Make sure the is_admin() and is_super_admin() functions exist
-- (These should already exist from previous migration)

-- Verify functions exist (if not, create them)
DO $ensure_admin_fn$
BEGIN
  -- Check is_admin
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin'
  ) THEN
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    STABLE
    SET search_path = public, pg_temp
    AS $is_admin_body$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
      );
    END;
    $is_admin_body$;
  END IF;

  -- Check is_super_admin
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_super_admin'
  ) THEN
    CREATE OR REPLACE FUNCTION is_super_admin()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    STABLE
    SET search_path = public, pg_temp
    AS $is_super_admin_body$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
        AND (role = 'super_admin' OR is_super_admin = true)
      );
    END;
    $is_super_admin_body$;
  END IF;
END $ensure_admin_fn$;

-- =============================================
-- PART 4: Fix get_admin_permissions function 
-- (in case it wasn't created correctly)
-- =============================================

CREATE OR REPLACE FUNCTION get_admin_permissions(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_is_super_admin boolean;
  v_role text;
  v_permissions jsonb;
  v_vendor_mgmt boolean := false;
  v_order_mgmt boolean := false;
  v_product_mgmt boolean := false;
  v_finance_mgmt boolean := false;
  v_analytics_monitor boolean := false;
BEGIN
  SELECT
    COALESCE(au.is_super_admin, false),
    au.role,
    au.permissions
  INTO v_is_super_admin, v_role, v_permissions
  FROM admin_users au
  WHERE au.user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN '{"vendor_management":false,"order_management":false,"product_management":false,"finance_management":false,"analytics_monitoring":false,"is_super_admin":false}';
  END IF;

  -- Super admin gets all permissions
  IF v_is_super_admin OR v_role = 'super_admin' THEN
    RETURN '{"vendor_management":true,"order_management":true,"product_management":true,"finance_management":true,"analytics_monitoring":true,"is_super_admin":true}';
  END IF;

  -- Extract regular admin permissions safely
  BEGIN
    IF v_permissions IS NOT NULL THEN
      v_vendor_mgmt := COALESCE((v_permissions->>'vendor_management')::boolean, false);
      v_order_mgmt := COALESCE((v_permissions->>'order_management')::boolean, false);
      v_product_mgmt := COALESCE((v_permissions->>'product_management')::boolean, false);
      v_finance_mgmt := COALESCE((v_permissions->>'finance_management')::boolean, false);
      v_analytics_monitor := COALESCE((v_permissions->>'analytics_monitoring')::boolean, false);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Use defaults if JSON parsing fails
    v_vendor_mgmt := false;
    v_order_mgmt := false;
    v_product_mgmt := false;
    v_finance_mgmt := false;
    v_analytics_monitor := false;
  END;

  RETURN jsonb_build_object(
    'vendor_management', v_vendor_mgmt,
    'order_management', v_order_mgmt,
    'product_management', v_product_mgmt,
    'finance_management', v_finance_mgmt,
    'analytics_monitoring', v_analytics_monitor,
    'is_super_admin', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_permissions(uuid) TO authenticated;

-- =============================================
-- Done!
-- =============================================
SELECT '✅ Admin creation and Product Guidelines fixed!' AS status;
