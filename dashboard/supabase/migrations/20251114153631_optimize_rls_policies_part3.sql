/*
  # Optimize RLS Policies - Part 3

  1. Tables Optimized
    - labels
    - order_labels
    - transactions
    - payouts
    - notifications
*/

-- Drop and recreate labels policies
DROP POLICY IF EXISTS "Vendors can view own labels" ON labels;
DROP POLICY IF EXISTS "Vendors can insert own labels" ON labels;
DROP POLICY IF EXISTS "Vendors can update own labels" ON labels;
DROP POLICY IF EXISTS "Vendors can delete own labels" ON labels;

CREATE POLICY "Vendors can view own labels"
  ON labels FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can insert own labels"
  ON labels FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can update own labels"
  ON labels FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can delete own labels"
  ON labels FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

-- Drop and recreate order_labels policies - Remove duplicate
DROP POLICY IF EXISTS "Vendors can view own order labels" ON order_labels;
DROP POLICY IF EXISTS "Vendors can manage own order labels" ON order_labels;

CREATE POLICY "Vendors can manage own order labels"
  ON order_labels FOR ALL
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

-- Drop and recreate transactions policies
DROP POLICY IF EXISTS "Vendors can view own transactions" ON transactions;

CREATE POLICY "Vendors can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

-- Drop and recreate payouts policies
DROP POLICY IF EXISTS "Vendors can view own payouts" ON payouts;

CREATE POLICY "Vendors can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

-- Drop and recreate notifications policies
DROP POLICY IF EXISTS "Vendors can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Vendors can update own notifications" ON notifications;

CREATE POLICY "Vendors can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));
