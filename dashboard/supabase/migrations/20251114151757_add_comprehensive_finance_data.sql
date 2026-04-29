/*
  # Add Comprehensive Finance Data

  1. Purpose
    - Create realistic transaction history
    - Include all transaction types (sales, refunds, fees, payouts)
    - Calculate accurate financial metrics

  2. Data Includes
    - Sales transactions from orders
    - Refund transactions from returns
    - Platform fees
    - Payout transactions
    - Monthly revenue tracking
*/

DO $$
DECLARE
  v_vendor_id uuid;
  v_order_id uuid;
  v_return_id uuid;
BEGIN
  -- Get vendor ID
  SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1;
  
  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Test vendor not found';
  END IF;

  -- Delete existing transactions for this vendor
  DELETE FROM transactions WHERE vendor_id = v_vendor_id;

  -- Create sales transactions from delivered orders (oldest first)
  -- Sale 1: ORD-2024-004 (Delivered)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-004' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 199.97, 'completed',
    'Order #ORD-2024-004 - James Wilson',
    NOW() - INTERVAL '10 days'
  );

  -- Platform fee for Sale 1
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -9.99, 'completed',
    'Platform fee (5%) - Order #ORD-2024-004',
    NOW() - INTERVAL '10 days'
  );

  -- Sale 2: ORD-2024-006 (Delivered)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-006' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 94.98, 'completed',
    'Order #ORD-2024-006 - Robert Thompson',
    NOW() - INTERVAL '9 days'
  );

  -- Platform fee for Sale 2
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -4.75, 'completed',
    'Platform fee (5%) - Order #ORD-2024-006',
    NOW() - INTERVAL '9 days'
  );

  -- Sale 3: ORD-2024-008 (Delivered)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-008' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 349.97, 'completed',
    'Order #ORD-2024-008 - Patricia Garcia',
    NOW() - INTERVAL '8 days'
  );

  -- Platform fee for Sale 3
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -17.50, 'completed',
    'Platform fee (5%) - Order #ORD-2024-008',
    NOW() - INTERVAL '8 days'
  );

  -- Payout 1: Weekly payout
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, NULL, 'payout', -280.00, 'completed',
    'Weekly payout to bank account ending in 4532',
    NOW() - INTERVAL '7 days'
  );

  -- Sale 4: ORD-2024-010 (Delivered)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-010' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 109.98, 'completed',
    'Order #ORD-2024-010 - Christopher Brown',
    NOW() - INTERVAL '6 days'
  );

  -- Platform fee for Sale 4
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -5.50, 'completed',
    'Platform fee (5%) - Order #ORD-2024-010',
    NOW() - INTERVAL '6 days'
  );

  -- Sale 5: ORD-2024-011 (Delivered)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-011' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 59.98, 'completed',
    'Order #ORD-2024-011 - Sophie Anderson',
    NOW() - INTERVAL '5 days'
  );

  -- Platform fee for Sale 5
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -3.00, 'completed',
    'Platform fee (5%) - Order #ORD-2024-011',
    NOW() - INTERVAL '5 days'
  );

  -- Refund 1: RET-2024-008 (Completed refund)
  SELECT id INTO v_return_id FROM returns WHERE vendor_id = v_vendor_id AND return_number = 'RET-2024-008' LIMIT 1;
  SELECT order_id INTO v_order_id FROM returns WHERE id = v_return_id;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'refund', -129.99, 'completed',
    'Refund - Return #RET-2024-008 - Sarah Johnson',
    NOW() - INTERVAL '4 days'
  );

  -- Fee reversal for refunded order
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'adjustment', 6.50, 'completed',
    'Fee reversal - Refund #RET-2024-008',
    NOW() - INTERVAL '4 days'
  );

  -- Sale 6: ORD-2024-003 (Shipped now delivered)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-003' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 119.98, 'completed',
    'Order #ORD-2024-003 - Emily Davis',
    NOW() - INTERVAL '3 days'
  );

  -- Platform fee for Sale 6
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -6.00, 'completed',
    'Platform fee (5%) - Order #ORD-2024-003',
    NOW() - INTERVAL '3 days'
  );

  -- Sale 7: ORD-2024-012 (Delivered)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-012' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 189.98, 'completed',
    'Order #ORD-2024-012 - Marcus Johnson',
    NOW() - INTERVAL '2 days'
  );

  -- Platform fee for Sale 7
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -9.50, 'completed',
    'Platform fee (5%) - Order #ORD-2024-012',
    NOW() - INTERVAL '2 days'
  );

  -- Sale 8: ORD-2024-002 (Processing - pending)
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-002' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 279.98, 'pending',
    'Order #ORD-2024-002 - Michael Chen',
    NOW() - INTERVAL '1 day'
  );

  -- Refund 2: RET-2024-007 (Completed refund)
  SELECT id INTO v_return_id FROM returns WHERE vendor_id = v_vendor_id AND return_number = 'RET-2024-007' LIMIT 1;
  SELECT order_id INTO v_order_id FROM returns WHERE id = v_return_id;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'refund', -59.99, 'completed',
    'Refund - Return #RET-2024-007 - Robert Thompson',
    NOW() - INTERVAL '12 hours'
  );

  -- Fee reversal for refunded order
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'adjustment', 3.00, 'completed',
    'Fee reversal - Refund #RET-2024-007',
    NOW() - INTERVAL '12 hours'
  );

  -- Sale 9: Recent sale
  SELECT id INTO v_order_id FROM orders WHERE vendor_id = v_vendor_id AND order_number = 'ORD-2024-013' LIMIT 1;
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'sale', 39.99, 'completed',
    'Order #ORD-2024-013 - Rachel Kim',
    NOW() - INTERVAL '6 hours'
  );

  -- Platform fee for Sale 9
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, v_order_id, 'fee', -2.00, 'completed',
    'Platform fee (5%) - Order #ORD-2024-013',
    NOW() - INTERVAL '6 hours'
  );

  -- Promotional credit
  INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, created_at)
  VALUES (
    v_vendor_id, NULL, 'adjustment', 50.00, 'completed',
    'Promotional credit - New vendor bonus',
    NOW() - INTERVAL '5 hours'
  );

END $$;
