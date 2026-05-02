/*
  # Add Comprehensive Returns Test Data
  
  1. Purpose
     - Create diverse return requests with various statuses
     - Enable testing of all return actions (approve, reject, refund)
     - Include different return reasons and conditions
  
  2. Test Scenarios Covered
     - Pending returns (awaiting approval)
     - Approved returns (ready for refund)
     - Received returns (items received back, ready for refund)
     - Completed returns (refunded)
     - Various return reasons (defective, wrong item, not as described, etc.)
     - Different refund amounts and methods
  
  3. Data Created
     - 15+ return records with diverse statuses
     - Return items details
     - Refund transactions
     - Customer information
*/

-- Clean existing return test data first
DELETE FROM returns WHERE return_number LIKE 'RET-TEST-%';

-- Ensure one canonical order exists for return seed data
INSERT INTO orders (
  vendor_id, order_number, customer_name, customer_email, customer_phone,
  shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
  shipping_cost, payment_status, payment_method, notes
)
SELECT
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce',
  'ORD-20251113-0003',
  'Returns Test Customer',
  'returns.test@example.com',
  '+1-555-0000',
  '{"street":"1 Test St","city":"Test City","state":"TS","zip":"10001","country":"United States"}'::jsonb,
  '{"street":"1 Test St","city":"Test City","state":"TS","zip":"10001","country":"United States"}'::jsonb,
  'delivered', 100.00, 90.00, 5.00, 5.00, 'paid', 'card', 'seed order for returns migration'
WHERE NOT EXISTS (
  SELECT 1 FROM orders WHERE order_number = 'ORD-20251113-0003'
);

-- Ensure legacy referenced order IDs exist so inserts don't fail before remap
INSERT INTO orders (id, vendor_id, order_number, customer_name, customer_email, shipping_address, billing_address, status, total_amount, subtotal, tax_amount, shipping_cost, payment_status, payment_method, notes)
SELECT 'fbce51b0-f636-4ba7-8ec0-d8808bc363db', 'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', 'ORD-LEGACY-RET-001', 'Legacy Seed', 'legacy@example.com',
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       'delivered', 0, 0, 0, 0, 'paid', 'card', 'legacy return seed'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'fbce51b0-f636-4ba7-8ec0-d8808bc363db');

INSERT INTO orders (id, vendor_id, order_number, customer_name, customer_email, shipping_address, billing_address, status, total_amount, subtotal, tax_amount, shipping_cost, payment_status, payment_method, notes)
SELECT '1f3a581b-f564-4c2d-9181-fa32606bf9db', 'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', 'ORD-LEGACY-RET-002', 'Legacy Seed', 'legacy@example.com',
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       'delivered', 0, 0, 0, 0, 'paid', 'card', 'legacy return seed'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = '1f3a581b-f564-4c2d-9181-fa32606bf9db');

INSERT INTO orders (id, vendor_id, order_number, customer_name, customer_email, shipping_address, billing_address, status, total_amount, subtotal, tax_amount, shipping_cost, payment_status, payment_method, notes)
SELECT '353a6e8d-0a8c-413e-8599-08bdd7bfaf66', 'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', 'ORD-LEGACY-RET-003', 'Legacy Seed', 'legacy@example.com',
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       'delivered', 0, 0, 0, 0, 'paid', 'card', 'legacy return seed'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = '353a6e8d-0a8c-413e-8599-08bdd7bfaf66');

INSERT INTO orders (id, vendor_id, order_number, customer_name, customer_email, shipping_address, billing_address, status, total_amount, subtotal, tax_amount, shipping_cost, payment_status, payment_method, notes)
SELECT 'd84736a3-37df-43f6-acac-f9c033872b9a', 'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', 'ORD-LEGACY-RET-004', 'Legacy Seed', 'legacy@example.com',
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
       'delivered', 0, 0, 0, 0, 'paid', 'card', 'legacy return seed'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'd84736a3-37df-43f6-acac-f9c033872b9a');

