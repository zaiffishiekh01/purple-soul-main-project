/*
  # Create Payout Settings Table

  1. Purpose
    - Store vendor payout preferences and bank details
    - Manage payout frequency and methods

  2. New Tables
    - `payout_settings`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, foreign key to vendors, unique)
      - `payout_frequency` (text - daily, weekly, monthly)
      - `payout_day` (text - day of week or month)
      - `payout_method` (text - bank_transfer, paypal, etc)
      - `bank_account_last4` (text)
      - `bank_name` (text)
      - `minimum_payout` (decimal)
      - `auto_payout_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS
    - Vendors can only access their own settings
*/

CREATE TABLE IF NOT EXISTS payout_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE UNIQUE NOT NULL,
  payout_frequency text DEFAULT 'weekly' CHECK (payout_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  payout_day text DEFAULT 'Monday',
  payout_method text DEFAULT 'bank_transfer' CHECK (payout_method IN ('bank_transfer', 'paypal', 'stripe')),
  bank_account_last4 text DEFAULT '',
  bank_name text DEFAULT '',
  minimum_payout decimal(10, 2) DEFAULT 50.00,
  auto_payout_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payout_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Vendors can view own payout settings"
  ON payout_settings FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can insert own payout settings"
  ON payout_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update own payout settings"
  ON payout_settings FOR UPDATE
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

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_payout_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payout_settings_updated_at
  BEFORE UPDATE ON payout_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_settings_updated_at();

-- Add default payout settings for Test Vendor
DO $$
DECLARE
  v_vendor_id uuid;
BEGIN
  SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1;
  
  IF v_vendor_id IS NOT NULL THEN
    INSERT INTO payout_settings (
      vendor_id, payout_frequency, payout_day, payout_method,
      bank_account_last4, bank_name, minimum_payout, auto_payout_enabled
    ) VALUES (
      v_vendor_id, 'weekly', 'Monday', 'bank_transfer',
      '4532', 'Chase Bank', 100.00, true
    )
    ON CONFLICT (vendor_id) DO UPDATE SET
      payout_frequency = EXCLUDED.payout_frequency,
      payout_day = EXCLUDED.payout_day,
      payout_method = EXCLUDED.payout_method,
      bank_account_last4 = EXCLUDED.bank_account_last4,
      bank_name = EXCLUDED.bank_name;
  END IF;
END $$;
