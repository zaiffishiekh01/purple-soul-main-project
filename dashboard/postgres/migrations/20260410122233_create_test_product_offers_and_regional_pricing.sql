/*
  # Create Test Product Offers and Regional Pricing Tables

  ## New Tables:
  1. **test_product_offers** - Admin-created or vendor-requested product test offers
  2. **test_product_offer_vendors** - Vendor applications to test offers  
  3. **test_product_offer_messages** - Message threads per offer
  4. **regional_price_rules** - Country-specific pricing markup rules

  ## Security: RLS enabled on all tables
*/

-- ============================================================
-- TEST PRODUCT OFFERS
-- ============================================================
CREATE TABLE IF NOT EXISTS test_product_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  categories text[] DEFAULT '{}',
  target_quantity integer,
  test_batch_size integer,
  budget_currency text DEFAULT 'USD',
  budget_min numeric,
  budget_max numeric,
  target_region text,
  usage_type text DEFAULT '',
  design_reference_urls text[] DEFAULT '{}',
  status text DEFAULT 'DRAFT',
  locked_vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  is_targeted_offer boolean DEFAULT false,
  vendor_requested boolean DEFAULT false,
  vendor_requester_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  target_vendor_categories text[] DEFAULT '{}',
  created_by_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE test_product_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all test offers" ON test_product_offers;
DROP POLICY IF EXISTS "Vendors can view open offers" ON test_product_offers;
DROP POLICY IF EXISTS "Vendors can create requests" ON test_product_offers;

CREATE POLICY "Admins can manage all test offers"
  ON test_product_offers FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view open offers"
  ON test_product_offers FOR SELECT
  TO authenticated
  USING (
    status IN ('OPEN_FOR_VENDORS', 'UNDER_REVIEW', 'APPROVED_VENDOR_SELECTED', 'TEST_IN_PROGRESS', 'TEST_COMPLETED')
    OR vendor_requester_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    OR locked_vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendors can create requests"
  ON test_product_offers FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_requested = true
    AND vendor_requester_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

-- ============================================================
-- TEST PRODUCT OFFER VENDORS (applications)
-- ============================================================
CREATE TABLE IF NOT EXISTS test_product_offer_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES test_product_offers(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  proposal_note text,
  estimated_unit_cost numeric,
  estimated_lead_time_days integer,
  max_capacity_units integer,
  sample_image_urls text[] DEFAULT '{}',
  status text DEFAULT 'APPLIED',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(offer_id, vendor_id)
);

ALTER TABLE test_product_offer_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view own applications" ON test_product_offer_vendors;
DROP POLICY IF EXISTS "Vendors can create applications" ON test_product_offer_vendors;
DROP POLICY IF EXISTS "Admins can manage all applications" ON test_product_offer_vendors;

CREATE POLICY "Vendors can view own applications"
  ON test_product_offer_vendors FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can create applications"
  ON test_product_offer_vendors FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all applications"
  ON test_product_offer_vendors FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- ============================================================
-- TEST PRODUCT OFFER MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS test_product_offer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES test_product_offers(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('ADMIN', 'VENDOR')),
  sender_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  sender_vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  message text NOT NULL,
  attachment_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_product_offer_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view messages on their offers" ON test_product_offer_messages;
DROP POLICY IF EXISTS "Vendors can send messages" ON test_product_offer_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON test_product_offer_messages;

CREATE POLICY "Vendors can view messages on their offers"
  ON test_product_offer_messages FOR SELECT
  TO authenticated
  USING (
    offer_id IN (
      SELECT id FROM test_product_offers
      WHERE vendor_requester_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
        OR locked_vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    )
    OR offer_id IN (
      SELECT offer_id FROM test_product_offer_vendors
      WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Vendors can send messages"
  ON test_product_offer_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all messages"
  ON test_product_offer_messages FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- ============================================================
-- REGIONAL PRICE RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS regional_price_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category text,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  markup_type text NOT NULL DEFAULT 'FLAT' CHECK (markup_type IN ('FLAT', 'PERCENT')),
  markup_value numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE regional_price_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all pricing rules" ON regional_price_rules;
DROP POLICY IF EXISTS "Vendors can view active pricing rules" ON regional_price_rules;

CREATE POLICY "Admins can manage all pricing rules"
  ON regional_price_rules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active pricing rules"
  ON regional_price_rules FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_offers_status ON test_product_offers(status);
CREATE INDEX IF NOT EXISTS idx_test_offer_vendors_vendor ON test_product_offer_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_test_offer_vendors_offer ON test_product_offer_vendors(offer_id);
CREATE INDEX IF NOT EXISTS idx_test_messages_offer ON test_product_offer_messages(offer_id);
CREATE INDEX IF NOT EXISTS idx_regional_price_country ON regional_price_rules(country_code);
CREATE INDEX IF NOT EXISTS idx_regional_price_active ON regional_price_rules(is_active);
