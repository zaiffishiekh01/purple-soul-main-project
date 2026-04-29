/*
  # Add Dummy Test Data v3

  Insert test data for testing the vendor dashboard functionality
*/

DO $$
DECLARE
  v_user_id uuid := '58b46169-8841-4423-8c72-6ce2fe4743d3';
  v_vendor_id uuid;
  v_product1_id uuid;
  v_product2_id uuid;
  v_product3_id uuid;
  v_product4_id uuid;
  v_order1_id uuid;
  v_order2_id uuid;
  v_order3_id uuid;
BEGIN
  -- Check if test vendor already exists
  SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1;
  
  IF v_vendor_id IS NULL THEN
    -- Insert vendor
    INSERT INTO vendors (
      user_id,
      business_name,
      business_type,
      contact_email,
      contact_phone,
      address,
      tax_id,
      status
    ) VALUES (
      v_user_id,
      'Test Vendor Store',
      'E-commerce',
      'john@testvendor.com',
      '+1-555-0123',
      jsonb_build_object(
        'street', '123 Business Street, Suite 100',
        'city', 'New York',
        'state', 'NY',
        'zip', '10001',
        'country', 'United States'
      ),
      'TAX123456',
      'active'
    ) RETURNING id INTO v_vendor_id;
  END IF;

  -- Delete existing test data to avoid duplicates
  DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE vendor_id = v_vendor_id);
  DELETE FROM shipments WHERE vendor_id = v_vendor_id;
  DELETE FROM shipping_labels WHERE vendor_id = v_vendor_id;
  DELETE FROM notifications WHERE vendor_id = v_vendor_id;
  DELETE FROM orders WHERE vendor_id = v_vendor_id;
  DELETE FROM products WHERE vendor_id = v_vendor_id;

  -- Insert products
  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status, images)
  VALUES
    (v_vendor_id, 'Wireless Bluetooth Headphones', 'Premium noise-cancelling headphones with 30hr battery', 'Electronics', 'WBH-001', 129.99, 65.00, 'active', '["https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg"]'::jsonb);

  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status, images)
  VALUES
    (v_vendor_id, 'Smart Fitness Watch', 'Track your health and fitness goals with advanced sensors', 'Electronics', 'SFW-002', 249.99, 120.00, 'active', '["https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg"]'::jsonb);

  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status, images)
  VALUES
    (v_vendor_id, 'Organic Cotton T-Shirt', 'Comfortable and sustainable cotton t-shirt', 'Clothing', 'OCT-003', 29.99, 12.00, 'active', '["https://images.pexels.com/photos/1232459/pexels-photo-1232459.jpeg"]'::jsonb);

  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status, images)
  VALUES
    (v_vendor_id, 'Leather Laptop Bag', 'Professional leather bag with multiple compartments', 'Accessories', 'LLB-004', 89.99, 45.00, 'active', '["https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg"]'::jsonb);

  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status, images)
  VALUES
    (v_vendor_id, 'Wireless Gaming Mouse', 'High-precision gaming mouse with RGB lighting', 'Electronics', 'WGM-005', 59.99, 28.00, 'active', '[]'::jsonb);

  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status, images)
  VALUES
    (v_vendor_id, 'Premium Yoga Mat', 'Non-slip eco-friendly yoga mat', 'Sports', 'PYM-006', 39.99, 18.00, 'active', '[]'::jsonb);

  -- Get product IDs
  SELECT id INTO v_product1_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'WBH-001' LIMIT 1;
  SELECT id INTO v_product2_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'SFW-002' LIMIT 1;
  SELECT id INTO v_product3_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'OCT-003' LIMIT 1;
  SELECT id INTO v_product4_id FROM products WHERE vendor_id = v_vendor_id AND sku = 'LLB-004' LIMIT 1;

  -- Insert orders
  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes
  ) VALUES
    (
      v_vendor_id, 'ORD-2024-001', 'Sarah Johnson', 'sarah.j@email.com', '+1-555-1234',
      jsonb_build_object('street', '456 Oak Avenue', 'city', 'Los Angeles', 'state', 'CA', 'zip', '90001', 'country', 'United States'),
      jsonb_build_object('street', '456 Oak Avenue', 'city', 'Los Angeles', 'state', 'CA', 'zip', '90001', 'country', 'United States'),
      'pending', 159.98, 139.98, 14.00, 6.00, 'paid', 'credit_card', 'Customer requested gift wrapping'
    ) RETURNING id INTO v_order1_id;

  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes
  ) VALUES
    (
      v_vendor_id, 'ORD-2024-002', 'Michael Chen', 'mchen@email.com', '+1-555-5678',
      jsonb_build_object('street', '789 Pine Road, Apt 5B', 'city', 'Chicago', 'state', 'IL', 'zip', '60601', 'country', 'United States'),
      jsonb_build_object('street', '789 Pine Road, Apt 5B', 'city', 'Chicago', 'state', 'IL', 'zip', '60601', 'country', 'United States'),
      'processing', 279.98, 249.99, 25.00, 5.00, 'paid', 'paypal', 'Express shipping requested'
    ) RETURNING id INTO v_order2_id;

  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes
  ) VALUES
    (
      v_vendor_id, 'ORD-2024-003', 'Emily Davis', 'emily.d@email.com', '+1-555-9012',
      jsonb_build_object('street', '321 Maple Street', 'city', 'Austin', 'state', 'TX', 'zip', '73301', 'country', 'United States'),
      jsonb_build_object('street', '321 Maple Street', 'city', 'Austin', 'state', 'TX', 'zip', '73301', 'country', 'United States'),
      'shipped', 119.98, 89.99, 9.00, 21.00, 'paid', 'credit_card', ''
    ) RETURNING id INTO v_order3_id;

  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes
  ) VALUES
    (
      v_vendor_id, 'ORD-2024-004', 'James Wilson', 'jwilson@email.com', '+1-555-3456',
      jsonb_build_object('street', '555 Broadway Ave', 'city', 'Seattle', 'state', 'WA', 'zip', '98101', 'country', 'United States'),
      jsonb_build_object('street', '555 Broadway Ave', 'city', 'Seattle', 'state', 'WA', 'zip', '98101', 'country', 'United States'),
      'delivered', 199.97, 179.97, 18.00, 2.00, 'paid', 'credit_card', ''
    );

  INSERT INTO orders (
    vendor_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, billing_address, status, total_amount, subtotal, tax_amount,
    shipping_cost, payment_status, payment_method, notes
  ) VALUES
    (
      v_vendor_id, 'ORD-2024-005', 'Lisa Martinez', 'lmartinez@email.com', '+1-555-7890',
      jsonb_build_object('street', '888 Tech Boulevard', 'city', 'San Francisco', 'state', 'CA', 'zip', '94102', 'country', 'United States'),
      jsonb_build_object('street', '888 Tech Boulevard', 'city', 'San Francisco', 'state', 'CA', 'zip', '94102', 'country', 'United States'),
      'pending', 69.98, 59.99, 6.00, 4.00, 'pending', 'credit_card', 'First time customer'
    );

  -- Insert order items
  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES
    (v_order1_id, v_product1_id, 1, 129.99, 129.99),
    (v_order1_id, v_product3_id, 1, 29.99, 29.99);

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES
    (v_order2_id, v_product2_id, 1, 249.99, 249.99);

  INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
  VALUES
    (v_order3_id, v_product4_id, 1, 89.99, 89.99);

  -- Insert shipments
  INSERT INTO shipments (
    order_id, vendor_id, tracking_number, carrier, shipping_method, status,
    shipped_at, estimated_delivery
  ) VALUES
    (v_order2_id, v_vendor_id, 'TRK1234567890', 'UPS', 'Express', 'in_transit', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day');

  INSERT INTO shipments (
    order_id, vendor_id, tracking_number, carrier, shipping_method, status,
    shipped_at, estimated_delivery
  ) VALUES
    (v_order3_id, v_vendor_id, 'TRK0987654321', 'FedEx', 'Standard', 'delivered', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day');

  -- Insert shipping labels
  INSERT INTO shipping_labels (
    vendor_id, order_id, order_date, product_names, sku, quantity,
    product_weight, product_length, product_width, product_height, product_category,
    vendor_name, pickup_name, pickup_address, pickup_phone, pickup_email,
    pickup_city, pickup_state, pickup_pincode, pickup_country,
    customer_name, shipping_address, shipping_city, shipping_state,
    shipping_pincode, shipping_country, customer_phone, customer_email,
    courier_partner, shipping_method, tracking_preference,
    package_weight, package_length, package_width, package_height,
    number_of_packages, package_type,
    awb_number, tracking_number, status
  ) VALUES
    (
      v_vendor_id, v_order1_id, NOW(), 'Wireless Bluetooth Headphones, Organic Cotton T-Shirt', 'WBH-001', 2,
      0.8, 25, 15, 10, 'Electronics',
      'Test Vendor Store', 'John Doe', '123 Business Street, Suite 100', '+1-555-0123', 'john@testvendor.com',
      'New York', 'NY', '10001', 'United States',
      'Sarah Johnson', '456 Oak Avenue', 'Los Angeles', 'CA',
      '90001', 'United States', '+1-555-1234', 'sarah.j@email.com',
      'USPS', 'Standard', 'auto_generated',
      1.2, 30, 20, 15,
      1, 'Box',
      'AWB1234567890ABC', 'TRK2024111401', 'ready'
    );

  INSERT INTO shipping_labels (
    vendor_id, order_id, order_date, product_names, sku, quantity,
    product_weight, product_length, product_width, product_height, product_category,
    vendor_name, pickup_name, pickup_address, pickup_phone, pickup_email,
    pickup_city, pickup_state, pickup_pincode, pickup_country,
    customer_name, shipping_address, shipping_city, shipping_state,
    shipping_pincode, shipping_country, customer_phone, customer_email,
    courier_partner, shipping_method, tracking_preference,
    package_weight, package_length, package_width, package_height,
    number_of_packages, package_type,
    awb_number, tracking_number, status
  ) VALUES
    (
      v_vendor_id, v_order2_id, NOW() - INTERVAL '2 days', 'Smart Fitness Watch', 'SFW-002', 1,
      0.3, 15, 10, 5, 'Electronics',
      'Test Vendor Store', 'John Doe', '123 Business Street, Suite 100', '+1-555-0123', 'john@testvendor.com',
      'New York', 'NY', '10001', 'United States',
      'Michael Chen', '789 Pine Road, Apt 5B', 'Chicago', 'IL',
      '60601', 'United States', '+1-555-5678', 'mchen@email.com',
      'FedEx', 'Express', 'auto_generated',
      0.5, 20, 15, 10,
      1, 'Box',
      'AWB9876543210XYZ', 'TRK2024111402', 'printed'
    );

  INSERT INTO shipping_labels (
    vendor_id, order_id, order_date, product_names, sku, quantity,
    product_weight, product_length, product_width, product_height, product_category,
    vendor_name, pickup_name, pickup_address, pickup_phone, pickup_email,
    pickup_city, pickup_state, pickup_pincode, pickup_country,
    customer_name, shipping_address, shipping_city, shipping_state,
    shipping_pincode, shipping_country, customer_phone, customer_email,
    courier_partner, shipping_method, tracking_preference,
    package_weight, package_length, package_width, package_height,
    number_of_packages, package_type,
    awb_number, tracking_number, status
  ) VALUES
    (
      v_vendor_id, v_order3_id, NOW() - INTERVAL '5 days', 'Leather Laptop Bag', 'LLB-004', 1,
      1.5, 40, 30, 10, 'Accessories',
      'Test Vendor Store', 'John Doe', '123 Business Street, Suite 100', '+1-555-0123', 'john@testvendor.com',
      'New York', 'NY', '10001', 'United States',
      'Emily Davis', '321 Maple Street', 'Austin', 'TX',
      '73301', 'United States', '+1-555-9012', 'emily.d@email.com',
      'DHL', 'Standard', 'auto_generated',
      2.0, 45, 35, 12,
      1, 'Box',
      'AWB5555666677778', 'TRK2024111403', 'printed'
    );

  -- Insert notifications
  INSERT INTO notifications (vendor_id, type, title, message, is_read, action_url)
  VALUES
    (v_vendor_id, 'order', 'New Order Received', 'Order ORD-2024-001 from Sarah Johnson', false, '/orders'),
    (v_vendor_id, 'shipping', 'Shipment Delivered', 'Order ORD-2024-003 has been delivered', false, '/shipping'),
    (v_vendor_id, 'product', 'Low Stock Alert', 'Wireless Bluetooth Headphones is running low on stock', false, '/products'),
    (v_vendor_id, 'payment', 'Payment Received', 'Payment of $279.98 received for Order ORD-2024-002', true, '/finance'),
    (v_vendor_id, 'order', 'Order Shipped', 'Order ORD-2024-002 is now in transit', false, '/orders');

END $$;
