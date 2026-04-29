/*
  # Add Comprehensive Test Data for Admin Actions & Workflows

  This migration replaces the previous admin test data with more targeted
  dummy data specifically designed to test all admin action buttons.

  ## PAYOUT REQUESTS - Test Actions
  - Approve pending payouts
  - Reject pending payouts (with reason)
  - View payout details and history
  - Filter by status

  ## SHIPPING LABELS - Test Actions
  - View label details
  - Download labels
  - Filter by carrier
  - Search by tracking number

  ## PRICING RULES - Test Actions
  - Create new rules (product/category/vendor scope)
  - Edit existing rules
  - Delete rules
  - Toggle active/inactive status
  - Set priority levels

  ## Status Distribution
  - Enough items in each status to test filtering
  - Mix of recent and historical data
  - Edge cases (missing data, special characters, etc.)
*/

-- =======================
-- CLEAN UP OLD DATA
-- =======================

DELETE FROM shipping_labels;
DELETE FROM payout_requests;
DELETE FROM regional_price_rules WHERE id IN (
  SELECT id FROM regional_price_rules
  WHERE created_at > NOW() - INTERVAL '1 hour'
);

-- =======================
-- PAYOUT REQUESTS DATA
-- =======================

-- Get vendor IDs for reference
DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  vendor3_id UUID;
  admin_finance_id UUID;
