/*
  # Optimize RLS Policies - Part 2: Platform & Customer Tables

  1. Tables in Part 2
    - platform_settings
    - customers
    - regional_price_rules
*/

-- ==========================================
-- PLATFORM_SETTINGS
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;
CREATE POLICY "Admins can manage platform settings"
  ON platform_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ==========================================
-- CUSTOMERS
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
CREATE POLICY "Admins can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ==========================================
-- REGIONAL_PRICE_RULES
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage regional price rules" ON regional_price_rules;
CREATE POLICY "Admins can manage regional price rules"
  ON regional_price_rules
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Vendors can view their price rules" ON regional_price_rules;
CREATE POLICY "Vendors can view their price rules"
  ON regional_price_rules
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
    OR product_id IN (
      SELECT id FROM products
      WHERE vendor_id IN (
        SELECT id FROM vendors
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );