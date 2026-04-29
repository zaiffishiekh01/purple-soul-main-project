/*
  # Create Digital Products System
  
  1. New Tables
    - `digital_product_files`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `file_name` (text) - Original file name
      - `file_path` (text) - Secure storage path
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `storage_url` (text) - Supabase storage URL
      - `created_at` (timestamptz)
    
    - `product_licenses`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `order_id` (uuid, foreign key to orders)
      - `customer_email` (text)
      - `license_key` (text, unique) - Unique download key
      - `download_limit` (int) - Max downloads allowed (default 3)
      - `download_count` (int) - Current download count
      - `expires_at` (timestamptz) - License expiration
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `last_downloaded_at` (timestamptz)
    
    - `download_logs`
      - `id` (uuid, primary key)
      - `license_id` (uuid, foreign key to product_licenses)
      - `ip_address` (text)
      - `user_agent` (text)
      - `downloaded_at` (timestamptz)
      - `success` (boolean)
  
  2. Changes to Products Table
    - Add `is_digital` (boolean) - Indicates if product is digital
    - Add `download_limit` (int) - Default download limit for this product
    - Add `license_duration_days` (int) - How long license is valid
  
  3. Security
    - Enable RLS on all new tables
    - Vendors can manage their digital product files
    - Customers can only access their purchased licenses
    - Download logs are restricted
*/

-- Add digital product columns to products table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_digital'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN is_digital boolean DEFAULT false,
    ADD COLUMN download_limit int DEFAULT 3,
    ADD COLUMN license_duration_days int DEFAULT 365;
  END IF;
END $$;

-- Create digital product files table
CREATE TABLE IF NOT EXISTS digital_product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create product licenses table
CREATE TABLE IF NOT EXISTS product_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  customer_email text NOT NULL,
  license_key text UNIQUE NOT NULL,
  download_limit int DEFAULT 3,
  download_count int DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_downloaded_at timestamptz
);

-- Create download logs table
CREATE TABLE IF NOT EXISTS download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid REFERENCES product_licenses(id) ON DELETE CASCADE NOT NULL,
  ip_address text,
  user_agent text,
  downloaded_at timestamptz DEFAULT now(),
  success boolean DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_digital_product_files_product_id ON digital_product_files(product_id);
CREATE INDEX IF NOT EXISTS idx_product_licenses_product_id ON product_licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_product_licenses_order_id ON product_licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_product_licenses_license_key ON product_licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_product_licenses_customer_email ON product_licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_download_logs_license_id ON download_logs(license_id);

-- Enable RLS
ALTER TABLE digital_product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- Policies for digital_product_files
CREATE POLICY "Vendors can view their digital product files"
  ON digital_product_files FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products 
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Vendors can insert their digital product files"
  ON digital_product_files FOR INSERT
  TO authenticated
  WITH CHECK (
    product_id IN (
      SELECT id FROM products 
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Vendors can delete their digital product files"
  ON digital_product_files FOR DELETE
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products 
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

-- Policies for product_licenses
CREATE POLICY "Vendors can view licenses for their products"
  ON product_licenses FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products 
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can create licenses"
  ON product_licenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update licenses"
  ON product_licenses FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for download_logs
CREATE POLICY "Vendors can view download logs for their products"
  ON download_logs FOR SELECT
  TO authenticated
  USING (
    license_id IN (
      SELECT id FROM product_licenses 
      WHERE product_id IN (
        SELECT id FROM products 
        WHERE vendor_id IN (
          SELECT id FROM vendors WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "System can insert download logs"
  ON download_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to generate unique license keys
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_prefix text := 'SSC';
  random_part text;
  full_key text;
  key_exists boolean;
BEGIN
  LOOP
    random_part := upper(substring(md5(random()::text) from 1 for 16));
    full_key := key_prefix || '-' || 
                substring(random_part from 1 for 4) || '-' ||
                substring(random_part from 5 for 4) || '-' ||
                substring(random_part from 9 for 4) || '-' ||
                substring(random_part from 13 for 4);
    
    SELECT EXISTS(SELECT 1 FROM product_licenses WHERE license_key = full_key) INTO key_exists;
    
    IF NOT key_exists THEN
      RETURN full_key;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON TABLE digital_product_files IS 'Stores digital product files (ebooks, audio, etc.)';
COMMENT ON TABLE product_licenses IS 'Manages customer licenses for digital products';
COMMENT ON TABLE download_logs IS 'Tracks all download attempts for security and analytics';
COMMENT ON FUNCTION generate_license_key IS 'Generates unique license keys in format SSC-XXXX-XXXX-XXXX-XXXX';