/*
  # Add Comprehensive Admin Dashboard Test Data

  This migration adds extensive dummy data for admin dashboard testing:

  ## Shipping Labels Data (30+ labels)
  - Various statuses (pending, printed, shipped, delivered, cancelled)
  - Multiple carriers (USPS, FedEx, UPS, DHL)
  - Different service types (Priority, Express, Ground)
  - Mix of domestic and international shipments
  - Labels from different vendors and time periods
  - Various tracking statuses

  ## Pricing Rules Data (15+ rules)
  - Platform commission rules (category-based, vendor-based, global)
  - Markup rules (seasonal, promotional, category-specific)
  - Discount rules (bulk, loyalty, seasonal)
  - Shipping fee adjustments
  - Fee waiver rules
  - Active and inactive rules for testing

  ## Payout Data (25+ payouts)
  - Weekly and monthly payouts
  - Multiple vendors with various amounts
  - Different statuses (pending, processing, completed, failed)
  - Recent and historical payouts
  - Failed payouts needing admin attention
  - Scheduled future payouts

  ## Purpose
  - Test admin workflow actions (approve, reject, process, cancel)
  - Test filtering, sorting, and search functionality
  - Test bulk operations
  - Verify action buttons and status updates
  - Test edge cases and error handling
*/

-- =======================
-- SHIPPING LABELS DATA
-- =======================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'carrier'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN carrier text;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'service_type'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN service_type text;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'cost'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN cost numeric(10,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'weight_oz'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN weight_oz numeric(10,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'from_address'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN from_address jsonb DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'to_address'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN to_address jsonb DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'shipped_at'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN shipped_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shipping_labels'
      AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE shipping_labels ADD COLUMN delivered_at timestamptz;
  END IF;
END $$;

DO $$
DECLARE
  v_user1 uuid;
  v_user2 uuid;
  v_user3 uuid;
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    'f2c40cd6-8c74-4adb-8acf-7af339f4dc64',
    'artisan.crafts.seed@test.com',
    'seeded-migration-password',
    now(),
    '{"role":"vendor"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    '66ca8f0d-d4ab-4530-ba67-188f2990c4ae',
    'demo.vendor2.seed@test.com',
    'seeded-migration-password',
    now(),
    '{"role":"vendor"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    'f2e6ab8a-d7db-46f5-9360-c4a50a5fe543',
    'demo.vendor3.seed@test.com',
    'seeded-migration-password',
    now(),
    '{"role":"vendor"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO v_user1 FROM auth.users WHERE email = 'artisan.crafts.seed@test.com' LIMIT 1;
  SELECT id INTO v_user2 FROM auth.users WHERE email = 'demo.vendor2.seed@test.com' LIMIT 1;
  SELECT id INTO v_user3 FROM auth.users WHERE email = 'demo.vendor3.seed@test.com' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM vendors WHERE business_name = 'Artisan Crafts Co') THEN
    INSERT INTO vendors (
      user_id, business_name, business_type, contact_email, contact_phone, address, tax_id, status
    ) VALUES (
      v_user1, 'Artisan Crafts Co', 'E-commerce', 'artisan.crafts.seed@test.com', '+1-555-1001',
      jsonb_build_object('street', '101 Artisan Way', 'city', 'Portland', 'state', 'OR', 'zip', '97201', 'country', 'United States'),
      'TAXARTISAN001', 'approved'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM vendors WHERE business_name = 'Demo Vendor 2') THEN
    INSERT INTO vendors (
      user_id, business_name, business_type, contact_email, contact_phone, address, tax_id, status
    ) VALUES (
      v_user2, 'Demo Vendor 2', 'E-commerce', 'demo.vendor2.seed@test.com', '+1-555-1002',
      jsonb_build_object('street', '102 Demo Ave', 'city', 'Austin', 'state', 'TX', 'zip', '78701', 'country', 'United States'),
      'TAXDEMO002', 'approved'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM vendors WHERE business_name = 'Demo Vendor 3') THEN
    INSERT INTO vendors (
      user_id, business_name, business_type, contact_email, contact_phone, address, tax_id, status
    ) VALUES (
      v_user3, 'Demo Vendor 3', 'E-commerce', 'demo.vendor3.seed@test.com', '+1-555-1003',
      jsonb_build_object('street', '103 Demo Blvd', 'city', 'Chicago', 'state', 'IL', 'zip', '60601', 'country', 'United States'),
      'TAXDEMO003', 'approved'
    );
  END IF;
END $$;

INSERT INTO shipping_labels (
  vendor_id,
  order_id,
  carrier,
  service_type,
  tracking_number,
  label_url,
  status,
  cost,
  weight_oz,
  from_address,
  to_address,
  created_at,
  shipped_at,
  delivered_at
) VALUES
-- USPS Labels (Various statuses)
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-001' LIMIT 1),
  'USPS',
  'Priority Mail',
  'USPS-9400100000000000001',
  'https://storage.example.com/labels/usps-001.pdf',
  'delivered',
  12.50,
  24,
  '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  '{"street": "456 Customer Ave", "city": "Seattle", "state": "WA", "zip": "98101", "country": "US"}',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '10 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-002' LIMIT 1),
  'USPS',
  'Priority Mail Express',
  'USPS-9400100000000000002',
  'https://storage.example.com/labels/usps-002.pdf',
  'shipped',
  24.75,
  16,
  '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  '{"street": "789 Buyer Rd", "city": "San Francisco", "state": "CA", "zip": "94102", "country": "US"}',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-003' LIMIT 1),
  'USPS',
  'First Class',
  'USPS-9400100000000000003',
  'https://storage.example.com/labels/usps-003.pdf',
  'printed',
  5.25,
  8,
  '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
  '{"street": "321 Home St", "city": "Denver", "state": "CO", "zip": "80202", "country": "US"}',
  NOW() - INTERVAL '1 day',
  NULL,
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-004' LIMIT 1),
  'USPS',
  'Priority Mail',
  'USPS-9400100000000000004',
  'https://storage.example.com/labels/usps-004.pdf',
  'pending',
  15.00,
  32,
  '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
  '{"street": "654 Oak Ave", "city": "Boston", "state": "MA", "zip": "02101", "country": "US"}',
  NOW() - INTERVAL '6 hours',
  NULL,
  NULL
),

