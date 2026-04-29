/*
  # Add Product Import History Table

  ## Overview
  Track bulk product import operations with success/failure metrics

  ## New Tables

  ### `product_imports`
  - `id` (uuid, primary key) - Unique import identifier
  - `vendor_id` (uuid, foreign key) - Associated vendor
  - `filename` (text) - Original uploaded filename
  - `total_rows` (integer) - Total products in file
  - `success_count` (integer) - Successfully imported
  - `error_count` (integer) - Failed imports
  - `errors` (jsonb) - Array of error messages
  - `status` (text) - Processing, completed, failed
  - `created_at` (timestamptz) - Import timestamp
  - `completed_at` (timestamptz) - Completion timestamp

  ## Security
  - RLS enabled with vendor-specific access policies
*/

CREATE TABLE IF NOT EXISTS product_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  filename text NOT NULL,
  total_rows integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  errors jsonb DEFAULT '[]',
  status text DEFAULT 'processing',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE product_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own import history"
  ON product_imports FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own imports"
  ON product_imports FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_product_imports_vendor_id ON product_imports(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_imports_created_at ON product_imports(created_at DESC);
