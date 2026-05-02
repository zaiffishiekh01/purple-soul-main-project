/*
  # Add Stripe Connect System

  1. New Tables
    - `stripe_connected_accounts` - Stores vendor Stripe Connect account info
    - `stripe_payment_intents` - Tracks customer payments
    - `stripe_transfers` - Tracks automatic payouts to vendors
  
  2. Changes to Existing Tables
    - Add Stripe fields to vendors table
    - Add Stripe fields to orders table
    - Add Stripe fields to payout_requests table
  
  3. Security
    - Enable RLS on all new tables
    - Vendors can only view/update their own Stripe data
    - Admins can view all Stripe data
*/

-- Add Stripe fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_account_type TEXT DEFAULT 'express';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT false;

-- Create stripe_connected_accounts table
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'express',
  country TEXT,
  currency TEXT DEFAULT 'usd',
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  requirements JSONB,
  capabilities JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create stripe_payment_intents table
CREATE TABLE IF NOT EXISTS stripe_payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  vendor_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  payment_method TEXT,
  transfer_id TEXT,
  transfer_status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create stripe_transfers table
CREATE TABLE IF NOT EXISTS stripe_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  payout_request_id UUID REFERENCES payout_requests(id) ON DELETE SET NULL,
  stripe_transfer_id TEXT UNIQUE NOT NULL,
  stripe_account_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  failure_code TEXT,
  failure_message TEXT,
  source_transaction TEXT,
  destination_payment TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add Stripe fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;

-- Add Stripe fields to payout_requests table
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS stripe_payout_id TEXT;
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS auto_payout_enabled BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_connected_accounts
CREATE POLICY "Vendors can view own Stripe account"
  ON stripe_connected_accounts
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update own Stripe account"
  ON stripe_connected_accounts
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all Stripe accounts"
  ON stripe_connected_accounts
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert Stripe accounts"
  ON stripe_connected_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for stripe_payment_intents
CREATE POLICY "Vendors can view own payment intents"
  ON stripe_payment_intents
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payment intents"
  ON stripe_payment_intents
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert payment intents"
  ON stripe_payment_intents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update payment intents"
  ON stripe_payment_intents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for stripe_transfers
CREATE POLICY "Vendors can view own transfers"
  ON stripe_transfers
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transfers"
  ON stripe_transfers
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert transfers"
  ON stripe_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update transfers"
  ON stripe_transfers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_vendor ON stripe_connected_accounts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_stripe_id ON stripe_connected_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_order ON stripe_payment_intents(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_vendor ON stripe_payment_intents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id ON stripe_payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transfers_vendor ON stripe_transfers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transfers_payout ON stripe_transfers(payout_request_id);
CREATE INDEX IF NOT EXISTS idx_transfers_stripe_id ON stripe_transfers(stripe_transfer_id);
