/*
  # Create Regional Pricing System with Hidden Markup

  1. Purpose
    - Vendors set base_price (e.g., 100)
    - Platform adds region-specific markup (e.g., +20 for US)
    - US buyers see 120, India buyers see 100
    - Vendors always see their base_price
    - Admin controls markup rules per country/category/vendor

  2. New Tables
    - `regional_price_rules` - Country-specific markup rules
    - `platform_settings` - Global pricing configurations

  3. Changes to Products
    - Add `base_price` - What vendor sets and sees
    - Keep `price` for backward compatibility (will be calculated)
    - Add `pricing_model` - 'REGIONAL' or 'FIXED'

  4. Functions
    - `calculate_display_price()` - Server-side price calculation
    - Considers viewer role, country, and markup rules

  5. Security
    - Vendors see base_price only
    - Customers see display_price based on their country
    - Admins see both prices and can manage rules
*/

-- Add pricing columns to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'base_price'
  ) THEN
    ALTER TABLE products ADD COLUMN base_price decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'pricing_model'
  ) THEN
    ALTER TABLE products ADD COLUMN pricing_model text DEFAULT 'FIXED';
  END IF;
END $$;

-- Backfill base_price from existing price
UPDATE products
SET base_price = price
WHERE base_price IS NULL;

-- Create regional price rules table
CREATE TABLE IF NOT EXISTS regional_price_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text,

  -- Rule scope (at least one must be set)
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category text,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,

  -- Geographic targeting
  country_code text NOT NULL,

  -- Markup configuration
  markup_type text NOT NULL CHECK (markup_type IN ('FLAT', 'PERCENT')),
  markup_value decimal(10,2) NOT NULL DEFAULT 0,

  -- Status
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  -- Ensure at least one scope is set
  CHECK (
    product_id IS NOT NULL OR
    category IS NOT NULL OR
    vendor_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_regional_price_rules_product ON regional_price_rules(product_id);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_category ON regional_price_rules(category);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_vendor ON regional_price_rules(vendor_id);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_country ON regional_price_rules(country_code);

-- Enable RLS
ALTER TABLE regional_price_rules ENABLE ROW LEVEL SECURITY;

-- Admins can manage all rules
CREATE POLICY "Admins can manage regional price rules"
  ON regional_price_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Vendors can view rules affecting their products
CREATE POLICY "Vendors can view their price rules"
  ON regional_price_rules FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Create platform settings table for global defaults
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES
  ('default_markup_us', '{"type": "FLAT", "value": 20}', 'Default markup for US customers'),
  ('default_markup_in', '{"type": "FLAT", "value": 0}', 'Default markup for India customers'),
  ('vendor_sees_markup', 'false', 'Whether vendors can see markup amounts')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to calculate display price based on viewer context
CREATE OR REPLACE FUNCTION calculate_display_price(
  p_base_price decimal,
  p_product_id uuid,
  p_category text,
  p_vendor_id uuid,
  p_viewer_role text,
  p_viewer_country text,
  p_vendor_country text
)
RETURNS decimal
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_display_price decimal;
  v_markup_rule RECORD;
  v_markup_value decimal := 0;
BEGIN
  -- Vendors and viewers from vendor's country see base price
  IF p_viewer_role = 'VENDOR' OR p_viewer_country = p_vendor_country THEN
    RETURN p_base_price;
  END IF;

  -- Find applicable markup rule (priority: product > category > vendor)
  SELECT markup_type, markup_value INTO v_markup_rule
  FROM regional_price_rules
  WHERE is_active = true
    AND country_code = p_viewer_country
    AND (
      (product_id = p_product_id) OR
      (category = p_category AND product_id IS NULL) OR
      (vendor_id = p_vendor_id AND product_id IS NULL AND category IS NULL)
    )
  ORDER BY
    CASE
      WHEN product_id IS NOT NULL THEN 1
      WHEN category IS NOT NULL THEN 2
      WHEN vendor_id IS NOT NULL THEN 3
      ELSE 4
    END,
    priority DESC
  LIMIT 1;

  -- Apply markup if rule found
  IF v_markup_rule.markup_type IS NOT NULL THEN
    IF v_markup_rule.markup_type = 'FLAT' THEN
      v_markup_value := v_markup_rule.markup_value;
    ELSIF v_markup_rule.markup_type = 'PERCENT' THEN
      v_markup_value := p_base_price * v_markup_rule.markup_value;
    END IF;
  END IF;

  v_display_price := p_base_price + v_markup_value;
  RETURN v_display_price;
END;
$$;

-- Function to get pricing info for a product (includes both base and display)
CREATE OR REPLACE FUNCTION get_product_pricing(
  p_product_id uuid,
  p_viewer_role text DEFAULT 'CUSTOMER',
  p_viewer_country text DEFAULT 'US'
)
RETURNS TABLE (
  product_id uuid,
  base_price decimal,
  display_price decimal,
  markup_amount decimal,
  currency text
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.base_price,
    calculate_display_price(
      p.base_price,
      p.id,
      p.category,
      p.vendor_id,
      p_viewer_role,
      p_viewer_country,
      COALESCE((v.address->>'country')::text, 'IN')
    ) as display_price,
    calculate_display_price(
      p.base_price,
      p.id,
      p.category,
      p.vendor_id,
      p_viewer_role,
      p_viewer_country,
      COALESCE((v.address->>'country')::text, 'IN')
    ) - p.base_price as markup_amount,
    'USD'::text as currency
  FROM products p
  LEFT JOIN vendors v ON v.id = p.vendor_id
  WHERE p.id = p_product_id;
END;
$$;

-- Add helpful comments
COMMENT ON COLUMN products.base_price IS 'Vendor-set price - what vendors see and earn';
COMMENT ON COLUMN products.pricing_model IS 'FIXED (same everywhere) or REGIONAL (varies by country)';
COMMENT ON TABLE regional_price_rules IS 'Country-specific markup rules for products/categories/vendors';
COMMENT ON FUNCTION calculate_display_price IS 'Calculates final price shown to customer based on their country';
