/*
  # Optimize RLS Policies - Support, Shipping, Payout Tables

  1. Performance Optimization
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies

  2. Changes
    - Optimize support_tickets table policies
    - Optimize shipping_labels table policies
    - Optimize payout_settings table policies
*/

-- =====================================================
-- SUPPORT TICKETS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Approved vendors can insert own support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Approved vendors can update own support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Approved vendors can view own support tickets" ON support_tickets;

CREATE POLICY "Approved vendors can insert own support tickets"
ON support_tickets FOR INSERT
TO authenticated
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can update own support tickets"
ON support_tickets FOR UPDATE
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

CREATE POLICY "Approved vendors can view own support tickets"
ON support_tickets FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

-- =====================================================
-- SHIPPING LABELS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Approved vendors can insert own shipping labels" ON shipping_labels;
DROP POLICY IF EXISTS "Approved vendors can update own shipping labels" ON shipping_labels;
DROP POLICY IF EXISTS "Approved vendors can view own shipping labels" ON shipping_labels;

CREATE POLICY "Approved vendors can insert own shipping labels"
ON shipping_labels FOR INSERT
TO authenticated
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can update own shipping labels"
ON shipping_labels FOR UPDATE
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

CREATE POLICY "Approved vendors can view own shipping labels"
ON shipping_labels FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

-- =====================================================
-- PAYOUT SETTINGS TABLE RLS OPTIMIZATION
-- =====================================================

DROP POLICY IF EXISTS "Approved vendors can insert own payout settings" ON payout_settings;
DROP POLICY IF EXISTS "Approved vendors can update own payout settings" ON payout_settings;
DROP POLICY IF EXISTS "Approved vendors can view own payout settings" ON payout_settings;

CREATE POLICY "Approved vendors can insert own payout settings"
ON payout_settings FOR INSERT
TO authenticated
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can update own payout settings"
ON payout_settings FOR UPDATE
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

CREATE POLICY "Approved vendors can view own payout settings"
ON payout_settings FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);
