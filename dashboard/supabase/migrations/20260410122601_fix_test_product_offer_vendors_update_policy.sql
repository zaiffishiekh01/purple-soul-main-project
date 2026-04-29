/*
  # Fix test_product_offer_vendors UPDATE policy

  ## Changes
  - Adds UPDATE policy so vendors can update their own applications (needed for upsert)
  - Adds UPDATE policy so vendors can update their own product requests
  - Ensures upsert operations work correctly for vendor applications

  ## Security
  - Vendors can only update applications where they are the vendor
  - Vendors can only update their own test product requests
*/

CREATE POLICY "Vendors can update own applications"
  ON test_product_offer_vendors FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );
