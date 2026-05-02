/*
  # Create Shipping Programs and Return Rules Settings

  1. New Tables
    - `shipping_programs` - Configurable shipping programs
    - `return_rules` - Configurable return policies

  2. Security
    - Enable RLS on both tables
    - Only admins can manage these settings
    - All users can view active settings
*/

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Create shipping_programs table
CREATE TABLE IF NOT EXISTS shipping_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  carrier text NOT NULL,
  max_weight_kg numeric NOT NULL,
  base_rate_usd numeric NOT NULL,
  vendor_rate_usd numeric NOT NULL,
  markup_usd numeric NOT NULL DEFAULT 0,
  supports_returns boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id),
  updated_by uuid REFERENCES admin_users(id)
);

-- Create return_rules table
CREATE TABLE IF NOT EXISTS return_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('GLOBAL', 'CATEGORY')),
  category text,
  return_window_days integer NOT NULL,
  return_shipping_paid_by text NOT NULL CHECK (return_shipping_paid_by IN ('MARKETPLACE', 'VENDOR', 'CUSTOMER')),
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id),
  updated_by uuid REFERENCES admin_users(id),
  CONSTRAINT return_rules_category_check CHECK (
    (scope = 'GLOBAL' AND category IS NULL) OR
    (scope = 'CATEGORY' AND category IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipping_programs_active ON shipping_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_programs_display_order ON shipping_programs(display_order);
CREATE INDEX IF NOT EXISTS idx_shipping_programs_created_by ON shipping_programs(created_by);
CREATE INDEX IF NOT EXISTS idx_shipping_programs_updated_by ON shipping_programs(updated_by);

CREATE INDEX IF NOT EXISTS idx_return_rules_scope ON return_rules(scope);
CREATE INDEX IF NOT EXISTS idx_return_rules_category ON return_rules(category);
CREATE INDEX IF NOT EXISTS idx_return_rules_active ON return_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_return_rules_display_order ON return_rules(display_order);
CREATE INDEX IF NOT EXISTS idx_return_rules_created_by ON return_rules(created_by);
CREATE INDEX IF NOT EXISTS idx_return_rules_updated_by ON return_rules(updated_by);

-- Enable RLS
ALTER TABLE shipping_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_programs
DROP POLICY IF EXISTS "Admins can manage shipping programs" ON shipping_programs;
CREATE POLICY "Admins can manage shipping programs"
  ON shipping_programs
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Anyone can view active shipping programs" ON shipping_programs;
CREATE POLICY "Anyone can view active shipping programs"
  ON shipping_programs
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for return_rules
DROP POLICY IF EXISTS "Admins can manage return rules" ON return_rules;
CREATE POLICY "Admins can manage return rules"
  ON return_rules
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Anyone can view active return rules" ON return_rules;
CREATE POLICY "Anyone can view active return rules"
  ON return_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create update triggers
DROP TRIGGER IF EXISTS update_shipping_programs_updated_at ON shipping_programs;
CREATE TRIGGER update_shipping_programs_updated_at
  BEFORE UPDATE ON shipping_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_return_rules_updated_at ON return_rules;
CREATE TRIGGER update_return_rules_updated_at
  BEFORE UPDATE ON return_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO shipping_programs (name, carrier, max_weight_kg, base_rate_usd, vendor_rate_usd, markup_usd, supports_returns, display_order) VALUES
  ('Marketplace Standard', 'DHL', 30, 8.50, 10.50, 2.00, true, 1),
  ('Marketplace Express', 'UPS', 25, 15.00, 18.50, 3.50, true, 2),
  ('Economy Shipping', 'USPS', 50, 6.00, 7.50, 1.50, false, 3),
  ('International Standard', 'FedEx', 20, 25.00, 30.00, 5.00, true, 4)
ON CONFLICT DO NOTHING;

INSERT INTO return_rules (scope, category, return_window_days, return_shipping_paid_by, display_order) VALUES
  ('GLOBAL', NULL, 30, 'MARKETPLACE', 1),
  ('CATEGORY', 'Electronics', 14, 'VENDOR', 2),
  ('CATEGORY', 'Clothing', 60, 'MARKETPLACE', 3),
  ('CATEGORY', 'Food & Beverages', 7, 'CUSTOMER', 4)
ON CONFLICT DO NOTHING;