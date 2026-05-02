-- Seed one required legacy order row for returns test migration
INSERT INTO orders (
  id,
  vendor_id,
  order_number,
  customer_name,
  customer_email,
  shipping_address,
  billing_address,
  status,
  total_amount,
  subtotal,
  tax_amount,
  shipping_cost,
  payment_status,
  payment_method,
  notes
)
SELECT
  'fbce51b0-f636-4ba7-8ec0-d8808bc363db',
  (SELECT vendor_id FROM orders ORDER BY created_at DESC LIMIT 1),
  'ORD-LEGACY-RET-001',
  'Legacy Seed',
  'legacy@example.com',
  '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
  '{"street":"legacy","city":"legacy","state":"NY","zip":"10001","country":"United States"}'::jsonb,
  'delivered',
  0,
  0,
  0,
  0,
  'paid',
  'card',
  'single seed order'
WHERE NOT EXISTS (
  SELECT 1 FROM orders WHERE id = 'fbce51b0-f636-4ba7-8ec0-d8808bc363db'
);

