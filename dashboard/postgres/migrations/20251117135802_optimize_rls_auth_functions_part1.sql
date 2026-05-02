/*
  # Optimize RLS Policies - Part 1: Auth Function Performance

  1. Problem
    - RLS policies call auth.uid() for each row evaluation
    - This causes suboptimal performance at scale
    - Each row triggers a function call instead of reusing the value

  2. Solution
    - Wrap auth.uid() and auth.jwt() in SELECT subqueries
    - This evaluates the function once per statement instead of per row
    - Dramatically improves query performance for large datasets

  3. Tables in Part 1
    - notifications
    - digital_product_files
    - product_licenses
    - download_logs
*/

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

DROP POLICY IF EXISTS "Admins can insert notifications for any vendor" ON notifications;
CREATE POLICY "Admins can insert notifications for any vendor"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- ==========================================
-- DIGITAL_PRODUCT_FILES
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view their digital product files" ON digital_product_files;
CREATE POLICY "Vendors can view their digital product files"
  ON digital_product_files
  FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products
      WHERE vendor_id IN (
        SELECT id FROM vendors
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Vendors can insert their digital product files" ON digital_product_files;
CREATE POLICY "Vendors can insert their digital product files"
  ON digital_product_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    product_id IN (
      SELECT id FROM products
      WHERE vendor_id IN (
        SELECT id FROM vendors
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Vendors can delete their digital product files" ON digital_product_files;
CREATE POLICY "Vendors can delete their digital product files"
  ON digital_product_files
  FOR DELETE
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products
      WHERE vendor_id IN (
        SELECT id FROM vendors
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );

-- ==========================================
-- PRODUCT_LICENSES
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view licenses for their products" ON product_licenses;
CREATE POLICY "Vendors can view licenses for their products"
  ON product_licenses
  FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products
      WHERE vendor_id IN (
        SELECT id FROM vendors
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );

-- ==========================================
-- DOWNLOAD_LOGS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view download logs for their products" ON download_logs;
CREATE POLICY "Vendors can view download logs for their products"
  ON download_logs
  FOR SELECT
  TO authenticated
  USING (
    license_id IN (
      SELECT id FROM product_licenses
      WHERE product_id IN (
        SELECT id FROM products
        WHERE vendor_id IN (
          SELECT id FROM vendors
          WHERE user_id = (SELECT auth.uid())
        )
      )
    )
  );