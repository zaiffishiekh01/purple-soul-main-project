/*
  # Add Comprehensive Returns Test Data for ALL Workflow Scenarios

  Complete test data covering every return status and action:
  - requested → approve/reject actions
  - approved → mark as in_transit
  - in_transit → mark as received  
  - received → process refund
  - completed/refunded → view only
  - rejected → view only

  15 returns covering all scenarios for comprehensive testing
*/

DO $$
DECLARE
  v_vendor1 uuid;
  v_vendor2 uuid;
  v_vendor3 uuid;
  v_order1 uuid;
  v_order2 uuid;
  v_order3 uuid;
  v_order4 uuid;
  v_order5 uuid;
BEGIN
  -- Get first 3 vendors
  SELECT id INTO v_vendor1 FROM vendors ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO v_vendor2 FROM vendors ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO v_vendor3 FROM vendors ORDER BY created_at LIMIT 1 OFFSET 2;
  
  -- Get first 5 orders
  SELECT id INTO v_order1 FROM orders ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO v_order2 FROM orders ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO v_order3 FROM orders ORDER BY created_at LIMIT 1 OFFSET 2;
  SELECT id INTO v_order4 FROM orders ORDER BY created_at LIMIT 1 OFFSET 3;
  SELECT id INTO v_order5 FROM orders ORDER BY created_at LIMIT 1 OFFSET 4;

  -- Clean up old test data
  DELETE FROM returns WHERE return_number LIKE 'RET-TEST-%';

  -- === SCENARIO 1: REQUESTED (3) - NEEDS APPROVAL ACTION ===
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at) VALUES
  (v_vendor1, v_order1, 'RET-TEST-001', 'John Smith', 'john.smith@email.com', '+1-555-0101', 'defective', 'requested', 299.99, '[{"product_name": "Wireless Headphones Pro", "quantity": 1, "price": 299.99, "reason": "Left speaker not working"}]'::jsonb, 'Customer reports left speaker produces no sound. Purchased 5 days ago.', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  (v_vendor1, v_order2, 'RET-TEST-002', 'Sarah Johnson', 'sarah.j@email.com', '+1-555-0102', 'wrong_item', 'requested', 149.99, '[{"product_name": "Bluetooth Speaker", "quantity": 1, "price": 149.99, "reason": "Received different color"}]'::jsonb, 'Ordered black speaker but received silver. Still sealed.', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
  (v_vendor2, v_order3, 'RET-TEST-003', 'Mike Chen', 'mike.chen@email.com', '+1-555-0103', 'not_as_described', 'requested', 89.99, '[{"product_name": "Designer T-Shirt", "quantity": 2, "price": 44.99, "reason": "Material quality poor"}]'::jsonb, 'Fabric thinner than photos suggested.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- === SCENARIO 2: APPROVED (1) - WAITING FOR CUSTOMER SHIPMENT ===
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at, approved_at) VALUES
  (v_vendor1, v_order4, 'RET-TEST-004', 'Emily Davis', 'emily.d@email.com', '+1-555-0104', 'changed_mind', 'approved', 199.99, '[{"product_name": "Smart Watch", "quantity": 1, "price": 199.99, "reason": "Found better deal"}]'::jsonb, 'Approved. Customer has 7 days to ship back.', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '11 hours');

  -- === SCENARIO 3: IN_TRANSIT (2) - NEEDS MARK AS RECEIVED ACTION ===
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at, approved_at) VALUES
  (v_vendor2, v_order5, 'RET-TEST-005', 'David Wilson', 'david.w@email.com', '+1-555-0105', 'defective', 'in_transit', 129.99, '[{"product_name": "Running Shoes", "quantity": 1, "price": 129.99, "reason": "Sole separated"}]'::jsonb, 'Customer shipped back. In transit.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
  (v_vendor3, v_order1, 'RET-TEST-006', 'Lisa Martinez', 'lisa.m@email.com', '+1-555-0106', 'not_as_described', 'in_transit', 79.99, '[{"product_name": "Kitchen Mixer", "quantity": 1, "price": 79.99, "reason": "Missing attachments"}]'::jsonb, 'Package on its way. Expected in 2 days.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');

  -- === SCENARIO 4: RECEIVED (2) - NEEDS PROCESS REFUND ACTION ===
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at, approved_at, received_at) VALUES
  (v_vendor1, v_order2, 'RET-TEST-007', 'Robert Brown', 'robert.b@email.com', '+1-555-0107', 'wrong_item', 'received', 349.99, '[{"product_name": "Gaming Keyboard", "quantity": 1, "price": 349.99, "reason": "Wrong model"}]'::jsonb, 'Received and inspected. Good condition. Ready for refund.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 hour'),
  (v_vendor2, v_order3, 'RET-TEST-008', 'Jennifer Taylor', 'jennifer.t@email.com', '+1-555-0108', 'defective', 'received', 59.99, '[{"product_name": "Yoga Mat", "quantity": 1, "price": 59.99, "reason": "Tears easily"}]'::jsonb, 'Received. Defect confirmed. Processing refund.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 hours');

  -- === SCENARIO 5: COMPLETED/REFUNDED (2) - VIEW ONLY ===
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at, approved_at, received_at, refunded_at) VALUES
  (v_vendor1, v_order4, 'RET-TEST-009', 'Amanda White', 'amanda.w@email.com', '+1-555-0109', 'changed_mind', 'refunded', 179.99, '[{"product_name": "Fitness Tracker", "quantity": 1, "price": 179.99, "reason": "Found alternative"}]'::jsonb, 'Fully processed. Refund issued to original payment.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
  (v_vendor3, v_order5, 'RET-TEST-010', 'Chris Anderson', 'chris.a@email.com', '+1-555-0110', 'defective', 'completed', 249.99, '[{"product_name": "Coffee Maker", "quantity": 1, "price": 249.99, "reason": "Heating element broken"}]'::jsonb, 'Successfully refunded. Customer notified. Case closed.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days');

  -- === SCENARIO 6: REJECTED (2) - VIEW ONLY ===
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at) VALUES
  (v_vendor2, v_order1, 'RET-TEST-011', 'Mark Thompson', 'mark.t@email.com', '+1-555-0111', 'changed_mind', 'rejected', 39.99, '[{"product_name": "Phone Case", "quantity": 1, "price": 39.99, "reason": "Color preference"}]'::jsonb, 'REJECTED: Item is custom-made per customer specifications.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (v_vendor1, v_order3, 'RET-TEST-012', 'Patricia Garcia', 'patricia.g@email.com', '+1-555-0112', 'changed_mind', 'rejected', 119.99, '[{"product_name": "LED Light Strips", "quantity": 1, "price": 119.99, "reason": "No longer needed"}]'::jsonb, 'REJECTED: All sales final - clearance sale.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

  -- === SCENARIO 7: EDGE CASES (3) ===
  -- High value return
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at) VALUES
  (v_vendor1, v_order5, 'RET-TEST-013', 'Steven Lee', 'steven.l@email.com', '+1-555-0113', 'defective', 'requested', 1299.99, '[{"product_name": "Professional Camera", "quantity": 1, "price": 1299.99, "reason": "Autofocus not working"}]'::jsonb, 'HIGH VALUE - Test thoroughly upon receipt.', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

  -- Multiple items
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at) VALUES
  (v_vendor3, v_order2, 'RET-TEST-014', 'Rachel Green', 'rachel.g@email.com', '+1-555-0114', 'not_as_described', 'requested', 189.97, '[{"product_name": "Bath Towel Set", "quantity": 3, "price": 29.99, "reason": "Color fades"}, {"product_name": "Shower Curtain", "quantity": 1, "price": 39.99, "reason": "Cheap material"}]'::jsonb, 'Returning entire bathroom set - quality issues.', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours');

  -- Urgent - expires soon
  INSERT INTO returns (vendor_id, order_id, return_number, customer_name, customer_email, customer_phone, reason, status, return_amount, items, notes, created_at, requested_at) VALUES
  (v_vendor2, v_order4, 'RET-TEST-015', 'Kevin Rodriguez', 'kevin.r@email.com', '+1-555-0115', 'wrong_item', 'requested', 159.99, '[{"product_name": "Winter Jacket", "quantity": 1, "price": 159.99, "reason": "Wrong size"}]'::jsonb, 'URGENT - Return window expires in 2 days!', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

END $$;