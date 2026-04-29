/*
  # Create payout_requests and platform_fees tables

  ## New Tables:
  1. **payout_requests** - Vendor payout requests with full workflow support
     - amount, platform_fee, net_amount, status, dates, bank transfer fields
  2. **platform_fees** - Per-vendor platform fee configuration
     - vendor_id, fee_percentage, fee_type

  ## Security: RLS enabled on both tables with admin and vendor policies
*/

-- ============================================================
-- PAYOUT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount numeric DEFAULT 0,
  platform_fee numeric DEFAULT 0,
  net_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  request_date timestamptz DEFAULT now(),
  processed_date timestamptz,
  transfer_initiated_date timestamptz,
  transfer_completed_date timestamptz,
  bank_transfer_id text DEFAULT '',
  failure_reason text DEFAULT '',
  rejection_reason text DEFAULT '',
  retry_count integer DEFAULT 0,
  transaction_id text DEFAULT '',
  notes text DEFAULT '',
  auto_payout_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own payout requests"
  ON payout_requests FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendors can create payout requests"
  ON payout_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can select all payout requests"
  ON payout_requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update payout requests"
  ON payout_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert payout requests"
  ON payout_requests FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- ============================================================
-- PLATFORM FEES
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  fee_percentage numeric DEFAULT 15,
  fee_type text DEFAULT 'commission',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own platform fees"
  ON platform_fees FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all platform fees"
  ON platform_fees FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_vendor ON payout_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_platform_fees_vendor ON platform_fees(vendor_id);
