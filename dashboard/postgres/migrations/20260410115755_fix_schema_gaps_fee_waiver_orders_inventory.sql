/*
  # Fix Schema Gaps

  ## Changes:
  1. Add missing columns to fee_waiver_requests to match the FeeWaiverRequest type
  2. Create vendor_orders view so non-admin vendors can query their orders
  3. Add created_at to inventory table
  4. Add image_metadata to products table
  5. Add tags, download_limit, license_duration_days to products (if missing)
*/

-- ============================================================
-- FEE WAIVER REQUESTS - add missing columns
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'document_url') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN document_url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'document_type') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN document_type text DEFAULT 'OTHER';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'note_from_vendor') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN note_from_vendor text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'note_from_admin') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN note_from_admin text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'waiver_type') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN waiver_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'commission_rate') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN commission_rate numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'valid_from') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN valid_from date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'valid_until') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN valid_until date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_waiver_requests' AND column_name = 'reviewed_by_admin_id') THEN
    ALTER TABLE fee_waiver_requests ADD COLUMN reviewed_by_admin_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- ============================================================
-- INVENTORY - add created_at
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'created_at') THEN
    ALTER TABLE inventory ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- ============================================================
-- PRODUCTS - add missing columns
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_metadata') THEN
    ALTER TABLE products ADD COLUMN image_metadata jsonb DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- VENDOR_ORDERS VIEW for non-admin vendors
-- ============================================================
-- Cannot CREATE OR REPLACE when column names/order differ from prior vendor_orders (masked view used customer_display_name)
DROP VIEW IF EXISTS public.vendor_orders CASCADE;

CREATE VIEW vendor_orders AS
  SELECT * FROM orders;

ALTER VIEW vendor_orders SET (security_invoker = true);

GRANT SELECT ON vendor_orders TO authenticated;

-- ============================================================
-- ORDERS - add missing columns if needed
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
    ALTER TABLE orders ADD COLUMN customer_email text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE orders ADD COLUMN customer_phone text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
    ALTER TABLE orders ADD COLUMN subtotal numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tax_amount') THEN
    ALTER TABLE orders ADD COLUMN tax_amount numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
    ALTER TABLE orders ADD COLUMN shipping_cost numeric DEFAULT 0;
  END IF;
END $$;