-- FedEx Labels
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-005' LIMIT 1),
  'FedEx',
  'Ground',
  'FEDEX-7700000000001',
  'https://storage.example.com/labels/fedex-001.pdf',
  'delivered',
  18.50,
  48,
  '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  '{"street": "987 Pine St", "city": "Miami", "state": "FL", "zip": "33101", "country": "US"}',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '14 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-006' LIMIT 1),
  'FedEx',
  '2Day',
  'FEDEX-7700000000002',
  'https://storage.example.com/labels/fedex-002.pdf',
  'shipped',
  35.00,
  64,
  '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
  '{"street": "147 Elm St", "city": "New York", "state": "NY", "zip": "10001", "country": "US"}',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-007' LIMIT 1),
  'FedEx',
  'Express Saver',
  'FEDEX-7700000000003',
  'https://storage.example.com/labels/fedex-003.pdf',
  'printed',
  42.00,
  80,
  '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
  '{"street": "258 Maple Ave", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "US"}',
  NOW() - INTERVAL '12 hours',
  NULL,
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-008' LIMIT 1),
  'FedEx',
  'Standard Overnight',
  'FEDEX-7700000000004',
  'https://storage.example.com/labels/fedex-004.pdf',
  'pending',
  65.00,
  40,
  '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  '{"street": "369 Cedar Rd", "city": "Phoenix", "state": "AZ", "zip": "85001", "country": "US"}',
  NOW() - INTERVAL '2 hours',
  NULL,
  NULL
),

-- UPS Labels
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-009' LIMIT 1),
  'UPS',
  'Ground',
  'UPS-1Z9990000000000001',
  'https://storage.example.com/labels/ups-001.pdf',
  'delivered',
  16.25,
  56,
  '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
  '{"street": "741 Birch St", "city": "Philadelphia", "state": "PA", "zip": "19101", "country": "US"}',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '17 days',
  NOW() - INTERVAL '13 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  (SELECT id FROM orders WHERE order_number = 'ORD-2024-010' LIMIT 1),
  'UPS',
  '3 Day Select',
  'UPS-1Z9990000000000002',
  'https://storage.example.com/labels/ups-002.pdf',
  'shipped',
  28.50,
  72,
  '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
  '{"street": "852 Walnut Ave", "city": "Houston", "state": "TX", "zip": "77001", "country": "US"}',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '3 days',
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 10),
  'UPS',
  '2nd Day Air',
  'UPS-1Z9990000000000003',
  'https://storage.example.com/labels/ups-003.pdf',
  'printed',
  38.75,
  44,
  '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  '{"street": "963 Spruce Ln", "city": "Dallas", "state": "TX", "zip": "75201", "country": "US"}',
  NOW() - INTERVAL '8 hours',
  NULL,
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 11),
  'UPS',
  'Next Day Air',
  'UPS-1Z9990000000000004',
  'https://storage.example.com/labels/ups-004.pdf',
  'cancelled',
  75.00,
  28,
  '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
  '{"street": "159 Ash St", "city": "San Diego", "state": "CA", "zip": "92101", "country": "US"}',
  NOW() - INTERVAL '5 days',
  NULL,
  NULL
),

