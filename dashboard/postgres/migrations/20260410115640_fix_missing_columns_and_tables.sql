/*
  # Fix Missing Columns and Tables

  ## Changes:
  1. Add full_name to admin_users
  2. Add business_type, created_at to vendors
  3. Create fee_waiver_requests table
  4. Seed platform_settings defaults
  5. Fix admin_preferences if not already set up correctly
*/

-- Add full_name to admin_users if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN full_name text DEFAULT '';
  END IF;
END $$;

-- Add business_type to vendors if missing  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'business_type'
  ) THEN
    ALTER TABLE vendors ADD COLUMN business_type text DEFAULT '';
  END IF;
END $$;

-- Add created_at to vendors if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE vendors ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Seed default platform settings (no description column)
INSERT INTO platform_settings (setting_key, setting_value) VALUES
  ('platform_commission_rate', '15'),
  ('minimum_payout_amount', '50'),
  ('auto_approve_vendors', 'false'),
  ('max_products_per_vendor', '500'),
  ('platform_currency', 'USD')
ON CONFLICT (setting_key) DO NOTHING;

-- Fix platform_settings RLS if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'platform_settings' AND policyname = 'Admins can manage platform settings'
  ) THEN
    ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
    
    EXECUTE 'CREATE POLICY "Admins can manage platform settings" ON platform_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))';
  END IF;
END $$;

-- ============================================================
-- FEE WAIVER REQUESTS (if not already existing)
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_waiver_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  request_type text DEFAULT 'commission',
  amount numeric DEFAULT 0,
  reason text DEFAULT '',
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fee_waiver_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view own fee waivers" ON fee_waiver_requests;
DROP POLICY IF EXISTS "Vendors can create fee waivers" ON fee_waiver_requests;
DROP POLICY IF EXISTS "Admins can manage all fee waivers" ON fee_waiver_requests;

CREATE POLICY "Vendors can view own fee waivers"
  ON fee_waiver_requests FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendors can create fee waivers"
  ON fee_waiver_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can select all fee waivers"
  ON fee_waiver_requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update fee waivers"
  ON fee_waiver_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert fee waivers"
  ON fee_waiver_requests FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Fix admin_preferences RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_preferences' AND policyname = 'Admins can manage own preferences'
  ) THEN
    ALTER TABLE admin_preferences ENABLE ROW LEVEL SECURITY;
    EXECUTE 'CREATE POLICY "Admins can manage own preferences" ON admin_preferences FOR ALL TO authenticated USING (admin_id IN (SELECT id FROM admin_users WHERE user_id = auth.uid())) WITH CHECK (admin_id IN (SELECT id FROM admin_users WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fee_waiver_vendor ON fee_waiver_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_fee_waiver_status ON fee_waiver_requests(status);
