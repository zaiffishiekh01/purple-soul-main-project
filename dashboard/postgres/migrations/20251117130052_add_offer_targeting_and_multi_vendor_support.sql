/*
  # Add Offer Targeting and Multi-Vendor Support
  
  This migration enhances the Test Product Offers system to support:
  
  ## New Features
  
  1. **Offer Targeting**
     - Admin can target offers to ALL vendors or specific vendor categories
     - New columns: `target_vendor_categories`, `is_targeted_offer`
     - If `is_targeted_offer = false` → visible to ALL vendors
     - If `is_targeted_offer = true` → only vendors in matching categories see it
  
  2. **Multi-Vendor Applications**
     - Multiple vendors can apply to the same offer
     - Admin reviews all applications and selects winner
     - Once `locked_vendor_id` is set, other vendors can't see the offer anymore
  
  3. **Visibility Rules**
     - Open offers: Visible to all (or targeted vendors)
     - Locked offers: Only visible to the locked vendor
     - Other vendors: Offer disappears from their view once locked
  
  ## Changes
  
  - Add `target_vendor_categories` array to test_product_offers
  - Add `is_targeted_offer` boolean (default false = all vendors)
  - Update RLS policies to enforce visibility rules
*/

-- Add new columns to test_product_offers
ALTER TABLE test_product_offers 
ADD COLUMN IF NOT EXISTS target_vendor_categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_targeted_offer boolean DEFAULT false;

-- Add helpful comment
COMMENT ON COLUMN test_product_offers.target_vendor_categories IS 
'Array of product categories to target specific vendors. Empty = all vendors if is_targeted_offer=false';

COMMENT ON COLUMN test_product_offers.is_targeted_offer IS 
'If false, offer visible to ALL vendors. If true, only vendors with matching product categories see it';

-- Drop existing vendor-side RLS policies for test_product_offers
DROP POLICY IF EXISTS "Vendors can view open test offers" ON test_product_offers;
DROP POLICY IF EXISTS "Vendors can view offers they applied to" ON test_product_offers;

-- Create new comprehensive vendor visibility policy
CREATE POLICY "Vendors can view test offers based on targeting and lock status"
  ON test_product_offers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors v
      WHERE v.user_id = auth.uid()
      AND v.status = 'active'
      AND (
        -- Case 1: Offer is not locked yet, check targeting rules
        (
          locked_vendor_id IS NULL
          AND status IN ('OPEN_FOR_VENDORS', 'UNDER_REVIEW')
          AND (
            -- Not targeted = visible to all
            is_targeted_offer = false
            OR
            -- Targeted offer = check if vendor's products match target categories
            (
              is_targeted_offer = true
              AND EXISTS (
                SELECT 1 FROM products p
                WHERE p.vendor_id = v.id
                AND p.category = ANY(target_vendor_categories)
              )
            )
          )
        )
        OR
        -- Case 2: Vendor is the locked vendor (always see their locked offers)
        locked_vendor_id = v.id
        OR
        -- Case 3: Vendor has an existing application (can see offer regardless)
        EXISTS (
          SELECT 1 FROM test_product_offer_vendors tpov
          WHERE tpov.offer_id = test_product_offers.id
          AND tpov.vendor_id = v.id
        )
      )
    )
  );

-- Update the vendor applications policy to allow multiple vendors
DROP POLICY IF EXISTS "Vendors can create applications" ON test_product_offer_vendors;

CREATE POLICY "Vendors can apply to unlocked offers"
  ON test_product_offer_vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors v
      WHERE v.user_id = auth.uid()
      AND v.id = vendor_id
      AND v.status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM test_product_offers tpo
      WHERE tpo.id = offer_id
      AND tpo.status = 'OPEN_FOR_VENDORS'
      AND tpo.locked_vendor_id IS NULL  -- Can only apply if not locked
    )
  );

-- Add index for performance on category matching
CREATE INDEX IF NOT EXISTS idx_test_offers_categories 
  ON test_product_offers USING gin(target_vendor_categories);

CREATE INDEX IF NOT EXISTS idx_test_offers_targeting 
  ON test_product_offers(is_targeted_offer, locked_vendor_id, status);

-- Add constraint to ensure categories exist if targeted
ALTER TABLE test_product_offers
ADD CONSTRAINT check_targeted_offer_categories
CHECK (
  (is_targeted_offer = false) 
  OR 
  (is_targeted_offer = true AND array_length(target_vendor_categories, 1) > 0)
);