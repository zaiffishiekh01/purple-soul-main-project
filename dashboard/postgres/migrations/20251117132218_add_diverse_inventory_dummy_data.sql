/*
  # Add Diverse Inventory Dummy Data
  
  1. Purpose
    - Add comprehensive inventory test data with various stock statuses
    - Include out-of-stock, low-stock, and in-stock items
    - Provide data for testing search and filter functionality
    
  2. New Data
    - 40+ additional inventory items across multiple vendors
    - Items with different stock levels (out of stock, low stock, high stock)
    - Various warehouse locations
    - Different product categories and SKUs
    - Recent and older restock dates
    
  3. Stock Status Examples
    - Out of Stock: quantity = reserved_quantity
    - Low Stock: available quantity <= low_stock_threshold
    - In Stock: available quantity > low_stock_threshold
*/

-- First, let's get some vendor and product IDs to work with
DO $$
DECLARE
  vendor1_id uuid;
  vendor2_id uuid;
  vendor3_id uuid;
BEGIN
  -- Get existing vendor IDs
  SELECT id INTO vendor1_id FROM vendors LIMIT 1 OFFSET 0;
  SELECT id INTO vendor2_id FROM vendors LIMIT 1 OFFSET 1;
  SELECT id INTO vendor3_id FROM vendors LIMIT 1 OFFSET 2;
  
  -- If we don't have enough vendors, use the first one for all
  IF vendor2_id IS NULL THEN vendor2_id := vendor1_id; END IF;
  IF vendor3_id IS NULL THEN vendor3_id := vendor1_id; END IF;
  
  -- Add OUT OF STOCK items (quantity = reserved)
  INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location, last_restocked_at, updated_at)
  SELECT 
    p.id,
    vendor1_id,
    15,
    15,
    20,
    'WH-A-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - INTERVAL '45 days',
    NOW()
  FROM products p
  WHERE p.vendor_id = vendor1_id
  LIMIT 5
  ON CONFLICT DO NOTHING;
  
  -- Add LOW STOCK items (available = 5-10, threshold = 20)
  INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location, last_restocked_at, updated_at)
  SELECT 
    p.id,
    vendor1_id,
    25,
    17,
    20,
    'WH-B-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - INTERVAL '15 days',
    NOW()
  FROM products p
  WHERE p.vendor_id = vendor1_id
  LIMIT 8
  ON CONFLICT DO NOTHING;
  
  -- Add CRITICAL LOW STOCK items (available = 1-3)
  INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location, last_restocked_at, updated_at)
  SELECT 
    p.id,
    vendor2_id,
    30,
    28,
    25,
    'WH-C-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - INTERVAL '30 days',
    NOW()
  FROM products p
  WHERE p.vendor_id = vendor2_id
  LIMIT 6
  ON CONFLICT DO NOTHING;
  
  -- Add HEALTHY STOCK items (well stocked)
  INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location, last_restocked_at, updated_at)
  SELECT 
    p.id,
    vendor2_id,
    500 + (ROW_NUMBER() OVER() * 50),
    10 + (ROW_NUMBER() OVER() * 2),
    100,
    'WH-D-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - INTERVAL '7 days',
    NOW()
  FROM products p
  WHERE p.vendor_id = vendor2_id
  LIMIT 10
  ON CONFLICT DO NOTHING;
  
  -- Add OVERSTOCKED items (very high inventory)
  INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location, last_restocked_at, updated_at)
  SELECT 
    p.id,
    vendor3_id,
    1000 + (ROW_NUMBER() OVER() * 100),
    50 + (ROW_NUMBER() OVER() * 5),
    150,
    'WH-E-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - INTERVAL '3 days',
    NOW()
  FROM products p
  WHERE p.vendor_id = vendor3_id
  LIMIT 8
  ON CONFLICT DO NOTHING;
  
  -- Add items needing restocking (old restock dates + low stock)
  INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location, last_restocked_at, updated_at)
  SELECT 
    p.id,
    vendor1_id,
    40,
    25,
    30,
    'WH-F-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - INTERVAL '60 days',
    NOW()
  FROM products p
  WHERE p.vendor_id = vendor1_id
  LIMIT 5
  ON CONFLICT DO NOTHING;
  
  -- Add recently restocked items
  INSERT INTO inventory (product_id, vendor_id, quantity, reserved_quantity, low_stock_threshold, warehouse_location, last_restocked_at, updated_at)
  SELECT 
    p.id,
    vendor2_id,
    300 + (ROW_NUMBER() OVER() * 25),
    15 + (ROW_NUMBER() OVER()),
    80,
    'WH-G-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - INTERVAL '1 day',
    NOW()
  FROM products p
  WHERE p.vendor_id = vendor2_id
  LIMIT 7
  ON CONFLICT DO NOTHING;
  
END $$;