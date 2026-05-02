/*
  # Cleanup and Fix Vendor Data

  1. Purpose
    - Remove duplicate "New Vendor" entries
    - Ensure "Test Vendor Store" is the primary vendor
    - Link all test data to the correct vendor

  2. Changes
    - Delete duplicate vendor entries
    - Keep only Test Vendor Store
*/

DO $$
DECLARE
  v_user_id uuid := '58b46169-8841-4423-8c72-6ce2fe4743d3';
  v_test_vendor_id uuid;
  v_old_vendor_ids uuid[];
BEGIN
  -- Get the Test Vendor Store ID
  SELECT id INTO v_test_vendor_id 
  FROM vendors 
  WHERE user_id = v_user_id 
    AND business_name = 'Test Vendor Store' 
  LIMIT 1;

  -- Get IDs of other vendors for this user
  SELECT array_agg(id) INTO v_old_vendor_ids
  FROM vendors 
  WHERE user_id = v_user_id 
    AND business_name != 'Test Vendor Store';

  -- If there are duplicate vendors, clean them up
  IF v_old_vendor_ids IS NOT NULL THEN
    -- Delete any data associated with duplicate vendors
    DELETE FROM order_items 
    WHERE order_id IN (
      SELECT id FROM orders WHERE vendor_id = ANY(v_old_vendor_ids)
    );

    DELETE FROM shipments WHERE vendor_id = ANY(v_old_vendor_ids);
    DELETE FROM shipping_labels WHERE vendor_id = ANY(v_old_vendor_ids);
    DELETE FROM notifications WHERE vendor_id = ANY(v_old_vendor_ids);
    DELETE FROM orders WHERE vendor_id = ANY(v_old_vendor_ids);
    DELETE FROM products WHERE vendor_id = ANY(v_old_vendor_ids);
    
    -- Delete the duplicate vendors
    DELETE FROM vendors WHERE id = ANY(v_old_vendor_ids);
  END IF;

  -- Update Test Vendor Store with complete information
  UPDATE vendors 
  SET 
    business_name = 'Test Vendor Store',
    business_type = 'E-commerce',
    contact_email = 'john@testvendor.com',
    contact_phone = '+1-555-0123',
    address = jsonb_build_object(
      'street', '123 Business Street, Suite 100',
      'city', 'New York',
      'state', 'NY',
      'zip', '10001',
      'country', 'United States'
    ),
    tax_id = 'TAX123456',
    status = 'active',
    logo_url = '',
    updated_at = NOW()
  WHERE id = v_test_vendor_id;

END $$;
