/*
  # Create Fee Waiver System

  1. New Tables
    - `fee_waiver_requests`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, foreign key to vendors)
      - `status` (text: PENDING, APPROVED, REJECTED)
      - `document_url` (text, path in storage)
      - `document_type` (text: BPL_CARD, INCOME_CERTIFICATE, OTHER)
      - `note_from_vendor` (text, optional)
      - `note_from_admin` (text, optional)
      - `waiver_type` (text: FULL_FEE_WAIVER, REDUCED_COMMISSION, nullable)
      - `commission_rate` (numeric, nullable, stored as decimal 0.0-1.0)
      - `valid_from` (timestamptz, nullable)
      - `valid_until` (timestamptz, nullable)
      - `reviewed_by_admin_id` (uuid, nullable, foreign key to admin_users)
      - `reviewed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `fee_waiver_requests` table
    - Vendors can view/insert their own requests
    - Vendors can only update their own pending requests
    - Admins can view all requests
    - Admins can update any request status
    
  3. Storage
    - Create private storage bucket `fee-waiver-docs`
    - Only vendors can upload to their own folder
    - Only admins and owning vendor can read documents
*/

-- Create fee_waiver_requests table
CREATE TABLE IF NOT EXISTS fee_waiver_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  document_url text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('BPL_CARD', 'INCOME_CERTIFICATE', 'OTHER')),
  note_from_vendor text,
  note_from_admin text,
  waiver_type text CHECK (waiver_type IN ('FULL_FEE_WAIVER', 'REDUCED_COMMISSION')),
  commission_rate numeric(5,4) CHECK (commission_rate >= 0 AND commission_rate <= 1),
  valid_from timestamptz,
  valid_until timestamptz,
  reviewed_by_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for efficient vendor lookups
CREATE INDEX IF NOT EXISTS idx_fee_waiver_requests_vendor_id ON fee_waiver_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_fee_waiver_requests_status ON fee_waiver_requests(status);
CREATE INDEX IF NOT EXISTS idx_fee_waiver_requests_created_at ON fee_waiver_requests(created_at DESC);

-- Enable RLS
ALTER TABLE fee_waiver_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Vendors can view their own requests
CREATE POLICY "Vendors can view own fee waiver requests"
  ON fee_waiver_requests
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Policy: Vendors can insert their own requests
CREATE POLICY "Vendors can create fee waiver requests"
  ON fee_waiver_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Policy: Vendors can update only their own PENDING requests (notes only)
CREATE POLICY "Vendors can update own pending requests"
  ON fee_waiver_requests
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
    AND status = 'PENDING'
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
    AND status = 'PENDING'
  );

-- Policy: Admins can view all fee waiver requests
CREATE POLICY "Admins can view all fee waiver requests"
  ON fee_waiver_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Policy: Admins can update all fee waiver requests
CREATE POLICY "Admins can update fee waiver requests"
  ON fee_waiver_requests
  FOR UPDATE
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

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_fee_waiver_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fee_waiver_requests_updated_at
  BEFORE UPDATE ON fee_waiver_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_fee_waiver_requests_updated_at();

-- Create storage bucket for fee waiver documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('fee-waiver-docs', 'fee-waiver-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Supabase compatibility helper used by storage policies
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN name IS NULL OR name = '' THEN ARRAY[]::text[]
    ELSE regexp_split_to_array(name, '/')
  END
$$;

-- Storage policy: Vendors can upload to their own folder
CREATE POLICY "Vendors can upload fee waiver documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'fee-waiver-docs'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Storage policy: Vendors can read their own documents
CREATE POLICY "Vendors can read own fee waiver documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'fee-waiver-docs'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Storage policy: Admins can read all fee waiver documents
CREATE POLICY "Admins can read all fee waiver documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'fee-waiver-docs'
    AND EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );
