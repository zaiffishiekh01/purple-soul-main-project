/*
  # Update All Policies to Use is_admin() Function

  1. Problem
    - All policies that check admin status have potential recursion
    - They query admin_users which triggers RLS on admin_users

  2. Solution
    - Replace all EXISTS (SELECT 1 FROM admin_users...) with is_admin()
    - The SECURITY DEFINER function bypasses RLS, preventing recursion

  3. Changes
    - Update policies on: vendors, products, orders, shipments, returns
    - Update policies on: transactions, platform_fees, payout_requests
    - Update policies on: product_guidelines
*/

-- =====================================================
-- VENDORS TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can delete vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can update vendor approval" ON vendors;
DROP POLICY IF EXISTS "Admins can view all vendors" ON vendors;

CREATE POLICY "Admins can delete vendors"
ON vendors FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update vendor approval"
ON vendors FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all vendors"
ON vendors FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- PRODUCTS TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can update all products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;

CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all products"
ON products FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all products"
ON products FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- ORDERS TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- SHIPMENTS TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can update all shipments" ON shipments;
DROP POLICY IF EXISTS "Admins can view all shipments" ON shipments;

CREATE POLICY "Admins can update all shipments"
ON shipments FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all shipments"
ON shipments FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- RETURNS TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can update all returns" ON returns;
DROP POLICY IF EXISTS "Admins can view all returns" ON returns;

CREATE POLICY "Admins can update all returns"
ON returns FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all returns"
ON returns FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- TRANSACTIONS TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;

CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- PLATFORM FEES TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert platform fees" ON platform_fees;
DROP POLICY IF EXISTS "Admins can update platform fees" ON platform_fees;
DROP POLICY IF EXISTS "Admins can view all platform fees" ON platform_fees;

CREATE POLICY "Admins can insert platform fees"
ON platform_fees FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update platform fees"
ON platform_fees FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all platform fees"
ON platform_fees FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- PAYOUT REQUESTS TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can update payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Admins can view all payout requests" ON payout_requests;

CREATE POLICY "Admins can update payout requests"
ON payout_requests FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all payout requests"
ON payout_requests FOR SELECT
TO authenticated
USING (is_admin());

-- =====================================================
-- PRODUCT GUIDELINES TABLE - Use is_admin()
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can update guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can view all guidelines" ON product_guidelines;

CREATE POLICY "Admins can insert guidelines"
ON product_guidelines FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update guidelines"
ON product_guidelines FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all guidelines"
ON product_guidelines FOR SELECT
TO authenticated
USING (is_admin());
