/*
  # Optimize RLS Policies - Part 3: Fee Waivers & Warehouse

  1. Tables in Part 3
    - fee_waiver_requests
    - warehouse_requests
    - warehouse_inventory
*/

-- ==========================================
-- FEE_WAIVER_REQUESTS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view own fee waiver requests" ON fee_waiver_requests;
CREATE POLICY "Vendors can view own fee waiver requests"
  ON fee_waiver_requests
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can create fee waiver requests" ON fee_waiver_requests;
CREATE POLICY "Vendors can create fee waiver requests"
  ON fee_waiver_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can update own pending requests" ON fee_waiver_requests;
CREATE POLICY "Vendors can update own pending requests"
  ON fee_waiver_requests
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
    AND status = 'PENDING'
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all fee waiver requests" ON fee_waiver_requests;
CREATE POLICY "Admins can view all fee waiver requests"
  ON fee_waiver_requests
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update fee waiver requests" ON fee_waiver_requests;
CREATE POLICY "Admins can update fee waiver requests"
  ON fee_waiver_requests
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ==========================================
-- WAREHOUSE_REQUESTS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view own warehouse requests" ON warehouse_requests;
CREATE POLICY "Vendors can view own warehouse requests"
  ON warehouse_requests
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can create warehouse requests" ON warehouse_requests;
CREATE POLICY "Vendors can create warehouse requests"
  ON warehouse_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can update own pending requests" ON warehouse_requests;
CREATE POLICY "Vendors can update own pending requests"
  ON warehouse_requests
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
    AND status = 'PENDING'
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all warehouse requests" ON warehouse_requests;
CREATE POLICY "Admins can view all warehouse requests"
  ON warehouse_requests
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update warehouse requests" ON warehouse_requests;
CREATE POLICY "Admins can update warehouse requests"
  ON warehouse_requests
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ==========================================
-- WAREHOUSE_INVENTORY
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view own warehouse inventory" ON warehouse_inventory;
CREATE POLICY "Vendors can view own warehouse inventory"
  ON warehouse_inventory
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all warehouse inventory" ON warehouse_inventory;
CREATE POLICY "Admins can view all warehouse inventory"
  ON warehouse_inventory
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert warehouse inventory" ON warehouse_inventory;
CREATE POLICY "Admins can insert warehouse inventory"
  ON warehouse_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update warehouse inventory" ON warehouse_inventory;
CREATE POLICY "Admins can update warehouse inventory"
  ON warehouse_inventory
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());