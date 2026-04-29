/*
  # Optimize RLS Policies - Inventory & Orders Tables

  1. Performance Optimization
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies
    - Prevents re-evaluation of auth functions for each row

  2. Changes
    - Optimize inventory table policies
    - Optimize orders table policies
*/

-- =====================================================
-- INVENTORY TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Approved vendors can insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Approved vendors can update own inventory" ON inventory;
DROP POLICY IF EXISTS "Approved vendors can view own inventory" ON inventory;

CREATE POLICY "Approved vendors can insert own inventory"
ON inventory FOR INSERT
TO authenticated
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can update own inventory"
ON inventory FOR UPDATE
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
)
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can view own inventory"
ON inventory FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

-- =====================================================
-- ORDERS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Approved vendors can update own orders" ON orders;
DROP POLICY IF EXISTS "Approved vendors can view own orders" ON orders;

CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Approved vendors can update own orders"
ON orders FOR UPDATE
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
)
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can view own orders"
ON orders FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);
