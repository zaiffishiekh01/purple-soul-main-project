/*
  # Add Product SKUs and Comprehensive Dummy Data
  
  Updates products with proper SKUs and adds comprehensive dummy data for:
  1. Products with SKUs
  2. Inventory items
  3. Shipping labels with tracking numbers
  
  ## Changes
  
  1. **Products**
     - Add SKUs to existing products
  
  2. **Inventory**
     - Clear and recreate with proper product references
     - Include varied stock levels
  
  3. **Shipping Labels**
     - Add comprehensive shipping label data
     - Include tracking numbers, carriers, costs
*/

-- Update products with SKUs
DO $$
DECLARE
  v_product record;
  v_counter int := 1;
BEGIN
  FOR v_product IN SELECT id, vendor_id, name FROM products WHERE sku IS NULL OR sku = ''
  LOOP
    UPDATE products 
    SET sku = 'SKU-' || SUBSTRING(v_product.vendor_id::text, 1, 8) || '-' || LPAD(v_counter::text, 5, '0')
    WHERE id = v_product.id;
    
    v_counter := v_counter + 1;
  END LOOP;
END $$;

-- Clear and recreate inventory with proper data
DELETE FROM inventory;

DO $$
DECLARE
  v_vendor_id uuid;
  v_product_id uuid;
  v_products_with_vendors record;
  v_counter int := 0;
BEGIN
  -- Create inventory for each product
  FOR v_products_with_vendors IN 
    SELECT p.id as product_id, p.vendor_id, p.sku, p.name
    FROM products p
    ORDER BY p.vendor_id, p.created_at
  LOOP
    v_counter := v_counter + 1;
    
    INSERT INTO inventory (
      vendor_id,
      product_id,
      quantity,
      reserved_quantity,
      low_stock_threshold,
      warehouse_location,
      last_restocked_at
    ) VALUES (
      v_products_with_vendors.vendor_id,
      v_products_with_vendors.product_id,
      CASE 
        WHEN v_counter % 10 = 0 THEN 0  -- Out of stock
        WHEN v_counter % 7 = 0 THEN 15 + (v_counter % 30)  -- Low stock
        WHEN v_counter % 3 = 0 THEN 600 + (v_counter * 50)  -- High stock
        ELSE 100 + (v_counter * 20)  -- Normal stock
      END,
      CASE 
        WHEN v_counter % 10 = 0 THEN 0
        WHEN v_counter % 7 = 0 THEN 2 + (v_counter % 5)
        WHEN v_counter % 3 = 0 THEN 30 + (v_counter % 20)
        ELSE 10 + (v_counter % 15)
      END,
      CASE 
        WHEN v_counter % 3 = 0 THEN 100
        ELSE 50
      END,
      'Warehouse-' || chr(65 + (v_counter % 10)) || '-' || LPAD((v_counter % 50 + 1)::text, 2, '0'),
      CASE 
        WHEN v_counter % 10 = 0 THEN now() - interval '1 day' * (30 + v_counter % 20)
        WHEN v_counter % 7 = 0 THEN now() - interval '1 day' * (10 + v_counter % 15)
        ELSE now() - interval '1 day' * (v_counter % 10)
      END
    );
  END LOOP;
  
  RAISE NOTICE 'Created % inventory items', v_counter;
END $$;

-- Add comprehensive shipping labels dummy data
DO $$
DECLARE
  v_vendor_ids uuid[];
  v_vendor_id uuid;
  v_order_ids uuid[];
  v_order_id uuid;
  v_counter int := 0;
  v_carriers text[] := ARRAY['BlueDart', 'DTDC', 'Delhivery', 'FedEx', 'DHL Express', 'Ecom Express', 'Xpressbees'];
  v_services text[] := ARRAY['Express', 'Standard', 'Economy', 'Premium', 'Same Day', 'Next Day', '2-Day'];
  v_statuses text[] := ARRAY['pending', 'printed', 'picked_up', 'in_transit', 'delivered'];
  v_cities text[] := ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
  v_states text[] := ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Gujarat'];
