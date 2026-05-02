/*
  # Add Warehouse Test Data - Simplified
  
  1. Adds core test data for warehouse functionality
  2. Focuses on requests, shipments, inventory, and metrics
  3. Uses correct schemas and enum values
*/

DO $$
DECLARE
  vendor1_id uuid;
  vendor2_id uuid;
  vendor3_id uuid;
  request1_id uuid;
  request2_id uuid;
  request3_id uuid;
BEGIN
  -- Get first 3 vendors
  SELECT id INTO vendor1_id FROM vendors ORDER BY created_at LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors ORDER BY created_at OFFSET 1 LIMIT 1;
  SELECT id INTO vendor3_id FROM vendors ORDER BY created_at OFFSET 2 LIMIT 1;

  -- Clear existing test data
  DELETE FROM warehouse_performance_metrics WHERE vendor_id IN (vendor1_id, vendor2_id, vendor3_id);
  DELETE FROM warehouse_inventory WHERE vendor_id IN (vendor1_id, vendor2_id, vendor3_id);
  DELETE FROM warehouse_inbound_shipments WHERE vendor_id IN (vendor1_id, vendor2_id, vendor3_id);
  DELETE FROM warehouse_requests WHERE vendor_id IN (vendor1_id, vendor2_id, vendor3_id);

  -- Request 1: Approved (vendor1)
  INSERT INTO warehouse_requests (
    id, vendor_id, request_type, expected_inventory_value, expected_sku_count,
    product_categories, estimated_arrival_date, campaign_duration_months,
    shipping_acknowledgment, shipping_to_warehouse_paid, return_shipping_option,
    status, warehouse_address, warehouse_contact_email, warehouse_contact_phone,
    arrival_deadline, priority_level, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), vendor1_id, 'SEASONAL', 25000.00, 45,
    ARRAY['Electronics', 'Accessories'], CURRENT_DATE + INTERVAL '10 days', 3,
    true, true, 'RETURN_TO_ME',
    'approved', 
    '123 Warehouse Blvd, Columbus, OH 43215',
    'receiving@warehouse.com',
    '614-555-0100',
    CURRENT_DATE + INTERVAL '15 days',
    'standard',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO request1_id;

  -- Request 2: Active (vendor2)
  INSERT INTO warehouse_requests (
    id, vendor_id, request_type, expected_inventory_value, expected_sku_count,
    product_categories, estimated_arrival_date, campaign_duration_months,
    shipping_acknowledgment, shipping_to_warehouse_paid, return_shipping_option,
    status, warehouse_address, warehouse_contact_email, warehouse_contact_phone,
    arrival_deadline, priority_level, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), vendor2_id, 'YEAR_ROUND', 50000.00, 120,
    ARRAY['Home & Garden', 'Tools'], CURRENT_DATE - INTERVAL '5 days', 6,
    true, true, 'LIQUIDATE',
    'active',
    '123 Warehouse Blvd, Columbus, OH 43215',
    'receiving@warehouse.com',
    '614-555-0100',
    CURRENT_DATE + INTERVAL '5 days',
    'high',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '4 days'
  ) RETURNING id INTO request2_id;

  -- Request 3: Pending (vendor3)
  INSERT INTO warehouse_requests (
    id, vendor_id, request_type, expected_inventory_value, expected_sku_count,
    product_categories, estimated_arrival_date, campaign_duration_months,
    shipping_acknowledgment, shipping_to_warehouse_paid, return_shipping_option,
    status, priority_level, vendor_notes, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), vendor3_id, 'TRIAL', 15000.00, 30,
    ARRAY['Clothing', 'Fashion'], CURRENT_DATE + INTERVAL '20 days', 2,
    true, true, 'DONATE',
    'pending',
    'standard',
    'Testing the platform with small batch of inventory',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO request3_id;

  -- Shipments for vendor1
  INSERT INTO warehouse_inbound_shipments (
    id, vendor_id, warehouse_request_id, asn_number, tracking_number, carrier,
    expected_arrival_date, total_boxes, total_pallets, total_weight_lbs, total_value,
    sku_list, fragile_items, status, qr_code, created_at, updated_at
  ) VALUES
  (
    gen_random_uuid(), vendor1_id, request1_id,
    'ASN-2026-001',
    '1Z999AA10123456784',
    'UPS',
    CURRENT_DATE + INTERVAL '7 days',
    15, 2, 450.5, 12500.00,
    '["ELEC-001", "ELEC-002", "ACC-101"]'::jsonb,
    true,
    'scheduled',
    'QR-ASN-2026-001',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(), vendor1_id, request1_id,
    'ASN-2026-002',
    '1Z999AA10123456799',
    'FedEx',
    CURRENT_DATE + INTERVAL '8 days',
    8, 1, 220.3, 12500.00,
    '["ELEC-003", "ACC-102"]'::jsonb,
    false,
    'in_transit',
    'QR-ASN-2026-002',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

  -- Shipments for vendor2
  INSERT INTO warehouse_inbound_shipments (
    id, vendor_id, warehouse_request_id, asn_number, tracking_number, carrier,
    expected_arrival_date, actual_arrival_date, total_boxes, total_pallets,
    total_weight_lbs, total_value, sku_list, status, qr_code,
    quality_check_passed, created_at, updated_at, received_at
  ) VALUES (
    gen_random_uuid(), vendor2_id, request2_id,
    'ASN-2026-003',
    '1Z999AA10123456800',
    'UPS',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '5 days',
    25, 3, 850.0, 30000.00,
    '["TOOL-12345", "TOOL-12346", "HOME-7890"]'::jsonb,
    'received',
    'QR-ASN-2026-003',
    true,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '5 days'
  );

  INSERT INTO warehouse_inbound_shipments (
    id, vendor_id, warehouse_request_id, asn_number, tracking_number, carrier,
    expected_arrival_date, total_boxes, total_pallets,
    total_weight_lbs, total_value, sku_list, status, qr_code,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(), vendor2_id, request2_id,
    'ASN-2026-004',
    '1Z999AA10123456815',
    'FedEx',
    CURRENT_DATE + INTERVAL '2 days',
    30, 4, 1020.0, 20000.00,
    '["TOOL-12347", "HOME-7891"]'::jsonb,
    'in_transit',
    'QR-ASN-2026-004',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  );

  -- Inventory for vendor2
  INSERT INTO warehouse_inventory (
    id, vendor_id, warehouse_request_id, sku, product_name,
    quantity_received, quantity_sold, quantity_remaining,
    location_in_warehouse, received_at, created_at, updated_at
  ) VALUES
  (
    gen_random_uuid(), vendor2_id, request2_id,
    'TOOL-12345',
    'Professional Power Drill Set',
    50, 12, 38,
    'A-01-05-B',
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(), vendor2_id, request2_id,
    'TOOL-12346',
    'Garden Tool Kit',
    30, 8, 22,
    'A-01-05-C',
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(), vendor2_id, request2_id,
    'HOME-7890',
    'Decorative Plant Pots (Set of 4)',
    40, 15, 25,
    'B-03-02-A',
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  );

  -- Metrics for vendor2
  INSERT INTO warehouse_performance_metrics (
    id, vendor_id, warehouse_request_id, metric_date,
    total_skus_stored, total_units_stored, total_value_stored,
    space_utilized_sqft, units_received_today, units_shipped_today,
    inventory_turnover_ratio, days_inventory_on_hand,
    receiving_accuracy_percentage, order_accuracy_percentage,
    damage_rate_percentage, avg_receiving_time_hours,
    avg_order_processing_time_hours, on_time_shipment_percentage,
    storage_cost, handling_cost, shipping_cost_to_warehouse, return_shipping_cost,
    overall_health_score, created_at
  ) VALUES (
    gen_random_uuid(), vendor2_id, request2_id,
    CURRENT_DATE,
    3, 85, 30000.00,
    120.5, 0, 5,
    2.5, 14.6,
    98.5, 99.2,
    0.5, 1.2,
    1.8, 96.5,
    450.00, 180.00, 520.00, 0.00,
    85,
    NOW()
  );

END $$;
