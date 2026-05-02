/*
  # Regional Pricing System - Clean Implementation

  Enables region-based pricing with hidden markup:
  - Vendor sets base_price (100)
  - US buyers see base + markup (120)
  - India buyers see base price (100)
*/

-- Add pricing columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price decimal(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_model text DEFAULT 'FIXED';

-- Backfill base_price from existing price
UPDATE products SET base_price = price WHERE base_price IS NULL;

-- Create regional price rules table
CREATE TABLE IF NOT EXISTS regional_price_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category text,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  markup_type text NOT NULL CHECK (markup_type IN ('FLAT', 'PERCENT')),
  markup_value decimal(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CHECK (product_id IS NOT NULL OR category IS NOT NULL OR vendor_id IS NOT NULL)
);

ALTER TABLE regional_price_rules
ADD COLUMN IF NOT EXISTS scope text;

CREATE INDEX IF NOT EXISTS idx_regional_price_rules_product ON regional_price_rules(product_id);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_category ON regional_price_rules(category);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_vendor ON regional_price_rules(vendor_id);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_country ON regional_price_rules(country_code);

ALTER TABLE regional_price_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage regional price rules" ON regional_price_rules;
DROP POLICY IF EXISTS "Vendors can view their price rules" ON regional_price_rules;

-- Create policies
CREATE POLICY "Admins can manage regional price rules"
  ON regional_price_rules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can view their price rules"
  ON regional_price_rules FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Insert default markup settings
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES
  ('default_markup_us', '{"type": "FLAT", "value": 20}', 'Default markup for US customers'),
  ('default_markup_in', '{"type": "FLAT", "value": 0}', 'Default markup for India customers'),
  ('vendor_sees_markup', 'false', 'Whether vendors can see markup amounts')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to calculate display price
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
  v_markup_rule RECORD;
  v_markup_value decimal := 0;
BEGIN
  IF p_viewer_role = 'VENDOR' OR p_viewer_country = p_vendor_country THEN
    RETURN p_base_price;
  END IF;

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

  IF v_markup_rule.markup_type IS NOT NULL THEN
    IF v_markup_rule.markup_type = 'FLAT' THEN
      v_markup_value := v_markup_rule.markup_value;
    ELSIF v_markup_rule.markup_type = 'PERCENT' THEN
      v_markup_value := p_base_price * v_markup_rule.markup_value;
    END IF;
  END IF;

  RETURN p_base_price + v_markup_value;
END;
$$;

COMMENT ON COLUMN products.base_price IS 'Vendor-set price - what vendors see and earn';
COMMENT ON COLUMN products.pricing_model IS 'FIXED (same everywhere) or REGIONAL (varies by country)';
COMMENT ON TABLE regional_price_rules IS 'Country-specific markup rules for products/categories/vendors';
