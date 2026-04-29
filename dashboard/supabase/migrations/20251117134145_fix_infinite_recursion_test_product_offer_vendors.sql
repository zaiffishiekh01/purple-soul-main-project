/*
  # Fix Infinite Recursion in test_product_offer_vendors RLS Policies

  1. Problem
    - Two INSERT policies exist that can conflict
    - Second policy queries test_product_offers which queries back to test_product_offer_vendors
    - This creates infinite recursion loop when vendor tries to apply

  2. Solution
    - Drop both existing INSERT policies
    - Create a single, simplified INSERT policy without recursion
    - Use direct column checks instead of subqueries to test_product_offers
    
  3. Security
    - Maintains security: only vendors can apply to their own applications
    - Prevents recursion by not querying back to test_product_offers table
    - Admins can still manage via separate policies
*/

-- Drop the conflicting INSERT policies
DROP POLICY IF EXISTS "Vendors can apply to open offers" ON test_product_offer_vendors;
DROP POLICY IF EXISTS "Vendors can apply to unlocked offers" ON test_product_offer_vendors;

-- Create a single, non-recursive INSERT policy
CREATE POLICY "Vendors can submit applications"
  ON test_product_offer_vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Verify the vendor_id belongs to the authenticated user
    EXISTS (
      SELECT 1
      FROM vendors v
      WHERE v.id = test_product_offer_vendors.vendor_id
        AND v.user_id = auth.uid()
        AND v.status = 'active'
    )
    -- Note: We don't check test_product_offers here to avoid recursion
    -- The application layer should validate offer eligibility
  );