/*
  # Add Comprehensive Inventory Test Data

  This migration creates diverse inventory records for testing all inventory features
  including stock levels, warehouse locations, reserved quantities, and alerts.

  ## Inventory Scenarios Covered
  1. **In Stock** - Normal healthy inventory levels
  2. **Low Stock** - Items at or below threshold (alerts needed)
  3. **Out of Stock** - Zero quantity (critical alerts)
  4. **Reserved Stock** - Items with pending orders
  5. **Multiple Warehouses** - Different storage locations
  6. **Recent Restocks** - Various restock timestamps

  ## Test Data Distribution Per Vendor
  - 8-10 In Stock items (healthy)
  - 5-6 Low Stock items (warning alerts)
  - 3-4 Out of Stock items (critical alerts)
  - Various reserved quantities (orders in process)
  - Different warehouse locations (A1-A5, B1-B5, etc.)

  Total: ~20 inventory items per vendor for comprehensive testing
*/

-- Clean existing inventory test data
DELETE FROM inventory WHERE sku LIKE 'SKU-TEST-%';

-- Get vendor IDs for test data
DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  vendor3_id UUID;
  new_vendor_id UUID;
BEGIN
  -- Get existing vendor IDs
  SELECT id INTO vendor1_id FROM vendors WHERE business_name LIKE '%Demo Vendor 1%' OR business_name = 'Artisan Crafts Co' LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors WHERE business_name LIKE '%Demo Vendor 2%' LIMIT 1;
  SELECT id INTO vendor3_id FROM vendors WHERE business_name LIKE '%Demo Vendor 3%' LIMIT 1;
  SELECT id INTO new_vendor_id FROM vendors WHERE contact_email = 'fk.envca@gmail.com' LIMIT 1;

  -- Ensure vendors exist
  IF vendor1_id IS NULL THEN
    INSERT INTO vendors (user_id, business_name, contact_email, phone, status, commission_rate)
    VALUES (gen_random_uuid(), 'Demo Vendor 1', 'vendor1@test.com', '+1-555-0101', 'active', 6.5)
    RETURNING id INTO vendor1_id;
  END IF;

  IF vendor2_id IS NULL THEN
    INSERT INTO vendors (user_id, business_name, contact_email, phone, status, commission_rate)
    VALUES (gen_random_uuid(), 'Demo Vendor 2', 'vendor2@test.com', '+1-555-0102', 'active', 6.3)
    RETURNING id INTO vendor2_id;
  END IF;

  IF vendor3_id IS NULL THEN
    INSERT INTO vendors (user_id, business_name, contact_email, phone, status, commission_rate)
    VALUES (gen_random_uuid(), 'Demo Vendor 3', 'vendor3@test.com', '+1-555-0103', 'active', 9.0)
    RETURNING id INTO vendor3_id;
  END IF;

  IF new_vendor_id IS NULL THEN
    INSERT INTO vendors (user_id, business_name, contact_email, phone, status, commission_rate)
    VALUES (gen_random_uuid(), 'New Vendor', 'fk.envca@gmail.com', '+1-555-0199', 'active', 7.0)
    RETURNING id INTO new_vendor_id;
  END IF;

  -- Real product rows so inventory.product_id satisfies FK to products(id)
  DELETE FROM products WHERE sku LIKE 'SKU-TEST-%';

  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status) VALUES
  (vendor1_id, 'Wireless Bluetooth Headphones', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-001', 99.99, 40.00, 'active'),
  (vendor1_id, 'USB-C Charging Cable 6ft', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-002', 14.99, 5.00, 'active'),
  (vendor1_id, 'Laptop Stand Adjustable', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-003', 45.00, 18.00, 'active'),
  (vendor1_id, 'Wireless Mouse Ergonomic', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-004', 35.00, 12.00, 'active'),
  (vendor1_id, 'Mechanical Keyboard RGB', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-005', 129.99, 55.00, 'active'),
  (vendor1_id, 'Phone Case Premium Leather', 'Inventory test seed', 'Accessories', 'SKU-TEST-V1-006', 24.99, 8.00, 'active'),
  (vendor1_id, 'Screen Protector Tempered Glass', 'Inventory test seed', 'Accessories', 'SKU-TEST-V1-007', 12.99, 3.00, 'active'),
  (vendor1_id, 'Portable Power Bank 20000mAh', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-008', 59.99, 22.00, 'active'),
  (vendor1_id, 'Smartwatch Fitness Tracker', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-009', 199.99, 80.00, 'active'),
  (vendor1_id, 'Bluetooth Speaker Waterproof', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-010', 79.99, 30.00, 'active'),
  (vendor1_id, 'Wireless Earbuds Pro', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-011', 149.99, 60.00, 'active'),
  (vendor1_id, 'Gaming Mouse Pad XXL', 'Inventory test seed', 'Accessories', 'SKU-TEST-V1-012', 29.99, 10.00, 'active'),
  (vendor1_id, 'Webcam 1080p HD', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-013', 89.99, 35.00, 'active'),
  (vendor1_id, 'USB Hub 7-Port', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-014', 39.99, 15.00, 'active'),
  (vendor1_id, 'HDMI Cable 10ft 4K', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-015', 19.99, 6.00, 'active'),
  (vendor1_id, 'SD Card 128GB', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-016', 24.99, 8.00, 'active'),
  (vendor1_id, 'Phone Tripod Flexible', 'Inventory test seed', 'Accessories', 'SKU-TEST-V1-017', 34.99, 12.00, 'active'),
  (vendor1_id, 'Laptop Sleeve 15 inch', 'Inventory test seed', 'Accessories', 'SKU-TEST-V1-018', 42.00, 15.00, 'active'),
  (vendor1_id, 'Monitor Stand Dual', 'Inventory test seed', 'Electronics', 'SKU-TEST-V1-019', 69.99, 28.00, 'active'),
  (vendor1_id, 'Desk Organizer Multi-Compartment', 'Inventory test seed', 'Office', 'SKU-TEST-V1-020', 27.99, 9.00, 'active');

  INSERT INTO products (vendor_id, name, description, category, sku, price, cost, status) VALUES
  (new_vendor_id, 'Yoga Mat Premium Non-Slip', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-001', 39.99, 14.00, 'active'),
  (new_vendor_id, 'Resistance Bands Set of 5', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-002', 24.99, 8.00, 'active'),
  (new_vendor_id, 'Dumbbells Pair 20lb', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-003', 59.99, 25.00, 'active'),
  (new_vendor_id, 'Water Bottle Insulated 32oz', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-004', 22.99, 7.00, 'active'),
  (new_vendor_id, 'Foam Roller Muscle Recovery', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-005', 34.99, 11.00, 'active'),
  (new_vendor_id, 'Jump Rope Speed Training', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-006', 15.99, 5.00, 'active'),
  (new_vendor_id, 'Yoga Block Set of 2', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-007', 18.99, 6.00, 'active'),
  (new_vendor_id, 'Exercise Ball 65cm', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-008', 29.99, 10.00, 'active'),
  (new_vendor_id, 'Protein Shaker Bottle', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-009', 12.99, 4.00, 'active'),
  (new_vendor_id, 'Ankle Weights 5lb Pair', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-010', 21.99, 7.00, 'active'),
  (new_vendor_id, 'Pull Up Bar Doorway', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-011', 44.99, 16.00, 'active'),
  (new_vendor_id, 'Ab Roller Wheel', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-012', 27.99, 9.00, 'active'),
  (new_vendor_id, 'Gym Towel Microfiber', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-013', 9.99, 3.00, 'active'),
  (new_vendor_id, 'Kettlebell 25lb', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-014', 54.99, 22.00, 'active'),
  (new_vendor_id, 'Balance Board Wooden', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-015', 39.99, 14.00, 'active'),
  (new_vendor_id, 'Massage Ball Set', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-016', 16.99, 5.00, 'active'),
  (new_vendor_id, 'Workout Gloves Medium', 'Inventory test seed', 'Sports', 'SKU-TEST-V2-017', 19.99, 6.00, 'active'),
  (new_vendor_id, 'Sports Bra Compression', 'Inventory test seed', 'Apparel', 'SKU-TEST-V2-018', 34.99, 12.00, 'active'),
  (new_vendor_id, 'Running Shorts Athletic', 'Inventory test seed', 'Apparel', 'SKU-TEST-V2-019', 28.99, 10.00, 'active'),
  (new_vendor_id, 'Compression Socks Pair', 'Inventory test seed', 'Apparel', 'SKU-TEST-V2-020', 14.99, 5.00, 'active');

  -- =====================================================
  -- VENDOR 1 - COMPREHENSIVE INVENTORY TEST DATA
  -- =====================================================

  -- IN STOCK ITEMS (Healthy Inventory - 8 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-001' LIMIT 1), 'Wireless Bluetooth Headphones', 'SKU-TEST-V1-001',
   250, 15, 50, 'A1-SHELF-02', NOW() - INTERVAL '5 days', NOW() - INTERVAL '30 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-002' LIMIT 1), 'USB-C Charging Cable 6ft', 'SKU-TEST-V1-002',
   500, 32, 100, 'A2-SHELF-01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '45 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-003' LIMIT 1), 'Laptop Stand Adjustable', 'SKU-TEST-V1-003',
   150, 8, 30, 'B1-SHELF-03', NOW() - INTERVAL '10 days', NOW() - INTERVAL '60 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-004' LIMIT 1), 'Wireless Mouse Ergonomic', 'SKU-TEST-V1-004',
   320, 25, 60, 'A1-SHELF-05', NOW() - INTERVAL '3 days', NOW() - INTERVAL '20 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-005' LIMIT 1), 'Mechanical Keyboard RGB', 'SKU-TEST-V1-005',
   180, 12, 40, 'B2-SHELF-01', NOW() - INTERVAL '7 days', NOW() - INTERVAL '35 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-006' LIMIT 1), 'Phone Case Premium Leather', 'SKU-TEST-V1-006',
   400, 28, 80, 'C1-SHELF-02', NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-007' LIMIT 1), 'Screen Protector Tempered Glass', 'SKU-TEST-V1-007',
   600, 45, 120, 'C2-SHELF-01', NOW() - INTERVAL '4 days', NOW() - INTERVAL '25 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-008' LIMIT 1), 'Portable Power Bank 20000mAh', 'SKU-TEST-V1-008',
   220, 18, 50, 'A3-SHELF-04', NOW() - INTERVAL '6 days', NOW() - INTERVAL '40 days');

  -- LOW STOCK ITEMS (Warning Alerts - 5 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-009' LIMIT 1), 'Smartwatch Fitness Tracker', 'SKU-TEST-V1-009',
   15, 5, 50, 'B1-SHELF-01', NOW() - INTERVAL '20 days', NOW() - INTERVAL '50 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-010' LIMIT 1), 'Bluetooth Speaker Waterproof', 'SKU-TEST-V1-010',
   8, 3, 30, 'A2-SHELF-04', NOW() - INTERVAL '25 days', NOW() - INTERVAL '55 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-011' LIMIT 1), 'Wireless Earbuds Pro', 'SKU-TEST-V1-011',
   12, 7, 40, 'B3-SHELF-02', NOW() - INTERVAL '18 days', NOW() - INTERVAL '48 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-012' LIMIT 1), 'Gaming Mouse Pad XXL', 'SKU-TEST-V1-012',
   20, 4, 60, 'C1-SHELF-03', NOW() - INTERVAL '30 days', NOW() - INTERVAL '60 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-013' LIMIT 1), 'Webcam 1080p HD', 'SKU-TEST-V1-013',
   5, 2, 25, 'A1-SHELF-03', NOW() - INTERVAL '35 days', NOW() - INTERVAL '65 days');

  -- OUT OF STOCK ITEMS (Critical Alerts - 4 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-014' LIMIT 1), 'USB Hub 7-Port', 'SKU-TEST-V1-014',
   0, 0, 30, 'B2-SHELF-04', NOW() - INTERVAL '45 days', NOW() - INTERVAL '75 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-015' LIMIT 1), 'HDMI Cable 10ft 4K', 'SKU-TEST-V1-015',
   0, 0, 50, 'C2-SHELF-03', NOW() - INTERVAL '40 days', NOW() - INTERVAL '70 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-016' LIMIT 1), 'SD Card 128GB', 'SKU-TEST-V1-016',
   0, 0, 40, 'A3-SHELF-01', NOW() - INTERVAL '50 days', NOW() - INTERVAL '80 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-017' LIMIT 1), 'Phone Tripod Flexible', 'SKU-TEST-V1-017',
   0, 0, 20, 'B1-SHELF-05', NOW() - INTERVAL '55 days', NOW() - INTERVAL '85 days');

  -- HIGH RESERVED QUANTITY ITEMS (Orders in Process - 3 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-018' LIMIT 1), 'Laptop Sleeve 15 inch', 'SKU-TEST-V1-018',
   100, 65, 30, 'C1-SHELF-01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '22 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-019' LIMIT 1), 'Monitor Stand Dual', 'SKU-TEST-V1-019',
   80, 42, 25, 'B2-SHELF-02', NOW() - INTERVAL '8 days', NOW() - INTERVAL '38 days'),

  (vendor1_id, (SELECT id FROM products WHERE vendor_id = vendor1_id AND sku = 'SKU-TEST-V1-020' LIMIT 1), 'Desk Organizer Multi-Compartment', 'SKU-TEST-V1-020',
   120, 55, 40, 'A2-SHELF-05', NOW() - INTERVAL '5 days', NOW() - INTERVAL '35 days');

  -- =====================================================
  -- NEW VENDOR - COMPREHENSIVE INVENTORY TEST DATA
  -- =====================================================

  -- IN STOCK ITEMS (8 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-001' LIMIT 1), 'Yoga Mat Premium Non-Slip', 'SKU-TEST-V2-001',
   300, 20, 60, 'A1-BIN-01', NOW() - INTERVAL '3 days', NOW() - INTERVAL '28 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-002' LIMIT 1), 'Resistance Bands Set of 5', 'SKU-TEST-V2-002',
   450, 35, 90, 'A2-BIN-02', NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-003' LIMIT 1), 'Dumbbells Pair 20lb', 'SKU-TEST-V2-003',
   200, 15, 50, 'B1-RACK-01', NOW() - INTERVAL '7 days', NOW() - INTERVAL '42 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-004' LIMIT 1), 'Water Bottle Insulated 32oz', 'SKU-TEST-V2-004',
   500, 40, 100, 'C1-SHELF-01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '18 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-005' LIMIT 1), 'Foam Roller Muscle Recovery', 'SKU-TEST-V2-005',
   180, 12, 40, 'A3-BIN-03', NOW() - INTERVAL '9 days', NOW() - INTERVAL '45 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-006' LIMIT 1), 'Jump Rope Speed Training', 'SKU-TEST-V2-006',
   350, 28, 70, 'B2-BIN-01', NOW() - INTERVAL '4 days', NOW() - INTERVAL '30 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-007' LIMIT 1), 'Yoga Block Set of 2', 'SKU-TEST-V2-007',
   280, 22, 60, 'C2-SHELF-02', NOW() - INTERVAL '6 days', NOW() - INTERVAL '38 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-008' LIMIT 1), 'Exercise Ball 65cm', 'SKU-TEST-V2-008',
   150, 10, 35, 'A1-RACK-02', NOW() - INTERVAL '11 days', NOW() - INTERVAL '52 days');

  -- LOW STOCK ITEMS (5 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-009' LIMIT 1), 'Protein Shaker Bottle', 'SKU-TEST-V2-009',
   18, 6, 50, 'B1-BIN-02', NOW() - INTERVAL '22 days', NOW() - INTERVAL '58 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-010' LIMIT 1), 'Ankle Weights 5lb Pair', 'SKU-TEST-V2-010',
   10, 4, 30, 'A2-RACK-01', NOW() - INTERVAL '28 days', NOW() - INTERVAL '62 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-011' LIMIT 1), 'Pull Up Bar Doorway', 'SKU-TEST-V2-011',
   14, 5, 40, 'C1-RACK-02', NOW() - INTERVAL '24 days', NOW() - INTERVAL '60 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-012' LIMIT 1), 'Ab Roller Wheel', 'SKU-TEST-V2-012',
   22, 8, 50, 'B2-BIN-03', NOW() - INTERVAL '32 days', NOW() - INTERVAL '68 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-013' LIMIT 1), 'Gym Towel Microfiber', 'SKU-TEST-V2-013',
   8, 3, 25, 'A3-SHELF-01', NOW() - INTERVAL '38 days', NOW() - INTERVAL '72 days');

  -- OUT OF STOCK ITEMS (3 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-014' LIMIT 1), 'Kettlebell 25lb', 'SKU-TEST-V2-014',
   0, 0, 30, 'B1-RACK-03', NOW() - INTERVAL '48 days', NOW() - INTERVAL '82 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-015' LIMIT 1), 'Balance Board Wooden', 'SKU-TEST-V2-015',
   0, 0, 20, 'C2-BIN-01', NOW() - INTERVAL '52 days', NOW() - INTERVAL '86 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-016' LIMIT 1), 'Massage Ball Set', 'SKU-TEST-V2-016',
   0, 0, 40, 'A1-BIN-04', NOW() - INTERVAL '44 days', NOW() - INTERVAL '78 days');

  -- HIGH RESERVED QUANTITY ITEMS (4 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-017' LIMIT 1), 'Workout Gloves Medium', 'SKU-TEST-V2-017',
   120, 75, 35, 'B2-SHELF-01', NOW() - INTERVAL '3 days', NOW() - INTERVAL '25 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-018' LIMIT 1), 'Sports Bra Compression', 'SKU-TEST-V2-018',
   200, 110, 50, 'C1-BIN-02', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-019' LIMIT 1), 'Running Shorts Athletic', 'SKU-TEST-V2-019',
   180, 95, 45, 'A2-SHELF-03', NOW() - INTERVAL '5 days', NOW() - INTERVAL '32 days'),

  (new_vendor_id, (SELECT id FROM products WHERE vendor_id = new_vendor_id AND sku = 'SKU-TEST-V2-020' LIMIT 1), 'Compression Socks Pair', 'SKU-TEST-V2-020',
   250, 130, 60, 'B1-SHELF-04', NOW() - INTERVAL '2 days', NOW() - INTERVAL '20 days');

  RAISE NOTICE 'Inventory test data created successfully for all vendors!';

END $$;

-- Create helpful indexes for inventory queries
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_quantity ON inventory(vendor_id, quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(vendor_id, quantity, low_stock_threshold)
  WHERE quantity <= low_stock_threshold;
CREATE INDEX IF NOT EXISTS idx_inventory_out_of_stock ON inventory(vendor_id, quantity)
  WHERE quantity = 0;
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(vendor_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON inventory(vendor_id, product_name);

-- Add helpful comments
COMMENT ON TABLE inventory IS 'Vendor product inventory tracking with stock levels and locations';
COMMENT ON COLUMN inventory.quantity IS 'Current available quantity in stock';
COMMENT ON COLUMN inventory.reserved_quantity IS 'Quantity reserved for pending orders';
COMMENT ON COLUMN inventory.low_stock_threshold IS 'Minimum quantity before low stock alert';
COMMENT ON COLUMN inventory.warehouse_location IS 'Physical location in warehouse (e.g., A1-SHELF-02)';
COMMENT ON COLUMN inventory.last_restocked_at IS 'Last time inventory was replenished';