-- Insert comprehensive return test data
INSERT INTO returns (
  id,
  vendor_id,
  order_id,
  return_number,
  status,
  reason,
  notes,
  return_amount,
  restocking_fee,
  refund_method,
  customer_name,
  customer_email,
  customer_phone,
  order_number,
  items,
  approved_at,
  received_at,
  refunded_at,
  requested_at,
  processed_at,
  created_at
) VALUES
-- PENDING RETURNS (Need Approval/Action) --
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 1
  'fbce51b0-f636-4ba7-8ec0-d8808bc363db',
  'RET-TEST-001',
  'pending',
  'defective',
  'Product arrived with broken screen. Unable to use. Requesting full refund. Attached photos showing damage.',
  161.29,
  0.00,
  'original_payment',
  'Sarah Johnson',
  'sarah.johnson@example.com',
  '+1-555-0101',
  'ORD-20251113-0003',
  '[{"product_id": "prod-1", "product_name": "Wireless Headphones", "quantity": 1, "price": 161.29, "reason": "Broken on arrival"}]'::jsonb,
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '2 hours',
  NULL,
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 2
  '1f3a581b-f564-4c2d-9181-fa32606bf9db',
  'RET-TEST-002',
  'pending',
  'wrong_item',
  'Received blue version instead of red as ordered. Need exchange or refund.',
  403.58,
  0.00,
  'original_payment',
  'Michael Chen',
  'michael.chen@example.com',
  '+1-555-0102',
  'ORD-20251113-0003',
  '[{"product_id": "prod-2", "product_name": "Smart Watch", "quantity": 1, "price": 403.58, "reason": "Wrong color received"}]'::jsonb,
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '5 hours',
  NULL,
  NOW() - INTERVAL '5 hours'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 3
  '353a6e8d-0a8c-413e-8599-08bdd7bfaf66',
  'RET-TEST-003',
  'pending',
  'not_as_described',
  'Product quality is much lower than advertised. Material feels cheap and flimsy. Does not match description.',
  461.91,
  0.00,
  'original_payment',
  'Emily Rodriguez',
  'emily.rodriguez@example.com',
  '+1-555-0103',
  'ORD-20251113-0003',
  '[{"product_id": "prod-3", "product_name": "Leather Bag", "quantity": 1, "price": 461.91, "reason": "Poor quality, not as described"}]'::jsonb,
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '1 day',
  NULL,
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 4
  'd84736a3-37df-43f6-acac-f9c033872b9a',
  'RET-TEST-004',
  'pending',
  'changed_mind',
  'Changed my mind about the purchase. Item is unused and in original packaging with all tags.',
  287.48,
  28.75,
  'original_payment',
  'David Thompson',
  'david.thompson@example.com',
  '+1-555-0104',
  'ORD-20251113-0003',
  '[{"product_id": "prod-4", "product_name": "Running Shoes", "quantity": 1, "price": 287.48, "reason": "No longer needed"}]'::jsonb,
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '3 hours',
  NULL,
  NOW() - INTERVAL '3 hours'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 1
  'fbce51b0-f636-4ba7-8ec0-d8808bc363db',
  'RET-TEST-005',
  'pending',
  'damaged',
  'Package arrived damaged. Box was crushed during shipping. Product inside is broken.',
  161.29,
  0.00,
  'original_payment',
  'Jessica Williams',
  'jessica.williams@example.com',
  '+1-555-0105',
  'ORD-20251113-0003',
  '[{"product_id": "prod-5", "product_name": "Glass Vase", "quantity": 1, "price": 161.29, "reason": "Damaged in transit"}]'::jsonb,
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '30 minutes',
  NULL,
  NOW() - INTERVAL '30 minutes'
),

