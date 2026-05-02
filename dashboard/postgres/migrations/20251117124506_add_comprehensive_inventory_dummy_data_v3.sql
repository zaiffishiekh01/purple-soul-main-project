/*
  # Add Comprehensive Inventory Dummy Data
  
  Adds realistic inventory data across multiple vendors to populate the Inventory Management UI.
  
  ## Data Added
  
  1. **Inventory Items**
     - Multiple products per vendor with varying stock levels
     - Low stock, medium stock, and high stock items
     - Out of stock items
     - Different warehouse locations
     - Realistic quantities and thresholds
  
  This creates a realistic inventory scenario for testing the UI.
*/

DO $$
DECLARE
  v_vendor_ids uuid[];
  v_product_ids uuid[];
  v_vendor_id uuid;
  v_product_id uuid;
  v_count int := 0;
  v_existing_count int;
BEGIN
  -- Get all vendor IDs
  SELECT ARRAY_AGG(id) INTO v_vendor_ids FROM vendors LIMIT 10;
  
  -- Get all product IDs
  SELECT ARRAY_AGG(id) INTO v_product_ids FROM products LIMIT 100;

  -- Exit if no vendors or products
  IF v_vendor_ids IS NULL OR v_product_ids IS NULL THEN
    RAISE NOTICE 'No vendors or products found. Skipping inventory creation.';
    RETURN;
  END IF;

  -- Clear existing inventory to avoid duplicates
  DELETE FROM inventory;

  -- Create inventory items for each vendor
  FOREACH v_vendor_id IN ARRAY v_vendor_ids
  LOOP
    -- High stock items (10-15 items per vendor)
    FOR i IN 1..15 LOOP
      v_product_id := v_product_ids[((v_count + i - 1) % array_length(v_product_ids, 1)) + 1];
      
      INSERT INTO inventory (
        vendor_id,
        product_id,
        quantity,
        reserved_quantity,
        low_stock_threshold,
        warehouse_location,
        last_restocked_at
      ) VALUES (
        v_vendor_id,
        v_product_id,
        500 + (i * 100) + (random() * 200)::int,
        20 + (i * 5) + (random() * 10)::int,
        100,
        'Warehouse-' || chr(65 + ((v_count + i) % 10)) || '-' || LPAD(((v_count + i) % 50 + 1)::text, 2, '0'),
        now() - interval '1 day' * (random() * 7)
      );
    END LOOP;

    -- Medium stock items (15-20 items per vendor)
    FOR i IN 16..35 LOOP
      v_product_id := v_product_ids[((v_count + i - 1) % array_length(v_product_ids, 1)) + 1];
      
      INSERT INTO inventory (
        vendor_id,
        product_id,
        quantity,
        reserved_quantity,
        low_stock_threshold,
        warehouse_location,
        last_restocked_at
      ) VALUES (
        v_vendor_id,
        v_product_id,
        80 + (i * 10) + (random() * 50)::int,
        5 + (i % 10) + (random() * 5)::int,
        50,
        'Warehouse-' || chr(65 + ((v_count + i) % 10)) || '-' || LPAD(((v_count + i) % 50 + 1)::text, 2, '0'),
        now() - interval '1 day' * (3 + random() * 10)
      );
    END LOOP;

    -- Low stock items (10-15 items per vendor, below threshold)
    FOR i IN 36..50 LOOP
      v_product_id := v_product_ids[((v_count + i - 1) % array_length(v_product_ids, 1)) + 1];
      
      INSERT INTO inventory (
        vendor_id,
        product_id,
        quantity,
        reserved_quantity,
        low_stock_threshold,
        warehouse_location,
        last_restocked_at
      ) VALUES (
        v_vendor_id,
        v_product_id,
        5 + (i % 40),
        1 + (i % 5),
        50,
        'Warehouse-' || chr(65 + ((v_count + i) % 10)) || '-' || LPAD(((v_count + i) % 50 + 1)::text, 2, '0'),
        now() - interval '1 day' * (10 + random() * 20)
      );
    END LOOP;

    -- Out of stock items (5 items per vendor)
    FOR i IN 51..55 LOOP
      v_product_id := v_product_ids[((v_count + i - 1) % array_length(v_product_ids, 1)) + 1];
      
      INSERT INTO inventory (
        vendor_id,
        product_id,
        quantity,
        reserved_quantity,
        low_stock_threshold,
        warehouse_location,
        last_restocked_at
      ) VALUES (
        v_vendor_id,
        v_product_id,
        0,
        0,
        50,
        'Warehouse-' || chr(65 + ((v_count + i) % 10)) || '-' || LPAD(((v_count + i) % 50 + 1)::text, 2, '0'),
        now() - interval '1 day' * (20 + random() * 30)
      );
    END LOOP;

    v_count := v_count + 60;
  END LOOP;

  -- Get final count
  SELECT COUNT(*) INTO v_existing_count FROM inventory;
  
  RAISE NOTICE 'Successfully created % inventory items for % vendors', v_existing_count, array_length(v_vendor_ids, 1);

END $$;