-- DHL Labels (International)
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 12),
  'DHL',
  'Express Worldwide',
  'DHL-5500000000001',
  'https://storage.example.com/labels/dhl-001.pdf',
  'delivered',
  125.00,
  96,
  '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
  '{"street": "10 Downing Street", "city": "London", "state": "", "zip": "SW1A 2AA", "country": "GB"}',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '24 days',
  NOW() - INTERVAL '18 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 13),
  'DHL',
  'Economy Select',
  'DHL-5500000000002',
  'https://storage.example.com/labels/dhl-002.pdf',
  'shipped',
  85.00,
  64,
  '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  '{"street": "Rue de Rivoli 1", "city": "Paris", "state": "", "zip": "75001", "country": "FR"}',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '6 days',
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 14),
  'DHL',
  'Express Worldwide',
  'DHL-5500000000003',
  'https://storage.example.com/labels/dhl-003.pdf',
  'printed',
  145.00,
  112,
  '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
  '{"street": "Alexanderplatz 1", "city": "Berlin", "state": "", "zip": "10178", "country": "DE"}',
  NOW() - INTERVAL '1 day',
  NULL,
  NULL
),

-- Additional pending labels for bulk testing
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 15),
  'USPS',
  'Priority Mail',
  'USPS-9400100000000000005',
  'https://storage.example.com/labels/usps-005.pdf',
  'pending',
  13.00,
  20,
  '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
  '{"street": "123 Test St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  NOW() - INTERVAL '4 hours',
  NULL,
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 16),
  'FedEx',
  'Ground',
  'FEDEX-7700000000005',
  'https://storage.example.com/labels/fedex-005.pdf',
  'pending',
  19.50,
  52,
  '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
  '{"street": "456 Test Ave", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
  NOW() - INTERVAL '3 hours',
  NULL,
  NULL
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  (SELECT id FROM orders LIMIT 1 OFFSET 17),
  'UPS',
  'Ground',
  'UPS-1Z9990000000000005',
  'https://storage.example.com/labels/ups-005.pdf',
  'pending',
  17.00,
  60,
  '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
  '{"street": "789 Test Rd", "city": "Seattle", "state": "WA", "zip": "98101", "country": "US"}',
  NOW() - INTERVAL '2 hours',
  NULL,
  NULL
);

-- =======================
-- PRICING RULES DATA
-- =======================

-- First, create the pricing_rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('commission', 'markup', 'discount', 'shipping_adjustment', 'fee_waiver')),
  target_type TEXT NOT NULL CHECK (target_type IN ('global', 'category', 'vendor', 'product')),
  target_id UUID,
  value_type TEXT NOT NULL CHECK (value_type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2),
  max_order_value DECIMAL(10, 2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  conditions JSONB,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can view all pricing rules"
  ON pricing_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create pricing rules"
  ON pricing_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND (role = 'super_admin' OR role = 'admin')
    )
  );

CREATE POLICY "Admins can update pricing rules"
  ON pricing_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND (role = 'super_admin' OR role = 'admin')
    )
  );

CREATE POLICY "Admins can delete pricing rules"
  ON pricing_rules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Insert pricing rules
