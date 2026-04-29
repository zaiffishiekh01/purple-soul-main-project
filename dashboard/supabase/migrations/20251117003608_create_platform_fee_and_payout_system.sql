/*
  # Create Platform Fee and Payout System

  1. New Tables
    - `platform_fees`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, references vendors)
      - `fee_percentage` (numeric) - Platform commission percentage
      - `fee_type` (text) - Type: 'percentage' or 'fixed'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid) - Admin who set the fee
    
    - `payout_requests`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, references vendors)
      - `amount` (numeric) - Requested payout amount
      - `platform_fee` (numeric) - Fee deducted
      - `net_amount` (numeric) - Amount after fee deduction
      - `status` (text) - 'pending', 'approved', 'rejected', 'completed'
      - `request_date` (timestamp)
      - `processed_date` (timestamp)
      - `processed_by` (uuid) - Admin who processed
      - `rejection_reason` (text)
      - `payment_method` (text)
      - `payment_details` (jsonb)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Vendors can view their own fees and payout requests
    - Vendors can create payout requests
    - Only admins can modify platform fees and approve/reject payouts
*/

-- Create platform_fees table
CREATE TABLE IF NOT EXISTS platform_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  fee_percentage numeric DEFAULT 0,
  fee_type text DEFAULT 'percentage',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric DEFAULT 0,
  net_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  request_date timestamptz DEFAULT now(),
  processed_date timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  payment_method text,
  payment_details jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Platform Fees Policies
CREATE POLICY "Vendors can view their own platform fees"
  ON platform_fees FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all platform fees"
  ON platform_fees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert platform fees"
  ON platform_fees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update platform fees"
  ON platform_fees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Payout Requests Policies
CREATE POLICY "Vendors can view their own payout requests"
  ON payout_requests FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payout requests"
  ON payout_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can create payout requests"
  ON payout_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update payout requests"
  ON payout_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_fees_vendor_id ON platform_fees(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_vendor_id ON payout_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);

-- Add comments
COMMENT ON TABLE platform_fees IS 'Platform commission fees per vendor';
COMMENT ON TABLE payout_requests IS 'Vendor payout requests and processing history';
