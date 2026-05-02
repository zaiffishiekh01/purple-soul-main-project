/*
  # Comprehensive Workflow Test Data - COMPLETE
  
  Creates actionable test data for all workflows
*/

DO $$
DECLARE
  v_seed_vendor_id uuid := 'f2f1a0f8-58ec-4f8c-a5c2-6fa7d8ddf5df';
  v_vendor_id uuid;
  v_product_id_1 uuid;
  v_product_id_2 uuid;
  v_product_id_3 uuid;
  v_order_id_1 uuid;
  v_order_id_2 uuid;
BEGIN
  -- Prefer the dedicated approved vendor seeded by test-data migrations
  SELECT id INTO v_vendor_id
  FROM vendors
  WHERE id = v_seed_vendor_id
  LIMIT 1;

  -- Fallback to the original dashboard seeded vendor
  IF v_vendor_id IS NULL THEN
    SELECT id INTO v_vendor_id
    FROM vendors
    WHERE business_name = 'Test Vendor Store'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Final fallback to any approved vendor
  SELECT id INTO v_vendor_id
  FROM vendors
  WHERE v_vendor_id IS NULL
    AND (
      COALESCE(is_approved, false) = true
      OR lower(COALESCE(status, '')) = 'approved'
    )
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_vendor_id IS NULL THEN
    SELECT id INTO v_vendor_id
    FROM vendors
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'No vendor found.';
  END IF;

  DELETE FROM notifications WHERE vendor_id = v_vendor_id AND (message LIKE '%2025-NEW%' OR message LIKE '%TEST-%');
  DELETE FROM returns WHERE vendor_id = v_vendor_id AND return_number LIKE 'RET-2025-NEW-%';
  DELETE FROM support_tickets WHERE vendor_id = v_vendor_id AND ticket_number LIKE 'TKT-2025-NEW-%';
  DELETE FROM orders WHERE vendor_id = v_vendor_id AND order_number LIKE 'ORD-2025-%';
  DELETE FROM inventory WHERE vendor_id = v_vendor_id AND product_id IN (SELECT id FROM products WHERE vendor_id = v_vendor_id AND sku LIKE 'TEST-%');
  DELETE FROM products WHERE vendor_id = v_vendor_id AND sku LIKE 'TEST-%';

  INSERT INTO products (vendor_id, name, description, category, sku, base_price, price, stock_quantity, status)
  VALUES
    (v_vendor_id, 'Premium Wireless Headphones', 'High-quality noise-canceling headphones', 'Electronics', 'TEST-HP-001', 199.99, 199.99, 15, 'active'),
    (v_vendor_id, 'Organic Cotton T-Shirt', 'Comfortable organic cotton t-shirt', 'Clothing', 'TEST-TS-001', 29.99, 29.99, 8, 'active'),
    (v_vendor_id, 'Stainless Steel Water Bottle', 'Insulated water bottle', 'Home & Kitchen', 'TEST-WB-001', 34.99, 34.99, 2, 'active');

  SELECT id INTO STRICT v_product_id_1 FROM products WHERE vendor_id = v_vendor_id AND sku = 'TEST-HP-001';
  SELECT id INTO STRICT v_product_id_2 FROM products WHERE vendor_id = v_vendor_id AND sku = 'TEST-TS-001';
  SELECT id INTO STRICT v_product_id_3 FROM products WHERE vendor_id = v_vendor_id AND sku = 'TEST-WB-001';

  INSERT INTO inventory (vendor_id, product_id, quantity, low_stock_threshold)
  VALUES (v_vendor_id, v_product_id_1, 15, 20), (v_vendor_id, v_product_id_2, 8, 25), (v_vendor_id, v_product_id_3, 2, 15);

  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    customer_first_name, customer_last_initial,
    shipping_address, billing_address,
    subtotal, tax_amount, shipping_cost, discount_amount, total_amount,
    payment_status, payment_method, status
  )
  VALUES
    (v_vendor_id, 'ORD-2025-NEW-001', 'John M.', 'john@test.com', '+1-555-0101', 'John', 'M',
     '{"street": "789 Oak Ave", "city": "Portland", "state": "OR", "postal_code": "97201", "country": "USA"}'::jsonb,
     '{"street": "789 Oak Ave", "city": "Portland", "state": "OR", "postal_code": "97201", "country": "USA"}'::jsonb,
     199.99, 16.00, 12.00, 0, 227.99, 'paid', 'credit_card', 'pending'),
    (v_vendor_id, 'ORD-2025-NEW-002', 'Emma D.', 'emma@test.com', '+1-555-0102', 'Emma', 'D',
     '{"street": "321 Pine St", "city": "Seattle", "state": "WA", "postal_code": "98101", "country": "USA"}'::jsonb,
     '{"street": "321 Pine St", "city": "Seattle", "state": "WA", "postal_code": "98101", "country": "USA"}'::jsonb,
     89.97, 7.20, 8.00, 0, 105.17, 'paid', 'paypal', 'pending'),
    (v_vendor_id, 'ORD-2025-NEW-003', 'Michael B.', 'michael@test.com', '+1-555-0103', 'Michael', 'B',
     '{"street": "654 Maple Dr", "city": "San Francisco", "state": "CA", "postal_code": "94102", "country": "USA"}'::jsonb,
     '{"street": "654 Maple Dr", "city": "San Francisco", "state": "CA", "postal_code": "94102", "country": "USA"}'::jsonb,
     234.98, 18.80, 0, 10.00, 243.78, 'paid', 'credit_card', 'pending');

  SELECT id INTO STRICT v_order_id_1 FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2025-NEW-001';
  SELECT id INTO STRICT v_order_id_2 FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2025-NEW-002';

  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, reason, status, return_amount, items, notes)
  VALUES
    (v_vendor_id, v_order_id_1, 'RET-2025-NEW-001', 'John M.', 'john@test.com', 'defective', 'pending', 227.99, '[{"product_name": "Premium Wireless Headphones", "quantity": 1}]'::jsonb, 'Left speaker not working'),
    (v_vendor_id, v_order_id_2, 'RET-2025-NEW-002', 'Emma D.', 'emma@test.com', 'wrong_item', 'pending', 105.17, '[{"product_name": "Organic Cotton T-Shirt", "quantity": 3}]'::jsonb, 'Received wrong size');

  INSERT INTO support_tickets (vendor_id, ticket_number, subject, description, category, priority, status)
  VALUES
    (v_vendor_id, 'TKT-2025-NEW-001', 'Bulk pricing question', 'Do you offer bulk discounts for 100+ units?', 'product_inquiry', 'medium', 'open'),
    (v_vendor_id, 'TKT-2025-NEW-002', 'Shipping delay concern', 'Order ORD-2025-NEW-001 pending for 2 days', 'order_issue', 'high', 'open'),
    (v_vendor_id, 'TKT-2025-NEW-003', 'Customization request', 'Can you add company logo?', 'general', 'low', 'open');

  INSERT INTO notifications (vendor_id, title, message, type, is_read, action_url)
  VALUES
    (v_vendor_id, 'New Order', 'Order ORD-2025-NEW-001 needs processing', 'order', false, '/orders'),
    (v_vendor_id, 'New Order', 'Order ORD-2025-NEW-002 needs processing', 'order', false, '/orders'),
    (v_vendor_id, 'Return Pending', 'Return RET-2025-NEW-001 needs approval', 'return', false, '/returns'),
    (v_vendor_id, 'Low Stock', 'Headphones: 15 units (threshold: 20)', 'alert', false, '/inventory'),
    (v_vendor_id, 'Low Stock', 'T-Shirt: 8 units (threshold: 25)', 'alert', false, '/inventory'),
    (v_vendor_id, 'Critical Stock', 'Water Bottle: 2 units (threshold: 15)', 'alert', false, '/inventory'),
    (v_vendor_id, 'New Ticket', 'High priority TKT-2025-NEW-002', 'support', false, '/support');

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ TEST DATA CREATED SUCCESSFULLY!';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 ACTIONABLE ITEMS:';
  RAISE NOTICE '  ✓ 3 Pending Orders → Process & Ship';
  RAISE NOTICE '  ✓ 2 Pending Returns → Approve/Reject';
  RAISE NOTICE '  ✓ 3 Open Support Tickets → Respond';
  RAISE NOTICE '  ✓ 3 Low Stock Products → Restock';
  RAISE NOTICE '  ✓ 7 Unread Notifications → Review';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 TEST WORKFLOWS:';
  RAISE NOTICE '  1. Orders → Mark as shipped';
  RAISE NOTICE '  2. Returns → Approve/Reject';
  RAISE NOTICE '  3. Support → Reply to tickets';
  RAISE NOTICE '  4. Inventory → Restock items';
  RAISE NOTICE '  5. Products → Edit details';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;