INSERT INTO pricing_rules (
  rule_name,
  rule_type,
  target_type,
  target_id,
  value_type,
  value,
  min_order_value,
  max_order_value,
  start_date,
  end_date,
  is_active,
  priority,
  conditions,
  created_by
) VALUES
-- Global Commission Rules
(
  'Global Platform Commission',
  'commission',
  'global',
  NULL,
  'percentage',
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  1,
  '{"description": "Standard platform commission on all sales"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),
(
  'High Value Order Commission',
  'commission',
  'global',
  NULL,
  'percentage',
  12.00,
  1000.00,
  NULL,
  NULL,
  NULL,
  true,
  2,
  '{"description": "Reduced commission for orders over $1000"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),

-- Category-Based Commission
(
  'Electronics Commission',
  'commission',
  'category',
  NULL,
  'percentage',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  3,
  '{"description": "Lower commission for electronics category", "category": "Electronics"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),
(
  'Handmade Crafts Commission',
  'commission',
  'category',
  NULL,
  'percentage',
  20.00,
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  3,
  '{"description": "Higher commission for handmade items", "category": "Handicrafts"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),

-- Markup Rules
(
  'Holiday Season Markup',
  'markup',
  'global',
  NULL,
  'percentage',
  5.00,
  NULL,
  NULL,
  '2024-11-01',
  '2025-01-15',
  true,
  5,
  '{"description": "Seasonal markup for holiday period"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'sales@sufiscience.com' LIMIT 1)
),
(
  'Premium Product Markup',
  'markup',
  'category',
  NULL,
  'percentage',
  8.00,
  100.00,
  NULL,
  NULL,
  NULL,
  true,
  4,
  '{"description": "Additional markup on premium products", "category": "Luxury"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),

-- Discount Rules
(
  'Black Friday Sale',
  'discount',
  'global',
  NULL,
  'percentage',
  25.00,
  NULL,
  NULL,
  '2024-11-29',
  '2024-12-01',
  false,
  10,
  '{"description": "Black Friday promotional discount"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'sales@sufiscience.com' LIMIT 1)
),
(
  'Bulk Order Discount',
  'discount',
  'global',
  NULL,
  'percentage',
  10.00,
  500.00,
  NULL,
  NULL,
  NULL,
  true,
  6,
  '{"description": "Discount for orders over $500"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'sales@sufiscience.com' LIMIT 1)
),
(
  'First Time Customer Discount',
  'discount',
  'global',
  NULL,
  'fixed',
  20.00,
  NULL,
  200.00,
  NULL,
  NULL,
  true,
  7,
  '{"description": "$20 off first order under $200"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'sales@sufiscience.com' LIMIT 1)
),

-- Shipping Adjustments
(
  'Free Shipping Threshold',
  'shipping_adjustment',
  'global',
  NULL,
  'percentage',
  100.00,
  75.00,
  NULL,
  NULL,
  NULL,
  true,
  8,
  '{"description": "Free shipping on orders over $75"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),
(
  'Express Shipping Discount',
  'shipping_adjustment',
  'global',
  NULL,
  'percentage',
  20.00,
  150.00,
  NULL,
  NULL,
  NULL,
  true,
  9,
  '{"description": "20% off express shipping for orders over $150"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),

-- Vendor-Specific Rules
(
  'New Vendor Promotion',
  'discount',
  'vendor',
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  'percentage',
  15.00,
  NULL,
  NULL,
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  11,
  '{"description": "Promotional discount for new vendor"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),

-- Fee Waiver Rules
(
  'Platform Fee Waiver - Trial',
  'fee_waiver',
  'vendor',
  NULL,
  'percentage',
  100.00,
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  12,
  '{"description": "100% fee waiver for vendors in trial period"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),
(
  'Partial Fee Waiver - High Volume',
  'fee_waiver',
  'vendor',
  NULL,
  'percentage',
  50.00,
  5000.00,
  NULL,
  NULL,
  NULL,
  true,
  13,
  '{"description": "50% fee waiver for vendors with monthly sales over $5000"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1)
),

-- Inactive/Expired Rules for testing
(
  'Summer Sale (Expired)',
  'discount',
  'global',
  NULL,
  'percentage',
  30.00,
  NULL,
  NULL,
  '2024-06-01',
  '2024-08-31',
  false,
  20,
  '{"description": "Summer promotional discount - expired"}',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'sales@sufiscience.com' LIMIT 1)
);

-- =======================
-- PAYOUT DATA
-- =======================

-- Ensure payout_requests table exists with correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payout_requests' AND column_name = 'payout_method') THEN
    ALTER TABLE payout_requests ADD COLUMN payout_method text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payout_requests' AND column_name = 'admin_notes') THEN
    ALTER TABLE payout_requests ADD COLUMN admin_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payout_requests' AND column_name = 'processed_by') THEN
    ALTER TABLE payout_requests ADD COLUMN processed_by UUID REFERENCES admin_users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payout_requests' AND column_name = 'processed_at') THEN
    ALTER TABLE payout_requests ADD COLUMN processed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Insert comprehensive payout data
INSERT INTO payout_requests (
  vendor_id,
  amount,
  status,
  payout_method,
  payout_details,
  period_start,
  period_end,
  admin_notes,
  processed_by,
  processed_at,
  created_at,
  updated_at
) VALUES
-- Pending Payouts (Need Admin Action)
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  2450.75,
  'pending',
  'bank_transfer',
  '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
  NOW() - INTERVAL '7 days',
  NOW(),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  1875.50,
  'pending',
  'paypal',
  '{"paypal_email": "vendor2@example.com"}',
  NOW() - INTERVAL '7 days',
  NOW(),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '5 hours'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  3250.00,
  'pending',
  'bank_transfer',
  '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593"}',
  NOW() - INTERVAL '7 days',
  NOW(),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  825.25,
  'pending',
  'stripe',
  '{"stripe_account_id": "acct_1234567890"}',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '7 days',
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '8 hours'
),

-- Processing Payouts
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  1650.00,
  'processing',
  'bank_transfer',
  '{"bank_name": "Wells Fargo", "account_last4": "9012", "routing_number": "121000248"}',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '7 days',
  'Batch payment initiated - Transaction ID: TXN-20241117-001',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '3 hours'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  2100.80,
  'processing',
  'paypal',
  '{"paypal_email": "vendor3@example.com"}',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '7 days',
  'PayPal batch payment in progress',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '6 hours'
),

-- Completed Payouts (Recent)
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  3150.40,
  'completed',
  'bank_transfer',
  '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
  NOW() - INTERVAL '21 days',
  NOW() - INTERVAL '14 days',
  'Successfully transferred - Ref: PYMT-2024-1101',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  1925.75,
  'completed',
  'stripe',
  '{"stripe_account_id": "acct_9876543210"}',
  NOW() - INTERVAL '21 days',
  NOW() - INTERVAL '14 days',
  'Stripe payout successful',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '4 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  2890.25,
  'completed',
  'paypal',
  '{"paypal_email": "vendor3@example.com"}',
  NOW() - INTERVAL '21 days',
  NOW() - INTERVAL '14 days',
  'PayPal payment completed',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '5 days'
),

-- Failed Payouts (Need Admin Attention)
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  1450.00,
  'failed',
  'bank_transfer',
  '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '21 days',
  'FAILED: Invalid account number - Vendor needs to update banking details',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '10 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  975.50,
  'failed',
  'paypal',
  '{"paypal_email": "oldvendor2@example.com"}',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '21 days',
  'FAILED: PayPal account not found - Email address may be outdated',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '11 days',
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '11 days'
),

-- Older Completed Payouts (Historical Data)
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  2750.00,
  'completed',
  'bank_transfer',
  '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '28 days',
  'October payout - Week 1',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '18 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  1680.30,
  'completed',
  'stripe',
  '{"stripe_account_id": "acct_9876543210"}',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '28 days',
  'October payout - Week 1',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '21 days',
  NOW() - INTERVAL '19 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  3420.15,
  'completed',
  'bank_transfer',
  '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593"}',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '28 days',
  'October payout - Week 1',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '22 days',
  NOW() - INTERVAL '20 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  2125.60,
  'completed',
  'bank_transfer',
  '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
  NOW() - INTERVAL '42 days',
  NOW() - INTERVAL '35 days',
  'September payout - Week 4',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '27 days',
  NOW() - INTERVAL '25 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  1550.00,
  'completed',
  'paypal',
  '{"paypal_email": "vendor2@example.com"}',
  NOW() - INTERVAL '42 days',
  NOW() - INTERVAL '35 days',
  'September payout - Week 4',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '26 days',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '26 days'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  2980.45,
  'completed',
  'stripe',
  '{"stripe_account_id": "acct_vendor3_stripe"}',
  NOW() - INTERVAL '42 days',
  NOW() - INTERVAL '35 days',
  'September payout - Week 4',
  (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1),
  NOW() - INTERVAL '27 days',
  NOW() - INTERVAL '29 days',
  NOW() - INTERVAL '27 days'
),

-- Additional pending for bulk action testing
(
  (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
  675.90,
  'pending',
  'bank_transfer',
  '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
  NOW() - INTERVAL '3 days',
  NOW(),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
  1120.00,
  'pending',
  'stripe',
  '{"stripe_account_id": "acct_9876543210"}',
  NOW() - INTERVAL '3 days',
  NOW(),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '45 minutes'
),
(
  (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
  1895.30,
  'pending',
  'paypal',
  '{"paypal_email": "vendor3@example.com"}',
  NOW() - INTERVAL '3 days',
  NOW(),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '15 minutes'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipping_labels_status ON shipping_labels(status);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_vendor ON shipping_labels(vendor_id);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_created ON shipping_labels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_type ON pricing_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_vendor ON payout_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created ON payout_requests(created_at DESC);
