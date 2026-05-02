/*
  # Optimize RLS Policies - Shipments & Returns Tables

  1. Performance Optimization
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies

  2. Changes
    - Optimize shipments table policies
    - Optimize returns table policies
*/

-- =====================================================
-- SHIPMENTS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can update all shipments" ON shipments;
DROP POLICY IF EXISTS "Admins can view all shipments" ON shipments;
DROP POLICY IF EXISTS "Approved vendors can insert own shipments" ON shipments;
DROP POLICY IF EXISTS "Approved vendors can update own shipments" ON shipments;
DROP POLICY IF EXISTS "Approved vendors can view own shipments" ON shipments;

CREATE POLICY "Admins can update all shipments"
ON shipments FOR UPDATE
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

CREATE POLICY "Admins can view all shipments"
ON shipments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Approved vendors can insert own shipments"
ON shipments FOR INSERT
TO authenticated
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can update own shipments"
ON shipments FOR UPDATE
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

CREATE POLICY "Approved vendors can view own shipments"
ON shipments FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

-- =====================================================
-- RETURNS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can update all returns" ON returns;
DROP POLICY IF EXISTS "Admins can view all returns" ON returns;
DROP POLICY IF EXISTS "Approved vendors can update own returns" ON returns;
DROP POLICY IF EXISTS "Approved vendors can view own returns" ON returns;

CREATE POLICY "Admins can update all returns"
ON returns FOR UPDATE
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

CREATE POLICY "Admins can view all returns"
ON returns FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Approved vendors can update own returns"
ON returns FOR UPDATE
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

CREATE POLICY "Approved vendors can view own returns"
ON returns FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);
