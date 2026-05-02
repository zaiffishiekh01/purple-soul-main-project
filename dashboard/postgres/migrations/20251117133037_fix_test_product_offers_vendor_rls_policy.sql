/*
  # Fix Test Product Offers Vendor RLS Policy

  1. Problem
    - The existing RLS policy has a bug where it checks vendor.status against offer status values
    - This prevents vendors from seeing ANY test product offers
    - Line: `v.status = ANY (ARRAY['OPEN_FOR_VENDORS', 'UNDER_REVIEW'])`
      should be checking the OFFER status, not vendor status

  2. Solution
    - Drop the incorrect policy
    - Create a corrected policy that properly checks offer status
    - Ensure vendors can see:
      - Non-targeted offers with status OPEN_FOR_VENDORS or UNDER_REVIEW
      - Targeted offers where vendor has matching product categories
      - Offers they've already applied to
      - Offers locked to them

  3. Security
    - Maintains RLS protection
    - Only shows offers to active vendors
    - Respects targeting logic
*/

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Vendors can view test offers based on targeting and lock status" ON test_product_offers;

-- Create the corrected policy
CREATE POLICY "Vendors can view test offers based on targeting and lock status"
  ON test_product_offers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM vendors v
      WHERE v.user_id = auth.uid()
        AND v.status = 'active'
        AND (
          -- Case 1: Offer is locked to this specific vendor
          (test_product_offers.locked_vendor_id = v.id)
          OR
          -- Case 2: Vendor has already applied to this offer
          (
            EXISTS (
              SELECT 1
              FROM test_product_offer_vendors tpov
              WHERE tpov.offer_id = test_product_offers.id
                AND tpov.vendor_id = v.id
            )
          )
          OR
          -- Case 3: Offer is open and not locked to anyone
          (
            test_product_offers.locked_vendor_id IS NULL
            AND test_product_offers.status IN ('OPEN_FOR_VENDORS', 'UNDER_REVIEW')
            AND (
              -- Case 3a: Non-targeted offer (available to all)
              (test_product_offers.is_targeted_offer = false)
              OR
              -- Case 3b: Targeted offer where vendor has matching products
              (
                test_product_offers.is_targeted_offer = true
                AND EXISTS (
                  SELECT 1
                  FROM products p
                  WHERE p.vendor_id = v.id
                    AND p.category = ANY(test_product_offers.target_vendor_categories)
                )
              )
            )
          )
        )
    )
  );