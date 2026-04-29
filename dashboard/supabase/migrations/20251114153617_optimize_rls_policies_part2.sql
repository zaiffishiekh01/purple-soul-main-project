/*
  # Optimize RLS Policies - Part 2

  1. Tables Optimized
    - orders
    - order_items
    - shipments
    - returns
    - return_items
*/

-- Drop and recreate orders policies
DROP POLICY IF EXISTS "Vendors can view own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can update own orders" ON orders;

CREATE POLICY "Vendors can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

-- Drop and recreate order_items policies
DROP POLICY IF EXISTS "Vendors can view own order items" ON order_items;

CREATE POLICY "Vendors can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

-- Drop and recreate shipments policies
DROP POLICY IF EXISTS "Vendors can view own shipments" ON shipments;
DROP POLICY IF EXISTS "Vendors can insert own shipments" ON shipments;
DROP POLICY IF EXISTS "Vendors can update own shipments" ON shipments;

CREATE POLICY "Vendors can view own shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Vendors can insert own shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Vendors can update own shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  )
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

-- Drop and recreate returns policies
DROP POLICY IF EXISTS "Vendors can view own returns" ON returns;
DROP POLICY IF EXISTS "Vendors can update own returns" ON returns;

CREATE POLICY "Vendors can view own returns"
  ON returns FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can update own returns"
  ON returns FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

-- Drop and recreate return_items policies
DROP POLICY IF EXISTS "Vendors can view own return items" ON return_items;

CREATE POLICY "Vendors can view own return items"
  ON return_items FOR SELECT
  TO authenticated
  USING (
    return_id IN (
      SELECT id FROM returns WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );
