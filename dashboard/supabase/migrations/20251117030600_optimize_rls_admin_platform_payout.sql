/*
  # Optimize RLS Policies - Admin, Platform Fees, Payout Requests, Guidelines Tables

  1. Performance Optimization
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies

  2. Changes
    - Optimize admin_users table policies
    - Optimize platform_fees table policies
    - Optimize payout_requests table policies
    - Optimize product_guidelines table policies
*/

-- =====================================================
-- ADMIN USERS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can read own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;

CREATE POLICY "Admins can read own data"
ON admin_users FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Super admins can view all admin users"
ON admin_users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = (SELECT auth.uid())
    AND au.role = 'super_admin'
  )
);

-- =====================================================
-- PLATFORM FEES TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert platform fees" ON platform_fees;
DROP POLICY IF EXISTS "Admins can update platform fees" ON platform_fees;
DROP POLICY IF EXISTS "Admins can view all platform fees" ON platform_fees;
DROP POLICY IF EXISTS "Vendors can view their own platform fees" ON platform_fees;

CREATE POLICY "Admins can insert platform fees"
ON platform_fees FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can update platform fees"
ON platform_fees FOR UPDATE
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

CREATE POLICY "Admins can view all platform fees"
ON platform_fees FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Vendors can view their own platform fees"
ON platform_fees FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- PAYOUT REQUESTS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can update payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Admins can view all payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Vendors can create payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Vendors can view their own payout requests" ON payout_requests;

CREATE POLICY "Admins can update payout requests"
ON payout_requests FOR UPDATE
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

CREATE POLICY "Admins can view all payout requests"
ON payout_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Vendors can create payout requests"
ON payout_requests FOR INSERT
TO authenticated
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Vendors can view their own payout requests"
ON payout_requests FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- PRODUCT GUIDELINES TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can update guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can view all guidelines" ON product_guidelines;

CREATE POLICY "Admins can insert guidelines"
ON product_guidelines FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can update guidelines"
ON product_guidelines FOR UPDATE
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

CREATE POLICY "Admins can view all guidelines"
ON product_guidelines FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);