-- APPROVED RETURNS (Vendor Approved, Waiting for Customer to Ship Back) --
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 2
  '1f3a581b-f564-4c2d-9181-fa32606bf9db',
  'RET-TEST-006',
  'approved',
  'wrong_size',
  'Size is too large. Need smaller size or refund. Original tags still attached.',
  403.58,
  0.00,
  'original_payment',
  'Robert Martinez',
  'robert.martinez@example.com',
  '+1-555-0106',
  'ORD-20251113-0003',
  '[{"product_id": "prod-6", "product_name": "Designer Jacket", "quantity": 1, "price": 403.58, "reason": "Wrong size"}]'::jsonb,
  NOW() - INTERVAL '12 hours',
  NULL,
  NULL,
  NOW() - INTERVAL '2 days',
  NULL,
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 3
  '353a6e8d-0a8c-413e-8599-08bdd7bfaf66',
  'RET-TEST-007',
  'approved',
  'defective',
  'Item stopped working after 2 days. Requesting replacement or refund. Product under warranty.',
  461.91,
  0.00,
  'original_payment',
  'Amanda Garcia',
  'amanda.garcia@example.com',
  '+1-555-0107',
  'ORD-20251113-0003',
  '[{"product_id": "prod-7", "product_name": "Bluetooth Speaker", "quantity": 1, "price": 461.91, "reason": "Stopped working"}]'::jsonb,
  NOW() - INTERVAL '6 hours',
  NULL,
  NULL,
  NOW() - INTERVAL '1 day',
  NULL,
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 4
  'd84736a3-37df-43f6-acac-f9c033872b9a',
  'RET-TEST-008',
  'approved',
  'not_as_described',
  'Color significantly different from photos online. Looks faded and dull in person.',
  287.48,
  0.00,
  'original_payment',
  'Christopher Lee',
  'christopher.lee@example.com',
  '+1-555-0108',
  'ORD-20251113-0003',
  '[{"product_id": "prod-8", "product_name": "Sofa Cover", "quantity": 1, "price": 287.48, "reason": "Color mismatch"}]'::jsonb,
  NOW() - INTERVAL '1 day',
  NULL,
  NULL,
  NOW() - INTERVAL '3 days',
  NULL,
  NOW() - INTERVAL '3 days'
),

-- RECEIVED RETURNS (Items Received Back, Pending Refund Processing) --
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 1
  'fbce51b0-f636-4ba7-8ec0-d8808bc363db',
  'RET-TEST-009',
  'received',
  'defective',
  'Product not functioning as expected. Multiple issues found during use. Ready for refund.',
  161.29,
  0.00,
  'original_payment',
  'Jennifer White',
  'jennifer.white@example.com',
  '+1-555-0109',
  'ORD-20251113-0003',
  '[{"product_id": "prod-9", "product_name": "Coffee Maker", "quantity": 1, "price": 161.29, "reason": "Multiple defects"}]'::jsonb,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day',
  NULL,
  NOW() - INTERVAL '6 days',
  NULL,
  NOW() - INTERVAL '6 days'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 2
  '1f3a581b-f564-4c2d-9181-fa32606bf9db',
  'RET-TEST-010',
  'received',
  'not_as_described',
  'Color and material different from product photos. Item received and inspected.',
  403.58,
  0.00,
  'original_payment',
  'Matthew Brown',
  'matthew.brown@example.com',
  '+1-555-0110',
  'ORD-20251113-0003',
  '[{"product_id": "prod-10", "product_name": "Outdoor Chair", "quantity": 1, "price": 403.58, "reason": "Material mismatch"}]'::jsonb,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '6 hours',
  NULL,
  NOW() - INTERVAL '5 days',
  NULL,
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 3
  '353a6e8d-0a8c-413e-8599-08bdd7bfaf66',
  'RET-TEST-011',
  'received',
  'wrong_item',
  'Completely wrong product sent. Received item A instead of item B. Return received in warehouse.',
  461.91,
  0.00,
  'original_payment',
  'Ashley Davis',
  'ashley.davis@example.com',
  '+1-555-0111',
  'ORD-20251113-0003',
  '[{"product_id": "prod-11", "product_name": "Kitchen Scale", "quantity": 1, "price": 461.91, "reason": "Wrong product"}]'::jsonb,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '12 hours',
  NULL,
  NOW() - INTERVAL '4 days',
  NULL,
  NOW() - INTERVAL '4 days'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 4
  'd84736a3-37df-43f6-acac-f9c033872b9a',
  'RET-TEST-012',
  'received',
  'defective',
  'Manufacturing defect. Seams are coming apart. Item inspected and confirmed defective.',
  287.48,
  0.00,
  'store_credit',
  'Daniel Miller',
  'daniel.miller@example.com',
  '+1-555-0112',
  'ORD-20251113-0003',
  '[{"product_id": "prod-12", "product_name": "Backpack", "quantity": 1, "price": 287.48, "reason": "Manufacturing defect"}]'::jsonb,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '2 days',
  NULL,
  NOW() - INTERVAL '7 days',
  NULL,
  NOW() - INTERVAL '7 days'
),

