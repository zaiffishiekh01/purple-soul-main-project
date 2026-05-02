/*
  # Create shipping_programs and return_rules tables

  ## New Tables:
  1. **shipping_programs** - Platform shipping programs used in AdminSettings
     - name, carrier, max_weight_kg, base_rate_usd, vendor_rate_usd, markup_usd, etc.
  2. **return_rules** - Platform return policy rules used in AdminSettings
     - scope, category, return_window_days, return_shipping_paid_by, etc.

  ## Security: RLS enabled, admins manage, vendors read
*/

-- ============================================================
-- SHIPPING PROGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  carrier text NOT NULL DEFAULT '',
  max_weight_kg numeric DEFAULT 30,
  base_rate_usd numeric DEFAULT 0,
  vendor_rate_usd numeric DEFAULT 0,
  markup_usd numeric DEFAULT 0,
  supports_returns boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE shipping_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage shipping programs" ON shipping_programs;
DROP POLICY IF EXISTS "Vendors can view active shipping programs" ON shipping_programs;

CREATE POLICY "Admins can manage shipping programs"
  ON shipping_programs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active shipping programs"
  ON shipping_programs FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Seed default programs
INSERT INTO shipping_programs (name, carrier, max_weight_kg, base_rate_usd, vendor_rate_usd, markup_usd, supports_returns, is_active, display_order) VALUES
  ('Standard Shipping', 'USPS', 30, 5.00, 7.50, 2.50, false, true, 1),
  ('Express Shipping', 'FedEx', 20, 12.00, 16.00, 4.00, false, true, 2),
  ('Economy International', 'DHL', 15, 18.00, 24.00, 6.00, false, true, 3),
  ('Returns Shipping', 'UPS', 30, 8.00, 8.00, 0.00, true, true, 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- RETURN RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS return_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text DEFAULT 'GLOBAL' CHECK (scope IN ('GLOBAL', 'CATEGORY')),
  category text,
  return_window_days integer DEFAULT 30,
  return_shipping_paid_by text DEFAULT 'CUSTOMER' CHECK (return_shipping_paid_by IN ('MARKETPLACE', 'VENDOR', 'CUSTOMER')),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE return_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage return rules" ON return_rules;
DROP POLICY IF EXISTS "Vendors can view active return rules" ON return_rules;

CREATE POLICY "Admins can manage return rules"
  ON return_rules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active return rules"
  ON return_rules FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Seed default rules
INSERT INTO return_rules (scope, category, return_window_days, return_shipping_paid_by, is_active, display_order) VALUES
  ('GLOBAL', NULL, 30, 'CUSTOMER', true, 1),
  ('CATEGORY', 'Digital Books', 0, 'CUSTOMER', true, 2),
  ('CATEGORY', 'Audio Spectrum', 0, 'CUSTOMER', true, 3),
  ('CATEGORY', 'Fashion & Apparel', 14, 'VENDOR', true, 4),
  ('CATEGORY', 'Jewelry & Accessories', 7, 'CUSTOMER', true, 5)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shipping_programs_active ON shipping_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_return_rules_scope ON return_rules(scope);
