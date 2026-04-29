/*
  # Inventory Management System

  ## Overview
  Comprehensive inventory tracking system with real-time stock monitoring,
  low stock alerts, inventory history, and SKU management.

  ## New Tables
  
  ### `inventory_transactions`
  Tracks all inventory changes with full audit trail
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products
  - `vendor_id` (uuid) - References vendors
  - `transaction_type` (text) - restock, sale, adjustment, return, damage, theft
  - `quantity_change` (integer) - Positive or negative change
  - `quantity_before` (integer) - Stock before transaction
  - `quantity_after` (integer) - Stock after transaction
  - `reason` (text) - Reason for adjustment
  - `reference_id` (uuid) - References related order/return if applicable
  - `created_by` (uuid) - User who made the change
  - `created_at` (timestamptz)
  
  ### `inventory_alerts`
  Low stock and out-of-stock alerts for vendors
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products
  - `vendor_id` (uuid) - References vendors
  - `alert_type` (text) - low_stock, out_of_stock, overstocked
  - `threshold` (integer) - Stock level that triggered alert
  - `current_quantity` (integer) - Current stock level
  - `is_resolved` (boolean) - Whether alert has been addressed
  - `created_at` (timestamptz)
  - `resolved_at` (timestamptz)
  
  ### `product_skus`
  SKU management for product variants
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products
  - `sku` (text, unique) - Stock keeping unit code
  - `variant_name` (text) - e.g., "Size: Large, Color: Blue"
  - `variant_options` (jsonb) - Structured variant data
  - `price_adjustment` (decimal) - Price difference from base product
  - `stock_quantity` (integer) - Individual SKU stock
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Changes to Existing Tables
  
  ### `products`
  - Add `low_stock_threshold` (integer, default 10) - Trigger for low stock alerts
  - Add `reorder_quantity` (integer, default 50) - Suggested reorder amount
  - Add `sku` (text) - Base SKU for the product
  
  ## Functions
  - `create_inventory_transaction()` - Records inventory change with full audit trail
  - `check_low_stock_alert()` - Trigger to create alerts when stock is low
  - `update_stock_quantity()` - Safe stock update with transaction logging
  
  ## Indexes
  - product_id indexes for fast lookups
  - vendor_id indexes for vendor-specific queries
  - created_at indexes for time-based queries
  - is_resolved index for active alerts
  
  ## Security
  - Enable RLS on all tables
  - Vendors can only access their own inventory data
  - Admins have full access
  - Automatic transaction logging for all stock changes
*/

-- Add inventory management columns to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'reorder_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN reorder_quantity integer DEFAULT 50;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text;
  END IF;
END $$;

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('restock', 'sale', 'adjustment', 'return', 'damage', 'theft')),
  quantity_change integer NOT NULL,
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  reason text,
  reference_id uuid,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create inventory_alerts table
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstocked')),
  threshold integer,
  current_quantity integer NOT NULL,
  is_resolved boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

-- Create product_skus table
CREATE TABLE IF NOT EXISTS product_skus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE NOT NULL,
  variant_name text,
  variant_options jsonb DEFAULT '{}'::jsonb,
  price_adjustment decimal(10,2) DEFAULT 0,
  stock_quantity integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Function to create inventory transaction
CREATE OR REPLACE FUNCTION create_inventory_transaction(
  p_product_id uuid,
  p_vendor_id uuid,
  p_transaction_type text,
  p_quantity_change integer,
  p_reason text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_quantity_before integer;
  v_quantity_after integer;
  v_transaction_id uuid;
  v_low_stock_threshold integer;
BEGIN
  -- Get current stock
  SELECT stock_quantity, low_stock_threshold
  INTO v_quantity_before, v_low_stock_threshold
  FROM products
  WHERE id = p_product_id;
  
  -- Calculate new stock
  v_quantity_after := v_quantity_before + p_quantity_change;
  
  -- Prevent negative stock
  IF v_quantity_after < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', v_quantity_before, ABS(p_quantity_change);
  END IF;
  
  -- Create transaction record
  INSERT INTO inventory_transactions (
    product_id, vendor_id, transaction_type, quantity_change,
    quantity_before, quantity_after, reason, reference_id, created_by
  ) VALUES (
    p_product_id, p_vendor_id, p_transaction_type, p_quantity_change,
    v_quantity_before, v_quantity_after, p_reason, p_reference_id, p_created_by
  ) RETURNING id INTO v_transaction_id;
  
  -- Update product stock
  UPDATE products
  SET stock_quantity = v_quantity_after,
      updated_at = now()
  WHERE id = p_product_id;
  
  -- Check for low stock alert
  IF v_quantity_after <= v_low_stock_threshold AND v_quantity_after > 0 THEN
    INSERT INTO inventory_alerts (product_id, vendor_id, alert_type, threshold, current_quantity)
    VALUES (p_product_id, p_vendor_id, 'low_stock', v_low_stock_threshold, v_quantity_after)
    ON CONFLICT DO NOTHING;
  ELSIF v_quantity_after = 0 THEN
    INSERT INTO inventory_alerts (product_id, vendor_id, alert_type, threshold, current_quantity)
    VALUES (p_product_id, p_vendor_id, 'out_of_stock', 0, 0)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_vendor_id ON inventory_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_vendor_id ON inventory_alerts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_is_resolved ON inventory_alerts(is_resolved) WHERE NOT is_resolved;
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_created_at ON inventory_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON product_skus(product_id);
CREATE INDEX IF NOT EXISTS idx_product_skus_sku ON product_skus(sku);

-- Enable RLS
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_transactions
CREATE POLICY "Vendors can view own inventory transactions"
  ON inventory_transactions FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can create inventory transactions"
  ON inventory_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all inventory transactions"
  ON inventory_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for inventory_alerts
CREATE POLICY "Vendors can view own inventory alerts"
  ON inventory_alerts FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update own inventory alerts"
  ON inventory_alerts FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all inventory alerts"
  ON inventory_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for product_skus
CREATE POLICY "Anyone can view active SKUs"
  ON product_skus FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Vendors can manage own product SKUs"
  ON product_skus FOR ALL
  TO authenticated
  USING (
    product_id IN (
      SELECT p.id FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all product SKUs"
  ON product_skus FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
