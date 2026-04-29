/*
  # Optimize RLS Policies - Transactions & Notifications Tables

  1. Performance Optimization
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies

  2. Changes
    - Optimize transactions table policies
    - Optimize notifications table policies
*/

-- =====================================================
-- TRANSACTIONS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Approved vendors can view own transactions" ON transactions;

CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Approved vendors can view own transactions"
ON transactions FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

-- =====================================================
-- NOTIFICATIONS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Approved vendors can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Approved vendors can view own notifications" ON notifications;

CREATE POLICY "Approved vendors can update own notifications"
ON notifications FOR UPDATE
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

CREATE POLICY "Approved vendors can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);
