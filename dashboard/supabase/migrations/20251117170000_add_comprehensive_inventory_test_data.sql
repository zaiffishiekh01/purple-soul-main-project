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
  product_id UUID;
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

  -- =====================================================
  -- VENDOR 1 - COMPREHENSIVE INVENTORY TEST DATA
  -- =====================================================

  -- IN STOCK ITEMS (Healthy Inventory - 8 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, gen_random_uuid(), 'Wireless Bluetooth Headphones', 'SKU-TEST-V1-001',
   250, 15, 50, 'A1-SHELF-02', NOW() - INTERVAL '5 days', NOW() - INTERVAL '30 days'),

  (vendor1_id, gen_random_uuid(), 'USB-C Charging Cable 6ft', 'SKU-TEST-V1-002',
   500, 32, 100, 'A2-SHELF-01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '45 days'),

  (vendor1_id, gen_random_uuid(), 'Laptop Stand Adjustable', 'SKU-TEST-V1-003',
   150, 8, 30, 'B1-SHELF-03', NOW() - INTERVAL '10 days', NOW() - INTERVAL '60 days'),

  (vendor1_id, gen_random_uuid(), 'Wireless Mouse Ergonomic', 'SKU-TEST-V1-004',
   320, 25, 60, 'A1-SHELF-05', NOW() - INTERVAL '3 days', NOW() - INTERVAL '20 days'),

  (vendor1_id, gen_random_uuid(), 'Mechanical Keyboard RGB', 'SKU-TEST-V1-005',
   180, 12, 40, 'B2-SHELF-01', NOW() - INTERVAL '7 days', NOW() - INTERVAL '35 days'),

  (vendor1_id, gen_random_uuid(), 'Phone Case Premium Leather', 'SKU-TEST-V1-006',
   400, 28, 80, 'C1-SHELF-02', NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 days'),

  (vendor1_id, gen_random_uuid(), 'Screen Protector Tempered Glass', 'SKU-TEST-V1-007',
   600, 45, 120, 'C2-SHELF-01', NOW() - INTERVAL '4 days', NOW() - INTERVAL '25 days'),

  (vendor1_id, gen_random_uuid(), 'Portable Power Bank 20000mAh', 'SKU-TEST-V1-008',
   220, 18, 50, 'A3-SHELF-04', NOW() - INTERVAL '6 days', NOW() - INTERVAL '40 days');

  -- LOW STOCK ITEMS (Warning Alerts - 5 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, gen_random_uuid(), 'Smartwatch Fitness Tracker', 'SKU-TEST-V1-009',
   15, 5, 50, 'B1-SHELF-01', NOW() - INTERVAL '20 days', NOW() - INTERVAL '50 days'),

  (vendor1_id, gen_random_uuid(), 'Bluetooth Speaker Waterproof', 'SKU-TEST-V1-010',
   8, 3, 30, 'A2-SHELF-04', NOW() - INTERVAL '25 days', NOW() - INTERVAL '55 days'),

  (vendor1_id, gen_random_uuid(), 'Wireless Earbuds Pro', 'SKU-TEST-V1-011',
   12, 7, 40, 'B3-SHELF-02', NOW() - INTERVAL '18 days', NOW() - INTERVAL '48 days'),

  (vendor1_id, gen_random_uuid(), 'Gaming Mouse Pad XXL', 'SKU-TEST-V1-012',
   20, 4, 60, 'C1-SHELF-03', NOW() - INTERVAL '30 days', NOW() - INTERVAL '60 days'),

  (vendor1_id, gen_random_uuid(), 'Webcam 1080p HD', 'SKU-TEST-V1-013',
   5, 2, 25, 'A1-SHELF-03', NOW() - INTERVAL '35 days', NOW() - INTERVAL '65 days');

  -- OUT OF STOCK ITEMS (Critical Alerts - 4 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, gen_random_uuid(), 'USB Hub 7-Port', 'SKU-TEST-V1-014',
   0, 0, 30, 'B2-SHELF-04', NOW() - INTERVAL '45 days', NOW() - INTERVAL '75 days'),

  (vendor1_id, gen_random_uuid(), 'HDMI Cable 10ft 4K', 'SKU-TEST-V1-015',
   0, 0, 50, 'C2-SHELF-03', NOW() - INTERVAL '40 days', NOW() - INTERVAL '70 days'),

  (vendor1_id, gen_random_uuid(), 'SD Card 128GB', 'SKU-TEST-V1-016',
   0, 0, 40, 'A3-SHELF-01', NOW() - INTERVAL '50 days', NOW() - INTERVAL '80 days'),

  (vendor1_id, gen_random_uuid(), 'Phone Tripod Flexible', 'SKU-TEST-V1-017',
   0, 0, 20, 'B1-SHELF-05', NOW() - INTERVAL '55 days', NOW() - INTERVAL '85 days');

  -- HIGH RESERVED QUANTITY ITEMS (Orders in Process - 3 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (vendor1_id, gen_random_uuid(), 'Laptop Sleeve 15 inch', 'SKU-TEST-V1-018',
   100, 65, 30, 'C1-SHELF-01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '22 days'),

  (vendor1_id, gen_random_uuid(), 'Monitor Stand Dual', 'SKU-TEST-V1-019',
   80, 42, 25, 'B2-SHELF-02', NOW() - INTERVAL '8 days', NOW() - INTERVAL '38 days'),

  (vendor1_id, gen_random_uuid(), 'Desk Organizer Multi-Compartment', 'SKU-TEST-V1-020',
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
  (new_vendor_id, gen_random_uuid(), 'Yoga Mat Premium Non-Slip', 'SKU-TEST-V2-001',
   300, 20, 60, 'A1-BIN-01', NOW() - INTERVAL '3 days', NOW() - INTERVAL '28 days'),

  (new_vendor_id, gen_random_uuid(), 'Resistance Bands Set of 5', 'SKU-TEST-V2-002',
   450, 35, 90, 'A2-BIN-02', NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 days'),

  (new_vendor_id, gen_random_uuid(), 'Dumbbells Pair 20lb', 'SKU-TEST-V2-003',
   200, 15, 50, 'B1-RACK-01', NOW() - INTERVAL '7 days', NOW() - INTERVAL '42 days'),

  (new_vendor_id, gen_random_uuid(), 'Water Bottle Insulated 32oz', 'SKU-TEST-V2-004',
   500, 40, 100, 'C1-SHELF-01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '18 days'),

  (new_vendor_id, gen_random_uuid(), 'Foam Roller Muscle Recovery', 'SKU-TEST-V2-005',
   180, 12, 40, 'A3-BIN-03', NOW() - INTERVAL '9 days', NOW() - INTERVAL '45 days'),

  (new_vendor_id, gen_random_uuid(), 'Jump Rope Speed Training', 'SKU-TEST-V2-006',
   350, 28, 70, 'B2-BIN-01', NOW() - INTERVAL '4 days', NOW() - INTERVAL '30 days'),

  (new_vendor_id, gen_random_uuid(), 'Yoga Block Set of 2', 'SKU-TEST-V2-007',
   280, 22, 60, 'C2-SHELF-02', NOW() - INTERVAL '6 days', NOW() - INTERVAL '38 days'),

  (new_vendor_id, gen_random_uuid(), 'Exercise Ball 65cm', 'SKU-TEST-V2-008',
   150, 10, 35, 'A1-RACK-02', NOW() - INTERVAL '11 days', NOW() - INTERVAL '52 days');

  -- LOW STOCK ITEMS (5 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (new_vendor_id, gen_random_uuid(), 'Protein Shaker Bottle', 'SKU-TEST-V2-009',
   18, 6, 50, 'B1-BIN-02', NOW() - INTERVAL '22 days', NOW() - INTERVAL '58 days'),

  (new_vendor_id, gen_random_uuid(), 'Ankle Weights 5lb Pair', 'SKU-TEST-V2-010',
   10, 4, 30, 'A2-RACK-01', NOW() - INTERVAL '28 days', NOW() - INTERVAL '62 days'),

  (new_vendor_id, gen_random_uuid(), 'Pull Up Bar Doorway', 'SKU-TEST-V2-011',
   14, 5, 40, 'C1-RACK-02', NOW() - INTERVAL '24 days', NOW() - INTERVAL '60 days'),

  (new_vendor_id, gen_random_uuid(), 'Ab Roller Wheel', 'SKU-TEST-V2-012',
   22, 8, 50, 'B2-BIN-03', NOW() - INTERVAL '32 days', NOW() - INTERVAL '68 days'),

  (new_vendor_id, gen_random_uuid(), 'Gym Towel Microfiber', 'SKU-TEST-V2-013',
   8, 3, 25, 'A3-SHELF-01', NOW() - INTERVAL '38 days', NOW() - INTERVAL '72 days');

  -- OUT OF STOCK ITEMS (3 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (new_vendor_id, gen_random_uuid(), 'Kettlebell 25lb', 'SKU-TEST-V2-014',
   0, 0, 30, 'B1-RACK-03', NOW() - INTERVAL '48 days', NOW() - INTERVAL '82 days'),

  (new_vendor_id, gen_random_uuid(), 'Balance Board Wooden', 'SKU-TEST-V2-015',
   0, 0, 20, 'C2-BIN-01', NOW() - INTERVAL '52 days', NOW() - INTERVAL '86 days'),

  (new_vendor_id, gen_random_uuid(), 'Massage Ball Set', 'SKU-TEST-V2-016',
   0, 0, 40, 'A1-BIN-04', NOW() - INTERVAL '44 days', NOW() - INTERVAL '78 days');

  -- HIGH RESERVED QUANTITY ITEMS (4 items)
  INSERT INTO inventory (
    vendor_id, product_id, product_name, sku,
    quantity, reserved_quantity, low_stock_threshold,
    warehouse_location, last_restocked_at, created_at
  ) VALUES
  (new_vendor_id, gen_random_uuid(), 'Workout Gloves Medium', 'SKU-TEST-V2-017',
   120, 75, 35, 'B2-SHELF-01', NOW() - INTERVAL '3 days', NOW() - INTERVAL '25 days'),

  (new_vendor_id, gen_random_uuid(), 'Sports Bra Compression', 'SKU-TEST-V2-018',
   200, 110, 50, 'C1-BIN-02', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 days'),

  (new_vendor_id, gen_random_uuid(), 'Running Shorts Athletic', 'SKU-TEST-V2-019',
   180, 95, 45, 'A2-SHELF-03', NOW() - INTERVAL '5 days', NOW() - INTERVAL '32 days'),

  (new_vendor_id, gen_random_uuid(), 'Compression Socks Pair', 'SKU-TEST-V2-020',
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