-- COMPLETED/REFUNDED RETURNS --
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 1
  'fbce51b0-f636-4ba7-8ec0-d8808bc363db',
  'RET-TEST-013',
  'completed',
  'defective',
  'Product was defective on arrival. Battery would not charge. Full refund issued.',
  161.29,
  0.00,
  'original_payment',
  'Michelle Anderson',
  'michelle.anderson@example.com',
  '+1-555-0113',
  'ORD-20251113-0003',
  '[{"product_id": "prod-13", "product_name": "Power Bank", "quantity": 1, "price": 161.29, "reason": "Battery defect"}]'::jsonb,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '10 days'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 2
  '1f3a581b-f564-4c2d-9181-fa32606bf9db',
  'RET-TEST-014',
  'completed',
  'wrong_item',
  'Received completely different product than ordered. Refund processed and correct item sent.',
  403.58,
  0.00,
  'original_payment',
  'Ryan Taylor',
  'ryan.taylor@example.com',
  '+1-555-0114',
  'ORD-20251113-0003',
  '[{"product_id": "prod-14", "product_name": "Desk Lamp", "quantity": 1, "price": 403.58, "reason": "Wrong product shipped"}]'::jsonb,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '12 days'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 3
  '353a6e8d-0a8c-413e-8599-08bdd7bfaf66',
  'RET-TEST-015',
  'completed',
  'not_as_described',
  'Quality significantly lower than product description. Store credit issued per customer request.',
  461.91,
  0.00,
  'store_credit',
  'Stephanie Thomas',
  'stephanie.thomas@example.com',
  '+1-555-0115',
  'ORD-20251113-0003',
  '[{"product_id": "prod-15", "product_name": "Wall Art", "quantity": 1, "price": 461.91, "reason": "Quality issues"}]'::jsonb,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '9 days'
),
(
  gen_random_uuid(),
  'a30e7e9e-2fc3-47bc-aa4d-53c18d2a61ce', -- Demo Vendor 4
  'd84736a3-37df-43f6-acac-f9c033872b9a',
  'RET-TEST-016',
  'completed',
  'damaged',
  'Package damaged during shipping. Product broken. Full refund completed.',
  287.48,
  0.00,
  'original_payment',
  'Kevin Jackson',
  'kevin.jackson@example.com',
  '+1-555-0116',
  'ORD-20251113-0003',
  '[{"product_id": "prod-16", "product_name": "Mirror", "quantity": 1, "price": 287.48, "reason": "Broken in transit"}]'::jsonb,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '8 days'
);

-- Remap all seeded returns to the canonical order id
UPDATE returns
SET order_id = (
  SELECT id
  FROM orders
  WHERE order_number = 'ORD-20251113-0003'
  ORDER BY created_at DESC
  LIMIT 1
)
WHERE return_number LIKE 'RET-TEST-%';

-- Add corresponding refund transactions for completed returns
INSERT INTO transactions (
  vendor_id,
  order_id,
  type,
  amount,
  status,
  description,
  created_at
)
SELECT 
  r.vendor_id,
  r.order_id,
  'refund',
  -r.return_amount,
  'completed',
  'Refund for return ' || r.return_number || ' - ' || r.reason,
  r.refunded_at
FROM returns r
WHERE r.status = 'completed' 
  AND r.return_number LIKE 'RET-TEST-%'
  AND r.refunded_at IS NOT NULL;