BEGIN
  -- Get vendor IDs
  SELECT id INTO vendor1_id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1;
  SELECT id INTO vendor3_id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1;
  SELECT id INTO admin_finance_id FROM admin_users WHERE email = 'finance@sufiscience.com' LIMIT 1;

  -- PENDING PAYOUTS (Need Admin Action - 8 items)
  INSERT INTO payout_requests (
    vendor_id, amount, status, payout_method, payout_details,
    period_start, period_end, created_at, updated_at
  ) VALUES
  (vendor1_id, 3250.75, 'pending', 'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021", "account_holder": "Artisan Crafts Co"}',
    NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

  (vendor2_id, 2180.50, 'pending', 'paypal',
    '{"paypal_email": "vendor2@example.com", "verified": true}',
    NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),

  (vendor3_id, 4125.00, 'pending', 'stripe',
    '{"stripe_account_id": "acct_vendor3stripe", "country": "US"}',
    NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

  (vendor1_id, 1890.25, 'pending', 'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021", "account_holder": "Artisan Crafts Co"}',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),

  (vendor2_id, 975.80, 'pending', 'stripe',
    '{"stripe_account_id": "acct_vendor2stripe", "country": "US"}',
    NOW() - INTERVAL '3 days', NOW(), NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),

  (vendor3_id, 5420.00, 'pending', 'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593", "account_holder": "Demo Vendor 3 LLC"}',
    NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),

  (vendor1_id, 675.50, 'pending', 'paypal',
    '{"paypal_email": "artisan@example.com", "verified": true}',
    NOW() - INTERVAL '3 days', NOW(), NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'),

  (vendor2_id, 2340.90, 'pending', 'bank_transfer',
    '{"bank_name": "Wells Fargo", "account_last4": "9012", "routing_number": "121000248", "account_holder": "Demo Vendor 2 Inc"}',
    NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours');

  -- PROCESSING PAYOUTS (Currently Being Processed - 3 items)
  INSERT INTO payout_requests (
    vendor_id, amount, status, payout_method, payout_details,
    period_start, period_end, admin_notes, processed_by, processed_at,
    created_at, updated_at
  ) VALUES
  (vendor1_id, 2875.40, 'processing', 'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021", "account_holder": "Artisan Crafts Co"}',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days',
    'ACH transfer initiated - Batch ID: BATCH-20241117-001',
    admin_finance_id, NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),

  (vendor2_id, 1650.75, 'processing', 'stripe',
    '{"stripe_account_id": "acct_vendor2stripe", "country": "US"}',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days',
    'Stripe payout in progress - Transfer ID: tr_1234567890',
    admin_finance_id, NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),

  (vendor3_id, 3920.60, 'processing', 'paypal',
    '{"paypal_email": "vendor3@example.com", "verified": true}',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days',
    'PayPal mass payment batch submitted - Batch ID: PP-BATCH-789',
    admin_finance_id, NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours');

  -- COMPLETED PAYOUTS (Successfully Processed - 6 items)
  INSERT INTO payout_requests (
    vendor_id, amount, status, payout_method, payout_details,
    period_start, period_end, admin_notes, processed_by, processed_at,
    created_at, updated_at
  ) VALUES
  (vendor1_id, 3580.90, 'completed', 'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021", "account_holder": "Artisan Crafts Co"}',
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
    'Successfully transferred - Confirmation: TXN-20241110-A123',
    admin_finance_id, NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),

  (vendor2_id, 2125.30, 'completed', 'stripe',
    '{"stripe_account_id": "acct_vendor2stripe", "country": "US"}',
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
    'Stripe payout completed - Transfer ID: tr_completed_456',
    admin_finance_id, NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days'),

  (vendor3_id, 4750.15, 'completed', 'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593", "account_holder": "Demo Vendor 3 LLC"}',
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
    'ACH completed successfully - Trace: ACH-110824-789',
    admin_finance_id, NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),

  (vendor1_id, 2990.50, 'completed', 'paypal',
    '{"paypal_email": "artisan@example.com", "verified": true}',
    NOW() - INTERVAL '28 days', NOW() - INTERVAL '21 days',
    'PayPal payment completed - Transaction ID: PP-2024-456789',
    admin_finance_id, NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days'),

  (vendor2_id, 1825.70, 'completed', 'stripe',
    '{"stripe_account_id": "acct_vendor2stripe", "country": "US"}',
    NOW() - INTERVAL '28 days', NOW() - INTERVAL '21 days',
    'Stripe payout successful',
    admin_finance_id, NOW() - INTERVAL '13 days',
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days'),

  (vendor3_id, 3650.25, 'completed', 'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593", "account_holder": "Demo Vendor 3 LLC"}',
    NOW() - INTERVAL '28 days', NOW() - INTERVAL '21 days',
    'Wire transfer completed',
    admin_finance_id, NOW() - INTERVAL '11 days',
    NOW() - INTERVAL '13 days', NOW() - INTERVAL '11 days');

  -- FAILED PAYOUTS (Need Admin Attention - 3 items)
  INSERT INTO payout_requests (
    vendor_id, amount, status, payout_method, payout_details,
    period_start, period_end, rejection_reason, processed_by, processed_at,
    created_at, updated_at
  ) VALUES
  (vendor1_id, 1750.00, 'failed', 'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021", "account_holder": "Artisan Crafts Co"}',
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '28 days',
    'REJECTED BY BANK: Invalid account number. Please verify banking details with vendor.',
    admin_finance_id, NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),

  (vendor2_id, 890.50, 'failed', 'paypal',
    '{"paypal_email": "oldvendor2@example.com", "verified": false}',
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '28 days',
    'PayPal account not found. Email address may be outdated or account closed.',
    admin_finance_id, NOW() - INTERVAL '19 days',
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '19 days'),

  (vendor3_id, 2450.75, 'failed', 'stripe',
    '{"stripe_account_id": "acct_oldaccount", "country": "US"}',
    NOW() - INTERVAL '42 days', NOW() - INTERVAL '35 days',
    'Stripe account disconnected. Vendor needs to reconnect their Stripe account.',
    admin_finance_id, NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '27 days', NOW() - INTERVAL '25 days');

END $$;

-- =======================
-- SHIPPING LABELS DATA
-- =======================

DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  vendor3_id UUID;
  order_ids UUID[];
BEGIN
  -- Get vendor IDs
  SELECT id INTO vendor1_id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1;
  SELECT id INTO vendor3_id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1;

  -- Get some order IDs
  SELECT ARRAY_AGG(id) INTO order_ids FROM orders LIMIT 25;

  -- USPS Labels (8 labels)
  INSERT INTO shipping_labels (
    vendor_id, order_id, carrier, service_type, tracking_number,
    label_url, status, cost, weight_oz, from_address, to_address,
    created_at, shipped_at, delivered_at
  ) VALUES
  (vendor1_id, order_ids[1], 'USPS', 'Priority Mail', 'USPS-9400111111111111111',
    'https://storage.example.com/labels/usps-001.pdf', 'delivered', 12.50, 24,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "456 Customer Ave", "city": "Seattle", "state": "WA", "zip": "98101", "country": "US"}',
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days'),

  (vendor1_id, order_ids[2], 'USPS', 'Priority Mail Express', 'USPS-9400122222222222222',
    'https://storage.example.com/labels/usps-002.pdf', 'shipped', 24.75, 16,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "789 Buyer Rd", "city": "San Francisco", "state": "CA", "zip": "94102", "country": "US"}',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL),

  (vendor2_id, order_ids[3], 'USPS', 'First Class', 'USPS-9400133333333333333',
    'https://storage.example.com/labels/usps-003.pdf', 'printed', 5.25, 8,
    '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
    '{"street": "321 Home St", "city": "Denver", "state": "CO", "zip": "80202", "country": "US"}',
    NOW() - INTERVAL '1 day', NULL, NULL),

  (vendor3_id, order_ids[4], 'USPS', 'Priority Mail', 'USPS-9400144444444444444',
    'https://storage.example.com/labels/usps-004.pdf', 'pending', 15.00, 32,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "654 Oak Ave", "city": "Boston", "state": "MA", "zip": "02101", "country": "US"}',
    NOW() - INTERVAL '6 hours', NULL, NULL),

  (vendor1_id, order_ids[5], 'USPS', 'Priority Mail', 'USPS-9400155555555555555',
    'https://storage.example.com/labels/usps-005.pdf', 'pending', 13.00, 20,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "123 Test St", "city": "Atlanta", "state": "GA", "zip": "30301", "country": "US"}',
    NOW() - INTERVAL '4 hours', NULL, NULL),

  (vendor2_id, order_ids[6], 'USPS', 'Priority Mail', 'USPS-9400166666666666666',
    'https://storage.example.com/labels/usps-006.pdf', 'shipped', 14.25, 28,
    '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
    '{"street": "456 Main St", "city": "Dallas", "state": "TX", "zip": "75201", "country": "US"}',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL),

  (vendor3_id, order_ids[7], 'USPS', 'First Class', 'USPS-9400177777777777777',
    'https://storage.example.com/labels/usps-007.pdf', 'delivered', 6.50, 10,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "789 Elm St", "city": "Milwaukee", "state": "WI", "zip": "53201", "country": "US"}',
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '15 days'),

  (vendor1_id, order_ids[8], 'USPS', 'Priority Mail Express', 'USPS-9400188888888888888',
    'https://storage.example.com/labels/usps-008.pdf', 'cancelled', 28.00, 18,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "321 Pine St", "city": "Sacramento", "state": "CA", "zip": "95814", "country": "US"}',
    NOW() - INTERVAL '7 days', NULL, NULL);

  -- FedEx Labels (6 labels)
  INSERT INTO shipping_labels (
    vendor_id, order_id, carrier, service_type, tracking_number,
    label_url, status, cost, weight_oz, from_address, to_address,
    created_at, shipped_at, delivered_at
  ) VALUES
  (vendor1_id, order_ids[9], 'FedEx', 'Ground', 'FEDEX-770011111111111',
    'https://storage.example.com/labels/fedex-001.pdf', 'delivered', 18.50, 48,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "987 Pine St", "city": "Miami", "state": "FL", "zip": "33101", "country": "US"}',
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '14 days'),

  (vendor2_id, order_ids[10], 'FedEx', '2Day', 'FEDEX-770022222222222',
    'https://storage.example.com/labels/fedex-002.pdf', 'shipped', 35.00, 64,
    '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
    '{"street": "147 Elm St", "city": "New York", "state": "NY", "zip": "10001", "country": "US"}',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL),

  (vendor3_id, order_ids[11], 'FedEx', 'Express Saver', 'FEDEX-770033333333333',
    'https://storage.example.com/labels/fedex-003.pdf', 'printed', 42.00, 80,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "258 Maple Ave", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "US"}',
    NOW() - INTERVAL '12 hours', NULL, NULL),

  (vendor1_id, order_ids[12], 'FedEx', 'Standard Overnight', 'FEDEX-770044444444444',
    'https://storage.example.com/labels/fedex-004.pdf', 'pending', 65.00, 40,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "369 Cedar Rd", "city": "Phoenix", "state": "AZ", "zip": "85001", "country": "US"}',
    NOW() - INTERVAL '2 hours', NULL, NULL),

  (vendor2_id, order_ids[13], 'FedEx', 'Ground', 'FEDEX-770055555555555',
    'https://storage.example.com/labels/fedex-005.pdf', 'pending', 19.50, 52,
    '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
    '{"street": "456 Test Ave", "city": "Houston", "state": "TX", "zip": "77001", "country": "US"}',
    NOW() - INTERVAL '3 hours', NULL, NULL),

  (vendor3_id, order_ids[14], 'FedEx', '2Day', 'FEDEX-770066666666666',
    'https://storage.example.com/labels/fedex-006.pdf', 'shipped', 38.75, 70,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "789 Oak St", "city": "Detroit", "state": "MI", "zip": "48201", "country": "US"}',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL);

  -- UPS Labels (6 labels)
  INSERT INTO shipping_labels (
    vendor_id, order_id, carrier, service_type, tracking_number,
    label_url, status, cost, weight_oz, from_address, to_address,
    created_at, shipped_at, delivered_at
  ) VALUES
  (vendor2_id, order_ids[15], 'UPS', 'Ground', 'UPS-1Z999AA111111111111',
    'https://storage.example.com/labels/ups-001.pdf', 'delivered', 16.25, 56,
    '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
    '{"street": "741 Birch St", "city": "Philadelphia", "state": "PA", "zip": "19101", "country": "US"}',
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days', NOW() - INTERVAL '13 days'),

  (vendor3_id, order_ids[16], 'UPS', '3 Day Select', 'UPS-1Z999AA222222222222',
    'https://storage.example.com/labels/ups-002.pdf', 'shipped', 28.50, 72,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "852 Walnut Ave", "city": "Houston", "state": "TX", "zip": "77001", "country": "US"}',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL),

  (vendor1_id, order_ids[17], 'UPS', '2nd Day Air', 'UPS-1Z999AA333333333333',
    'https://storage.example.com/labels/ups-003.pdf', 'printed', 38.75, 44,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "963 Spruce Ln", "city": "Dallas", "state": "TX", "zip": "75201", "country": "US"}',
    NOW() - INTERVAL '8 hours', NULL, NULL),

  (vendor2_id, order_ids[18], 'UPS', 'Ground', 'UPS-1Z999AA444444444444',
    'https://storage.example.com/labels/ups-004.pdf', 'pending', 17.00, 60,
    '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
    '{"street": "789 Test Rd", "city": "San Antonio", "state": "TX", "zip": "78201", "country": "US"}',
    NOW() - INTERVAL '2 hours', NULL, NULL),

  (vendor3_id, order_ids[19], 'UPS', 'Next Day Air', 'UPS-1Z999AA555555555555',
    'https://storage.example.com/labels/ups-005.pdf', 'pending', 75.00, 28,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "159 Ash St", "city": "San Diego", "state": "CA", "zip": "92101", "country": "US"}',
    NOW() - INTERVAL '1 hour', NULL, NULL),

  (vendor1_id, order_ids[20], 'UPS', 'Ground', 'UPS-1Z999AA666666666666',
    'https://storage.example.com/labels/ups-006.pdf', 'delivered', 20.25, 66,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "321 Walnut St", "city": "Las Vegas", "state": "NV", "zip": "89101", "country": "US"}',
    NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days', NOW() - INTERVAL '16 days');

  -- DHL Labels - International (5 labels)
  INSERT INTO shipping_labels (
    vendor_id, order_id, carrier, service_type, tracking_number,
    label_url, status, cost, weight_oz, from_address, to_address,
    created_at, shipped_at, delivered_at
  ) VALUES
  (vendor3_id, order_ids[21], 'DHL', 'Express Worldwide', 'DHL-5500111111111',
    'https://storage.example.com/labels/dhl-001.pdf', 'delivered', 125.00, 96,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "10 Downing Street", "city": "London", "state": "", "zip": "SW1A 2AA", "country": "GB"}',
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days', NOW() - INTERVAL '18 days'),

  (vendor1_id, order_ids[22], 'DHL', 'Economy Select', 'DHL-5500222222222',
    'https://storage.example.com/labels/dhl-002.pdf', 'shipped', 85.00, 64,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "Rue de Rivoli 1", "city": "Paris", "state": "", "zip": "75001", "country": "FR"}',
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NULL),

  (vendor2_id, order_ids[23], 'DHL', 'Express Worldwide', 'DHL-5500333333333',
    'https://storage.example.com/labels/dhl-003.pdf', 'printed', 145.00, 112,
    '{"street": "789 Store Blvd", "city": "Austin", "state": "TX", "zip": "78701", "country": "US"}',
    '{"street": "Alexanderplatz 1", "city": "Berlin", "state": "", "zip": "10178", "country": "DE"}',
    NOW() - INTERVAL '1 day', NULL, NULL),

  (vendor3_id, order_ids[24], 'DHL', 'Express Worldwide', 'DHL-5500444444444',
    'https://storage.example.com/labels/dhl-004.pdf', 'pending', 130.00, 88,
    '{"street": "456 Market St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}',
    '{"street": "Ginza 1-chome", "city": "Tokyo", "state": "", "zip": "104-0061", "country": "JP"}',
    NOW() - INTERVAL '5 hours', NULL, NULL),

  (vendor1_id, order_ids[25], 'DHL', 'Economy Select', 'DHL-5500555555555',
    'https://storage.example.com/labels/dhl-005.pdf', 'shipped', 95.00, 70,
    '{"street": "123 Vendor St", "city": "Portland", "state": "OR", "zip": "97201", "country": "US"}',
    '{"street": "King Street 1", "city": "Toronto", "state": "ON", "zip": "M5H 1A1", "country": "CA"}',
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NULL);

