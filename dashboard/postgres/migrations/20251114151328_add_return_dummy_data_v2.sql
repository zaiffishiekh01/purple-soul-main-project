/*
  # Add Dummy Return Data

  Insert test return requests for testing return management
*/

DO $$
DECLARE
  v_vendor_id uuid;
  v_order_id uuid;
BEGIN
  -- Get vendor ID
  SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1;
  
  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Test vendor not found';
  END IF;

  -- Delete existing test returns
  DELETE FROM returns WHERE vendor_id = v_vendor_id;

  -- Return 1: Requested (Pending Review)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-013' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-001', 'ORD-2024-013', 'Rachel Kim', 'rkim@email.com', '+1-555-3698',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Premium Yoga Mat', 'sku', 'PYM-006', 'quantity', 1, 'unit_price', 39.99)
    ),
    'Product damaged during shipping', 'requested', 39.99, 'Customer reports torn packaging and damaged mat',
    NOW() - INTERVAL '2 hours'
  );

  -- Return 2: Requested (Multiple Items)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-009' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-002', 'ORD-2024-009', 'Amanda White', 'awhite@email.com', '+1-555-9753',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Wireless Bluetooth Headphones', 'sku', 'WBH-001', 'quantity', 1, 'unit_price', 129.99)
    ),
    'Product not as described', 'requested', 129.99, 'Customer expected better sound quality',
    NOW() - INTERVAL '1 day'
  );

  -- Return 3: Approved (Waiting for Product)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-004' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at, approved_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-003', 'ORD-2024-004', 'James Wilson', 'jwilson@email.com', '+1-555-3456',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Leather Laptop Bag', 'sku', 'LLB-004', 'quantity', 1, 'unit_price', 89.99)
    ),
    'Wrong size ordered', 'approved', 89.99, 'Return label sent to customer',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
  );

  -- Return 4: Requested (Defective)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-007' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-004', 'ORD-2024-007', 'Jennifer Lee', 'jlee@email.com', '+1-555-1357',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Wireless Gaming Mouse', 'sku', 'WGM-005', 'quantity', 1, 'unit_price', 59.99)
    ),
    'Product defective - not working', 'requested', 59.99, 'Customer reports mouse not connecting',
    NOW() - INTERVAL '6 hours'
  );

  -- Return 5: Received (Awaiting Inspection)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-011' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at, approved_at, received_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-005', 'ORD-2024-011', 'Sophie Anderson', 'sanderson@email.com', '+44-20-7946-0958',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Organic Cotton T-Shirt', 'sku', 'OCT-003', 'quantity', 1, 'unit_price', 29.99)
    ),
    'Wrong color received', 'received', 29.99, 'Product received at warehouse, awaiting quality check',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'
  );

  -- Return 6: Received (Ready for Refund)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-012' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at, approved_at, received_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-006', 'ORD-2024-012', 'Marcus Johnson', 'mjohnson@email.com', '+1-555-7531',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Leather Laptop Bag', 'sku', 'LLB-004', 'quantity', 1, 'unit_price', 89.99)
    ),
    'Changed mind', 'received', 89.99, 'Product inspected - good condition. Ready to process refund',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '12 hours'
  );

  -- Return 7: Refunded (Completed)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-006' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at, approved_at, received_at, refunded_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-007', 'ORD-2024-006', 'Robert Thompson', 'rthompson@email.com', '+1-555-2468',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Wireless Gaming Mouse', 'sku', 'WGM-005', 'quantity', 1, 'unit_price', 59.99)
    ),
    'Product arrived too late', 'refunded', 59.99, 'Full refund processed successfully',
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'
  );

  -- Return 8: Refunded (Full Order)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-001' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at, approved_at, received_at, refunded_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-008', 'ORD-2024-001', 'Sarah Johnson', 'sarah.j@email.com', '+1-555-1234',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Wireless Bluetooth Headphones', 'sku', 'WBH-001', 'quantity', 1, 'unit_price', 129.99)
    ),
    'No longer needed', 'refunded', 129.99, 'Customer returned within 30-day window. Refund completed',
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'
  );

  -- Return 9: Rejected
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-010' LIMIT 1;
  INSERT INTO returns (
    vendor_id, order_id, return_number, order_number, customer_name, customer_email, customer_phone,
    items, reason, status, return_amount, notes, requested_at, processed_at
  ) VALUES (
    v_vendor_id, v_order_id, 'RET-2024-009', 'ORD-2024-010', 'Christopher Brown', 'cbrown@email.com', '+1-555-4826',
    jsonb_build_array(
      jsonb_build_object('product_name', 'Organic Cotton T-Shirt', 'sku', 'OCT-003', 'quantity', 1, 'unit_price', 29.99)
    ),
    'Bought by mistake', 'rejected', 29.99, 'Return requested after 45 days - outside return window',
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'
  );

END $$;