BEGIN
  -- Get vendor IDs
  SELECT ARRAY_AGG(id) INTO v_vendor_ids FROM vendors LIMIT 10;
  
  -- Get order IDs
  SELECT ARRAY_AGG(id) INTO v_order_ids FROM orders LIMIT 100;
  
  IF v_vendor_ids IS NULL OR v_order_ids IS NULL THEN
    RAISE NOTICE 'No vendors or orders found. Skipping shipping labels creation.';
    RETURN;
  END IF;

  -- Create shipping labels for each vendor
  FOREACH v_vendor_id IN ARRAY v_vendor_ids
  LOOP
    -- Create 15-20 shipping labels per vendor
    FOR i IN 1..20 LOOP
      v_counter := v_counter + 1;
      v_order_id := v_order_ids[((v_counter - 1) % array_length(v_order_ids, 1)) + 1];
      
      INSERT INTO shipping_labels (
        vendor_id,
        order_id,
        order_date,
        product_names,
        sku,
        quantity,
        product_weight,
        product_length,
        product_width,
        product_height,
        product_category,
        
        vendor_name,
        pickup_name,
        pickup_address,
        pickup_phone,
        pickup_email,
        pickup_city,
        pickup_state,
        pickup_pincode,
        pickup_country,
        
        customer_name,
        shipping_address,
        shipping_landmark,
        shipping_city,
        shipping_state,
        shipping_pincode,
        shipping_country,
        customer_phone,
        customer_email,
        
        courier_partner,
        shipping_method,
        tracking_preference,
        pickup_date,
        pickup_slot,
        
        package_weight,
        package_length,
        package_width,
        package_height,
        number_of_packages,
        package_type,
        
        hsn_code,
        hts_code,
        country_of_origin,
        item_description,
        customs_value,
        customs_category,
        invoice_number,
        export_reason,
        
        awb_number,
        tracking_number,
        barcode,
        qr_code,
        routing_code,
        order_barcode,
        
        status,
        label_url,
        printed_at,
        created_at
      ) VALUES (
        v_vendor_id,
        v_order_id,
        now() - interval '1 day' * (v_counter % 30),
        'Product Set ' || v_counter,
        'SKU-' || LPAD(v_counter::text, 6, '0'),
        1 + (v_counter % 5),
        0.5 + (v_counter % 10) * 0.3,
        20 + (v_counter % 30),
        15 + (v_counter % 20),
        10 + (v_counter % 15),
        CASE (v_counter % 5)
          WHEN 0 THEN 'Electronics'
          WHEN 1 THEN 'Clothing'
          WHEN 2 THEN 'Home & Kitchen'
          WHEN 3 THEN 'Books'
          ELSE 'Accessories'
        END,
        
        'Vendor Store ' || v_counter,
        'Pickup Contact ' || v_counter,
        (100 + v_counter) || ' Vendor Street, Building ' || chr(65 + (v_counter % 10)),
        '+91-98765' || LPAD((43200 + v_counter)::text, 5, '0'),
        'vendor' || v_counter || '@example.com',
        v_cities[(v_counter % array_length(v_cities, 1)) + 1],
        v_states[(v_counter % array_length(v_states, 1)) + 1],
        (400000 + (v_counter % 100) * 1000)::text,
        'India',
        
        'Customer ' || chr(65 + (v_counter % 26)) || chr(65 + ((v_counter * 2) % 26)),
        (200 + v_counter * 2) || ' Customer Avenue, Apt ' || (v_counter % 500),
        'Near ' || CASE (v_counter % 4)
          WHEN 0 THEN 'Metro Station'
          WHEN 1 THEN 'Shopping Mall'
          WHEN 2 THEN 'Hospital'
          ELSE 'Market'
        END,
        v_cities[((v_counter + 3) % array_length(v_cities, 1)) + 1],
        v_states[((v_counter + 3) % array_length(v_states, 1)) + 1],
        (500000 + (v_counter % 100) * 1500)::text,
        'India',
        '+91-98700' || LPAD((10000 + v_counter)::text, 5, '0'),
        'customer' || v_counter || '@example.com',
        
        v_carriers[(v_counter % array_length(v_carriers, 1)) + 1],
        v_services[(v_counter % array_length(v_services, 1)) + 1],
        CASE WHEN v_counter % 3 = 0 THEN 'email' ELSE 'sms' END,
        CASE 
          WHEN v_counter % 5 = 0 THEN NULL
          ELSE (now() + interval '1 day' * (1 + v_counter % 5))::date
        END,
        CASE (v_counter % 3)
          WHEN 0 THEN '9AM-12PM'
          WHEN 1 THEN '12PM-3PM'
          ELSE '3PM-6PM'
        END,
        
        0.5 + (v_counter % 10) * 0.3,
        25 + (v_counter % 30),
        20 + (v_counter % 20),
        15 + (v_counter % 15),
        1,
        CASE (v_counter % 3)
          WHEN 0 THEN 'Box'
          WHEN 1 THEN 'Envelope'
          ELSE 'Bag'
        END,
        
        '8471' || (3000 + v_counter % 1000),
        '8471.' || (30 + v_counter % 70) || '.' || (10 + v_counter % 90),
        'India',
        'General merchandise item ' || v_counter,
        (500 + v_counter * 50)::numeric,
        CASE (v_counter % 4)
          WHEN 0 THEN 'Gift'
          WHEN 1 THEN 'Sample'
          WHEN 2 THEN 'Commercial'
          ELSE 'Return'
        END,
        'INV-' || (100000 + v_counter),
        'Sale',
        
        'AWB' || LPAD(v_counter::text, 12, '0'),
        'TRK' || UPPER(substr(md5(random()::text), 1, 12)) || LPAD(v_counter::text, 4, '0'),
        'BAR' || LPAD(v_counter::text, 15, '0'),
        'QR' || LPAD(v_counter::text, 16, '0'),
        'RTE-' || chr(65 + (v_counter % 10)) || LPAD((v_counter % 1000)::text, 4, '0'),
        'ORD' || LPAD(v_counter::text, 12, '0'),
        
        v_statuses[(v_counter % array_length(v_statuses, 1)) + 1],
        'https://labels.example.com/' || v_counter || '.pdf',
        CASE 
          WHEN v_counter % 5 = 0 THEN NULL
          ELSE now() - interval '1 hour' * (v_counter % 48)
        END,
        now() - interval '1 day' * (v_counter % 30)
      );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Created % shipping labels', v_counter;
END $$;