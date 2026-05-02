/*
  # Add More Dummy Orders for Testing

  1. Purpose
    - Add more orders in various statuses for comprehensive testing
    - Provide diverse order scenarios (different payment methods, amounts, dates)
    - Enable testing of order management features with realistic data

  2. New Orders Include
    - Various order statuses (pending, processing, shipped, delivered, cancelled)
    - Different payment statuses and methods
    - Mix of order values and quantities
    - Recent and older orders for date range testing
*/

DO $$
DECLARE
  v_vendor_id uuid;
  v_product1_id uuid;
  v_product2_id uuid;
  v_product3_id uuid;
  v_product4_id uuid;
  v_product5_id uuid;
  v_product6_id uuid;
  v_order_id uuid;
BEGIN
  -- Get vendor ID
  SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1;
  
  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Test vendor not found. Please run the main dummy data migration first.';
  END IF;

  -- Get product IDs
  SELECT id INTO v_product1_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'WBH-001' LIMIT 1;
  SELECT id INTO v_product2_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'SFW-002' LIMIT 1;
  SELECT id INTO v_product3_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'OCT-003' LIMIT 1;
  SELECT id INTO v_product4_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'LLB-004' LIMIT 1;
  SELECT id INTO v_product5_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'WGM-005' LIMIT 1;
  SELECT id INTO v_product6_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'PYM-006' LIMIT 1;

  -- Order 6: Cancelled order
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-006', 'Robert Thompson', 'rthompson@email.com', '+1-555-2468',
    jsonb_build_object('street', '777 Market Street', 'city', 'Boston', 'state', 'MA', 'zip', '02108', 'country', 'United States'),
    jsonb_build_object('street', '777 Market Street', 'city', 'Boston', 'state', 'MA', 'zip', '02108', 'country', 'United States'),
    'cancelled', 89.98, 79.98, 8.00, 2.00, 'refunded', 'credit_card', 'Customer requested cancellation due to delivery time', NOW() - INTERVAL '10 days'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES (v_order_id, v_product5_id, 1, 59.99, 59.99);

  -- Order 7: Processing with multiple items
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-007', 'Jennifer Lee', 'jlee@email.com', '+1-555-1357',
    jsonb_build_object('street', '222 Elm Street, Apt 12', 'city', 'Portland', 'state', 'OR', 'zip', '97201', 'country', 'United States'),
    jsonb_build_object('street', '222 Elm Street, Apt 12', 'city', 'Portland', 'state', 'OR', 'zip', '97201', 'country', 'United States'),
    'processing', 229.96, 199.97, 20.00, 10.00, 'paid', 'debit_card', 'Gift message requested', NOW() - INTERVAL '3 days'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES 
    (v_order_id, v_product3_id, 2, 29.99, 59.98),
    (v_order_id, v_product6_id, 2, 39.99, 79.98),
    (v_order_id, v_product5_id, 1, 59.99, 59.99);

  -- Order 8: Pending payment
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-008', 'David Garcia', 'dgarcia@email.com', '+1-555-8642',
    jsonb_build_object('street', '999 Ocean Drive', 'city', 'Miami', 'state', 'FL', 'zip', '33139', 'country', 'United States'),
    jsonb_build_object('street', '999 Ocean Drive', 'city', 'Miami', 'state', 'FL', 'zip', '33139', 'country', 'United States'),
    'pending', 139.98, 129.99, 10.00, 0.00, 'pending', 'bank_transfer', 'Awaiting bank transfer confirmation', NOW() - INTERVAL '1 day'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES (v_order_id, v_product1_id, 1, 129.99, 129.99);

  -- Order 9: Delivered large order
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-009', 'Amanda White', 'awhite@email.com', '+1-555-9753',
    jsonb_build_object('street', '456 Sunset Boulevard', 'city', 'Denver', 'state', 'CO', 'zip', '80202', 'country', 'United States'),
    jsonb_build_object('street', '456 Sunset Boulevard', 'city', 'Denver', 'state', 'CO', 'zip', '80202', 'country', 'United States'),
    'delivered', 549.95, 509.95, 40.00, 0.00, 'paid', 'paypal', 'Corporate bulk order', NOW() - INTERVAL '15 days'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES 
    (v_order_id, v_product1_id, 2, 129.99, 259.98),
    (v_order_id, v_product2_id, 1, 249.99, 249.99);

  -- Order 10: Recent pending order
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-010', 'Christopher Brown', 'cbrown@email.com', '+1-555-4826',
    jsonb_build_object('street', '111 Park Avenue', 'city', 'Phoenix', 'state', 'AZ', 'zip', '85001', 'country', 'United States'),
    jsonb_build_object('street', '111 Park Avenue', 'city', 'Phoenix', 'state', 'AZ', 'zip', '85001', 'country', 'United States'),
    'pending', 99.97, 89.98, 8.00, 2.00, 'paid', 'credit_card', 'Standard shipping', NOW() - INTERVAL '6 hours'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES 
    (v_order_id, v_product3_id, 1, 29.99, 29.99),
    (v_order_id, v_product5_id, 1, 59.99, 59.99);

  -- Order 11: Shipped international order
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-011', 'Sophie Anderson', 'sanderson@email.com', '+44-20-7946-0958',
    jsonb_build_object('street', '10 Downing Street', 'city', 'London', 'state', '', 'zip', 'SW1A 2AA', 'country', 'United Kingdom'),
    jsonb_build_object('street', '10 Downing Street', 'city', 'London', 'state', '', 'zip', 'SW1A 2AA', 'country', 'United Kingdom'),
    'shipped', 324.97, 279.98, 0.00, 45.00, 'paid', 'credit_card', 'International express shipping', NOW() - INTERVAL '4 days'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES 
    (v_order_id, v_product2_id, 1, 249.99, 249.99),
    (v_order_id, v_product3_id, 1, 29.99, 29.99);

  INSERT INTO shipments (order_id, vendor_id, tracking_number, carrier, shipping_method, status, shipped_at, estimated_delivery)
  VALUES (v_order_id, v_vendor_id, 'INTL987654321', 'DHL', 'International', 'in_transit', NOW() - INTERVAL '4 days', NOW() + INTERVAL '3 days');

  -- Order 12: Processing with priority
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-012', 'Marcus Johnson', 'mjohnson@email.com', '+1-555-7531',
    jsonb_build_object('street', '888 Broadway', 'city', 'Nashville', 'state', 'TN', 'zip', '37203', 'country', 'United States'),
    jsonb_build_object('street', '888 Broadway', 'city', 'Nashville', 'state', 'TN', 'zip', '37203', 'country', 'United States'),
    'processing', 169.97, 149.98, 15.00, 5.00, 'paid', 'apple_pay', 'Priority processing requested', NOW() - INTERVAL '2 days'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES 
    (v_order_id, v_product4_id, 1, 89.99, 89.99),
    (v_order_id, v_product5_id, 1, 59.99, 59.99);

  -- Order 13: Just delivered
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes, created_at
  ) VALUES (
    v_vendor_id, 'ORD-2024-013', 'Rachel Kim', 'rkim@email.com', '+1-555-3698',
    jsonb_build_object('street', '555 Main Street', 'city', 'San Diego', 'state', 'CA', 'zip', '92101', 'country', 'United States'),
    jsonb_build_object('street', '555 Main Street', 'city', 'San Diego', 'state', 'CA', 'zip', '92101', 'country', 'United States'),
    'delivered', 79.97, 69.98, 7.00, 3.00, 'paid', 'credit_card', 'Left at doorstep', NOW() - INTERVAL '1 hour'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES 
    (v_order_id, v_product6_id, 1, 39.99, 39.99),
    (v_order_id, v_product3_id, 1, 29.99, 29.99);

  INSERT INTO shipments (order_id, vendor_id, tracking_number, carrier, shipping_method, status, shipped_at, delivered_at, estimated_delivery)
  VALUES (v_order_id, v_vendor_id, 'TRK2024FRESH', 'USPS', 'Standard', 'delivered', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 hour', NOW());

END $$;
