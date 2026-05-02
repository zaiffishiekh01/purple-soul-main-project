/*
  # Optimize RLS Policies - Part 1

  1. Purpose
    - Replace auth.uid() with (select auth.uid()) in RLS policies
    - Prevents re-evaluation for each row
    - Significantly improves query performance at scale

  2. Tables Optimized
    - vendors
    - products
    - inventory
    - shipping_labels
*/

-- Drop and recreate vendors policies
DROP POLICY IF EXISTS "Vendors can view own profile" ON vendors;
DROP POLICY IF EXISTS "Vendors can insert own profile" ON vendors;
DROP POLICY IF EXISTS "Vendors can update own profile" ON vendors;

CREATE POLICY "Vendors can view own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Vendors can insert own profile"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate products policies
DROP POLICY IF EXISTS "Vendors can view own products" ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;

CREATE POLICY "Vendors can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

-- Drop and recreate inventory policies
DROP POLICY IF EXISTS "Vendors can view own inventory" ON inventory;
DROP POLICY IF EXISTS "Vendors can insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Vendors can update own inventory" ON inventory;

CREATE POLICY "Vendors can view own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Vendors can insert own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Vendors can update own inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

-- Drop and recreate shipping_labels policies
DROP POLICY IF EXISTS "Vendors can view own labels" ON shipping_labels;
DROP POLICY IF EXISTS "Vendors can insert own labels" ON shipping_labels;
DROP POLICY IF EXISTS "Vendors can update own labels" ON shipping_labels;
DROP POLICY IF EXISTS "Vendors can delete own labels" ON shipping_labels;

CREATE POLICY "Vendors can view own labels"
  ON shipping_labels FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can insert own labels"
  ON shipping_labels FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can update own labels"
  ON shipping_labels FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can delete own labels"
  ON shipping_labels FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));