END $$;

-- =======================
-- PRICING RULES DATA
-- =======================

DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  admin_id UUID;
  product_ids UUID[];
BEGIN
  -- Get IDs
  SELECT id INTO vendor1_id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1;
  SELECT id INTO admin_id FROM admin_users WHERE email = 'admin@sufiscience.com' LIMIT 1;
  SELECT ARRAY_AGG(id) INTO product_ids FROM products LIMIT 5;

  -- Category-Based Rules (Active - 5 rules)
  INSERT INTO regional_price_rules (
    scope, category, country_code, markup_type, markup_value,
    priority, is_active, created_at, updated_at
  ) VALUES
  ('category', 'Handicrafts', 'US', 'FLAT', 25.00, 5, true, NOW(), NOW()),
  ('category', 'Electronics', 'US', 'PERCENT', 15.00, 4, true, NOW(), NOW()),
  ('category', 'Fashion & Apparel', 'US', 'FLAT', 20.00, 3, true, NOW(), NOW()),
  ('category', 'Home & Garden', 'IN', 'PERCENT', 10.00, 3, true, NOW(), NOW()),
  ('category', 'Beauty & Personal Care', 'GB', 'FLAT', 30.00, 4, true, NOW(), NOW());

  -- Product-Based Rules (Active - 3 rules)
  IF array_length(product_ids, 1) >= 3 THEN
    INSERT INTO regional_price_rules (
      scope, product_id, country_code, markup_type, markup_value,
      priority, is_active, created_at, updated_at
    ) VALUES
    ('product', product_ids[1], 'US', 'FLAT', 50.00, 10, true, NOW(), NOW()),
    ('product', product_ids[2], 'CA', 'PERCENT', 20.00, 9, true, NOW(), NOW()),
    ('product', product_ids[3], 'AU', 'FLAT', 45.00, 8, true, NOW(), NOW());
  END IF;

  -- Vendor-Based Rules (Active - 2 rules)
  INSERT INTO regional_price_rules (
    scope, vendor_id, country_code, markup_type, markup_value,
    priority, is_active, created_at, updated_at
  ) VALUES
  ('vendor', vendor1_id, 'DE', 'PERCENT', 18.00, 6, true, NOW(), NOW()),
  ('vendor', vendor2_id, 'FR', 'FLAT', 35.00, 6, true, NOW(), NOW());

  -- Inactive Rules (For testing toggle - 3 rules)
  INSERT INTO regional_price_rules (
    scope, category, country_code, markup_type, markup_value,
    priority, is_active, created_at, updated_at
  ) VALUES
  ('category', 'Sports & Outdoors', 'US', 'PERCENT', 12.00, 2, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('category', 'Books & Media', 'US', 'FLAT', 15.00, 2, false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('category', 'Toys & Games', 'JP', 'PERCENT', 25.00, 3, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

  -- High Priority Rules (For testing priority order - 2 rules)
  INSERT INTO regional_price_rules (
    scope, category, country_code, markup_type, markup_value,
    priority, is_active, created_at, updated_at
  ) VALUES
  ('category', 'Luxury Goods', 'US', 'PERCENT', 30.00, 15, true, NOW(), NOW()),
  ('category', 'Digital Products', 'US', 'FLAT', 10.00, 12, true, NOW(), NOW());

END $$;

-- =======================
-- CREATE INDEXES
-- =======================

CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created ON payout_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_status ON shipping_labels(status);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_carrier ON shipping_labels(carrier);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_tracking ON shipping_labels(tracking_number);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_active ON regional_price_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_priority ON regional_price_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_scope ON regional_price_rules(scope);
