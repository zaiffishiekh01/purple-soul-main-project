/*
  # Fix Vendor Test Offer Visibility & Enable Vendor Requests

  ## Issue:
  Vendors cannot see open test offers due to RLS policy issues
  Vendors have no way to request new test products

  ## Solution:
  1. Add vendor request capability
  2. Simplify RLS policy for better performance
  3. Add new status: VENDOR_REQUESTED

  ## New Workflow:
  - Vendors can REQUEST test products (they want to make)
  - Admin reviews vendor requests
  - Admin can approve → OPEN_FOR_VENDORS or work directly with vendor
*/

-- Add columns for vendor-initiated requests
ALTER TABLE test_product_offers
ADD COLUMN IF NOT EXISTS vendor_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vendor_requester_id uuid REFERENCES vendors(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_test_offers_vendor_requester 
ON test_product_offers(vendor_requester_id) 
WHERE vendor_requester_id IS NOT NULL;

-- Update status constraint to include VENDOR_REQUESTED
ALTER TABLE test_product_offers DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE test_product_offers ADD CONSTRAINT valid_status CHECK (
  status IN (
    'DRAFT',
    'VENDOR_REQUESTED',
    'OPEN_FOR_VENDORS',
    'UNDER_REVIEW',
    'APPROVED_VENDOR_SELECTED',
    'TEST_IN_PROGRESS',
    'TEST_COMPLETED',
    'CANCELLED'
  )
);

-- Drop old vendor view policy
DROP POLICY IF EXISTS "Vendors can view open test product offers" ON test_product_offers;

-- Create improved vendor view policy
CREATE POLICY "Vendors can view open offers and their requests"
  ON test_product_offers FOR SELECT
  TO authenticated
  USING (
    -- Anyone can see open offers
    status = 'OPEN_FOR_VENDORS' OR
    status = 'UNDER_REVIEW' OR
    -- Vendors can see their own requests
    (vendor_requester_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )) OR
    -- Vendors can see offers they applied to
    (id IN (
      SELECT tpov.offer_id 
      FROM test_product_offer_vendors tpov
      INNER JOIN vendors v ON v.id = tpov.vendor_id
      WHERE v.user_id = auth.uid()
    ))
  );

-- Policy: Vendors can create test offer requests
CREATE POLICY "Vendors can request new test products"
  ON test_product_offers FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_requester_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) AND
    status = 'VENDOR_REQUESTED' AND
    vendor_requested = true AND
    created_by_admin_id IS NULL
  );

-- Policy: Vendors can update their own pending requests
CREATE POLICY "Vendors can update own requests"
  ON test_product_offers FOR UPDATE
  TO authenticated
  USING (
    vendor_requester_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) AND
    status = 'VENDOR_REQUESTED'
  )
  WITH CHECK (
    vendor_requester_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) AND
    status = 'VENDOR_REQUESTED'
  );

-- Policy: Vendors can delete their own pending requests
CREATE POLICY "Vendors can delete own requests"
  ON test_product_offers FOR DELETE
  TO authenticated
  USING (
    vendor_requester_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) AND
    status = 'VENDOR_REQUESTED'
  );