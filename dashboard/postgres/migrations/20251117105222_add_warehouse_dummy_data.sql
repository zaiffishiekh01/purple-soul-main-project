/*
  # Add US Warehouse Request Test Data
  
  1. Purpose
    - Add comprehensive test data for warehouse requests
    - Include various statuses (pending, approved, rejected, active)
    - Link to existing vendors from test data
    - Demonstrate the complete workflow
  
  2. Data Added
    - 6 warehouse requests with different statuses
    - Mix of request types (SEASONAL, YEAR_ROUND, TRIAL)
    - Various inventory values and SKU counts
    - Some approved with warehouse details, some pending, some rejected
*/

-- Add warehouse requests for testing
DO $$
DECLARE
  vendor1_id uuid;
  vendor2_id uuid;
  vendor3_id uuid;
  vendor4_id uuid;
  admin1_id uuid;
BEGIN
  -- Get vendor IDs
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 1' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at ASC LIMIT 1)
  ) INTO vendor1_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at ASC LIMIT 1)
  ) INTO vendor2_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at ASC LIMIT 1)
  ) INTO vendor3_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 4' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at ASC LIMIT 1)
  ) INTO vendor4_id;
  
  -- Get an admin user ID for reviewed requests
  SELECT id INTO admin1_id FROM admin_users LIMIT 1;

  -- Insert warehouse requests
  
  -- 1. PENDING - Recent seasonal request from Vendor 1
  INSERT INTO warehouse_requests (
    vendor_id,
    request_type,
    expected_inventory_value,
    expected_sku_count,
    product_categories,
    estimated_arrival_date,
    campaign_duration_months,
    shipping_acknowledgment,
    vendor_notes,
    status,
    created_at
  ) VALUES (
    vendor1_id,
    'SEASONAL',
    15000.00,
    75,
    ARRAY['Winter Clothing', 'Accessories', 'Scarves'],
    CURRENT_DATE + INTERVAL '10 days',
    6,
    true,
    'Winter collection for Q4 season. Looking to store inventory closer to US customers for faster shipping.',
    'pending',
    NOW() - INTERVAL '2 days'
  );

  -- 2. PENDING - Year-round request from Vendor 2
  INSERT INTO warehouse_requests (
    vendor_id,
    request_type,
    expected_inventory_value,
    expected_sku_count,
    product_categories,
    estimated_arrival_date,
    campaign_duration_months,
    shipping_acknowledgment,
    vendor_notes,
    special_requirements,
    status,
    created_at
  ) VALUES (
    vendor2_id,
    'YEAR_ROUND',
    25000.00,
    120,
    ARRAY['Home Decor', 'Furniture', 'Lighting'],
    CURRENT_DATE + INTERVAL '3 weeks',
    12,
    true,
    'Expanding to US market. Need long-term storage solution.',
    'Some items are fragile and require careful handling',
    'pending',
    NOW() - INTERVAL '1 day'
  );

  -- 3. PENDING - Trial period request from Vendor 3
  INSERT INTO warehouse_requests (
    vendor_id,
    request_type,
    expected_inventory_value,
    expected_sku_count,
    product_categories,
    estimated_arrival_date,
    campaign_duration_months,
    shipping_acknowledgment,
    vendor_notes,
    status,
    created_at
  ) VALUES (
    vendor3_id,
    'TRIAL',
    8000.00,
    40,
    ARRAY['Handicrafts', 'Art', 'Decorative Items'],
    CURRENT_DATE + INTERVAL '2 weeks',
    3,
    true,
    'First time using US warehouse. Want to test with smaller inventory before expanding.',
    'pending',
    NOW() - INTERVAL '12 hours'
  );

  -- 4. APPROVED - Active seasonal program for Vendor 4
  INSERT INTO warehouse_requests (
    vendor_id,
    request_type,
    expected_inventory_value,
    expected_sku_count,
    product_categories,
    estimated_arrival_date,
    campaign_duration_months,
    shipping_acknowledgment,
    status,
    reviewed_by_admin_id,
    reviewed_at,
    warehouse_address,
    warehouse_contact_email,
    warehouse_contact_phone,
    arrival_deadline,
    program_end_date,
    admin_notes,
    vendor_notes,
    created_at
  ) VALUES (
    vendor4_id,
    'SEASONAL',
    20000.00,
    95,
    ARRAY['Summer Apparel', 'Beachwear', 'Accessories'],
    NOW() - INTERVAL '5 days',
    6,
    true,
    'approved',
    admin1_id,
    NOW() - INTERVAL '10 days',
    E'SSC Marketplace US Warehouse\n123 Commerce Drive\nAtlanta, GA 30303\nUnited States',
    'warehouse@sufiscience.com',
    '+1 (404) 555-0100',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '5 months 20 days',
    'Approved for summer season. Storage FREE. Vendor pays shipping TO warehouse and return shipping. Please ship inventory to arrive by deadline.',
    'Summer collection 2024. Fast delivery to US customers needed.',
    NOW() - INTERVAL '15 days'
  );

  -- 5. ACTIVE - Currently running program for Vendor 1
  INSERT INTO warehouse_requests (
    vendor_id,
    request_type,
    expected_inventory_value,
    expected_sku_count,
    product_categories,
    estimated_arrival_date,
    campaign_duration_months,
    shipping_acknowledgment,
    shipping_to_warehouse_paid,
    status,
    reviewed_by_admin_id,
    reviewed_at,
    warehouse_address,
    warehouse_contact_email,
    warehouse_contact_phone,
    arrival_deadline,
    program_end_date,
    admin_notes,
    vendor_notes,
    created_at
  ) VALUES (
    vendor1_id,
    'YEAR_ROUND',
    30000.00,
    150,
    ARRAY['Electronics', 'Gadgets', 'Accessories'],
    NOW() - INTERVAL '60 days',
    12,
    true,
    true,
    'active',
    admin1_id,
    NOW() - INTERVAL '65 days',
    E'SSC Marketplace US Warehouse\n123 Commerce Drive\nAtlanta, GA 30303\nUnited States',
    'warehouse@sufiscience.com',
    '+1 (404) 555-0100',
    NOW() - INTERVAL '50 days',
    NOW() + INTERVAL '10 months',
    'Year-round storage approved. Inventory received and active. Storage FREE. Vendor paid shipping TO warehouse.',
    'Main product line for US market.',
    NOW() - INTERVAL '70 days'
  );

  -- 6. REJECTED - Request denied from Vendor 2
  INSERT INTO warehouse_requests (
    vendor_id,
    request_type,
    expected_inventory_value,
    expected_sku_count,
    product_categories,
    estimated_arrival_date,
    campaign_duration_months,
    shipping_acknowledgment,
    status,
    reviewed_by_admin_id,
    reviewed_at,
    rejection_reason,
    vendor_notes,
    created_at
  ) VALUES (
    vendor2_id,
    'TRIAL',
    3000.00,
    15,
    ARRAY['Food Items', 'Snacks'],
    NOW() - INTERVAL '40 days',
    3,
    true,
    'rejected',
    admin1_id,
    NOW() - INTERVAL '35 days',
    'Unfortunately, we cannot store food items and perishables in our warehouse facility. Our warehouse is not equipped with temperature control required for food storage. Please consider using specialized food warehousing services.',
    'Want to test market for specialty food products.',
    NOW() - INTERVAL '45 days'
  );

END $$;
