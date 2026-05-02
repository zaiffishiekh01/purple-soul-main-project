/*
  # Optimize RLS Policies - Part 5: Test Product Offers (Correct Column Names)

  1. Tables in Part 5
    - test_product_offers
    - test_product_offer_vendors
    - test_product_offer_messages
*/

-- ==========================================
-- TEST_PRODUCT_OFFERS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can create test product offers" ON test_product_offers;
CREATE POLICY "Vendors can create test product offers"
  ON test_product_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_admin_id IN (
      SELECT id FROM admin_users
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view test product offers" ON test_product_offers;
CREATE POLICY "Users can view test product offers"
  ON test_product_offers
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Users can update test product offers" ON test_product_offers;
CREATE POLICY "Users can update test product offers"
  ON test_product_offers
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Vendors can view open test product offers" ON test_product_offers;
CREATE POLICY "Vendors can view open test product offers"
  ON test_product_offers
  FOR SELECT
  TO authenticated
  USING (
    status IN ('OPEN_FOR_VENDORS', 'UNDER_REVIEW')
    AND (is_targeted_offer = false OR is_targeted_offer IS NULL)
    AND EXISTS (
      SELECT 1 FROM vendors
      WHERE user_id = (SELECT auth.uid())
        AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Vendors can view test offers based on targeting and lock status" ON test_product_offers;
CREATE POLICY "Vendors can view test offers based on targeting and lock status"
  ON test_product_offers
  FOR SELECT
  TO authenticated
  USING (
    status IN ('OPEN_FOR_VENDORS', 'UNDER_REVIEW')
    AND is_targeted_offer = true
    AND EXISTS (
      SELECT 1 FROM vendors v
      INNER JOIN products p ON p.vendor_id = v.id
      WHERE v.user_id = (SELECT auth.uid())
        AND v.status = 'active'
        AND p.category = ANY(target_vendor_categories)
    )
  );

-- ==========================================
-- TEST_PRODUCT_OFFER_VENDORS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view own applications" ON test_product_offer_vendors;
CREATE POLICY "Vendors can view own applications"
  ON test_product_offer_vendors
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Allow vendor and admin applications" ON test_product_offer_vendors;
CREATE POLICY "Allow vendor and admin applications"
  ON test_product_offer_vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can update own pending applications" ON test_product_offer_vendors;
CREATE POLICY "Vendors can update own pending applications"
  ON test_product_offer_vendors
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
    AND status = 'APPLIED'
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ==========================================
-- TEST_PRODUCT_OFFER_MESSAGES
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view messages for their applications" ON test_product_offer_messages;
CREATE POLICY "Vendors can view messages for their applications"
  ON test_product_offer_messages
  FOR SELECT
  TO authenticated
  USING (
    offer_id IN (
      SELECT offer_id FROM test_product_offer_vendors
      WHERE vendor_id IN (
        SELECT id FROM vendors
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Vendors can send messages for their applications" ON test_product_offer_messages;
CREATE POLICY "Vendors can send messages for their applications"
  ON test_product_offer_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
    AND offer_id IN (
      SELECT offer_id FROM test_product_offer_vendors
      WHERE vendor_id = sender_vendor_id
    )
  );

DROP POLICY IF EXISTS "Admins can send messages" ON test_product_offer_messages;
CREATE POLICY "Admins can send messages"
  ON test_product_offer_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_admin_id IN (
      SELECT id FROM admin_users
      WHERE user_id = (SELECT auth.uid())
    )
  );