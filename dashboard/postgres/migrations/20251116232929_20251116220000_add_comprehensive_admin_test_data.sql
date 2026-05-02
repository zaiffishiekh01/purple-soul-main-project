/*
  # Add Comprehensive Test Data

  Adds products, orders, transactions to populate admin dashboard
*/

-- Products
INSERT INTO products (vendor_id, name, description, price, cost, category, sku, status, images)
SELECT 
  v.id,
  'Product ' || s.n || ' - ' || v.business_name,
  'High quality product from ' || v.business_name,
  (20 + (random() * 180))::numeric(10,2),
  (10 + (random() * 90))::numeric(10,2),
  CASE (s.n % 4)
    WHEN 0 THEN 'Books & Islamic Literature'
    WHEN 1 THEN 'Clothing & Accessories'
    WHEN 2 THEN 'Food & Halal Products'
    ELSE 'Home & Lifestyle'
  END,
  'SKU-' || SUBSTRING(v.id::text, 1, 8) || '-' || LPAD(s.n::text, 4, '0'),
  CASE WHEN random() > 0.2 THEN 'active' ELSE 'inactive' END,
  jsonb_build_array('https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg')
FROM vendors v
CROSS JOIN generate_series(1, 10) AS s(n);

-- Inventory
INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location)
SELECT 
  p.id, p.vendor_id, (random() * 100)::int, (random() * 10)::int, 10, 'Warehouse ' || (1 + (random() * 3)::int)
FROM products p;

-- Orders
INSERT INTO orders (vendor_id, order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, payment_status, created_at)
SELECT 
  v.id,
  'ORD-' || TO_CHAR(NOW() - (s.n || ' days')::interval, 'YYYYMMDD') || '-' || LPAD(s.n::text, 4, '0'),
  'Customer ' || s.n,
  'customer' || s.n || '@example.com',
  '+1234567' || LPAD(s.n::text, 4, '0'),
  jsonb_build_object('street', s.n || ' Main Street', 'city', 'Demo City', 'state', 'CA', 'zip', '90001', 'country', 'USA'),
  (50 + (random() * 450))::numeric(10,2),
  CASE (s.n % 5) WHEN 0 THEN 'pending' WHEN 1 THEN 'processing' WHEN 2 THEN 'shipped' WHEN 3 THEN 'delivered' ELSE 'cancelled' END,
  CASE WHEN random() > 0.1 THEN 'paid' ELSE 'pending' END,
  NOW() - (s.n || ' days')::interval
FROM vendors v
CROSS JOIN generate_series(1, 5) AS s(n);

-- Order Items with subtotal
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
SELECT 
  o.id, p.id,
  (1 + (random() * 3)::int) as qty,
  p.price,
  p.price * (1 + (random() * 3)::int)
FROM orders o
CROSS JOIN LATERAL (
  SELECT id, price FROM products WHERE vendor_id = o.vendor_id ORDER BY random() LIMIT (1 + (random() * 2)::int)
) p;

-- Transactions
INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
SELECT o.vendor_id, o.id, 'sale', o.total_amount,
  CASE WHEN o.payment_status = 'paid' THEN 'completed' ELSE 'pending' END,
  'Sale - ' || o.order_number, o.created_at
FROM orders o WHERE o.payment_status = 'paid';

-- Fees
INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
SELECT o.vendor_id, o.id, 'fee', -(o.total_amount * 0.15), 'completed',
  'Platform fee - ' || o.order_number, o.created_at + interval '1 hour'
FROM orders o WHERE o.payment_status = 'paid';

-- Payouts
INSERT INTO transactions (vendor_id, type, amount, status, description, created_at)
SELECT v.id, 'payout', -((500 + (random() * 2000))::numeric(10,2)),
  CASE WHEN random() > 0.3 THEN 'completed' ELSE 'pending' END,
  'Payout to ' || v.business_name,
  NOW() - ((1 + random() * 30)::int || ' days')::interval
FROM vendors v;