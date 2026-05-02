/*
  # Optimize RLS Policies - Part 4: Payment & Stripe Tables

  1. Tables in Part 4
    - payment_batches
    - bank_transfer_logs
    - transactions
    - stripe_connected_accounts
    - stripe_payment_intents
    - stripe_transfers
*/

-- ==========================================
-- PAYMENT_BATCHES
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage payment batches" ON payment_batches;
CREATE POLICY "Admins can manage payment batches"
  ON payment_batches
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ==========================================
-- BANK_TRANSFER_LOGS
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage transfer logs" ON bank_transfer_logs;
CREATE POLICY "Admins can manage transfer logs"
  ON bank_transfer_logs
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ==========================================
-- TRANSACTIONS
-- ==========================================

DROP POLICY IF EXISTS "Approved vendors can create own transactions" ON transactions;
CREATE POLICY "Approved vendors can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
        AND status = 'active'
    )
  );

-- ==========================================
-- STRIPE_CONNECTED_ACCOUNTS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view own Stripe account" ON stripe_connected_accounts;
CREATE POLICY "Vendors can view own Stripe account"
  ON stripe_connected_accounts
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can update own Stripe account" ON stripe_connected_accounts;
CREATE POLICY "Vendors can update own Stripe account"
  ON stripe_connected_accounts
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ==========================================
-- STRIPE_PAYMENT_INTENTS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view own payment intents" ON stripe_payment_intents;
CREATE POLICY "Vendors can view own payment intents"
  ON stripe_payment_intents
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ==========================================
-- STRIPE_TRANSFERS
-- ==========================================

DROP POLICY IF EXISTS "Vendors can view own transfers" ON stripe_transfers;
CREATE POLICY "Vendors can view own transfers"
  ON stripe_transfers
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = (SELECT auth.uid())
    )
  );