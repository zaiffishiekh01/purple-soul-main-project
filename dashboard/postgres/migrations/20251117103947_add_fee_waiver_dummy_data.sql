/*
  # Add Fee Waiver Request Test Data
  
  1. Purpose
    - Add comprehensive test data for fee waiver requests
    - Include various statuses (PENDING, APPROVED, REJECTED)
    - Include different document types and scenarios
    - Link to existing vendors from test data
  
  2. Data Added
    - 8 fee waiver requests with different statuses
    - Mix of full waivers and reduced commission requests
    - Various document types (BPL Card, Income Certificate, Other)
    - Some with admin decisions, some pending
  
  3. Test Scenarios
    - Pending requests awaiting review
    - Approved full fee waivers
    - Approved reduced commission rates
    - Rejected requests with reasons
    - Mix of old and recent submissions
*/

-- Add fee waiver requests for testing
-- Using existing vendor IDs from the test data

-- Get vendor IDs for reference (we'll use known vendor names)
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

  -- Insert fee waiver requests
  
  -- 1. PENDING - Recent request from Vendor 1 (BPL Card)
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    created_at
  ) VALUES (
    vendor1_id,
    'BPL_CARD',
    'fee-waivers/vendor1-bpl-card.pdf',
    'Our business serves low-income communities and we struggle with platform fees. We have a valid BPL card showing our family is below poverty line.',
    'PENDING',
    NOW() - INTERVAL '2 days'
  );

  -- 2. PENDING - Recent request from Vendor 2 (Income Certificate)
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    created_at
  ) VALUES (
    vendor2_id,
    'INCOME_CERTIFICATE',
    'fee-waivers/vendor2-income-cert.pdf',
    'Due to economic challenges, our annual income is below threshold. Please consider waiving platform fees to help us grow our business.',
    'PENDING',
    NOW() - INTERVAL '1 day'
  );

  -- 3. PENDING - Request from Vendor 3 (Other document)
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    created_at
  ) VALUES (
    vendor3_id,
    'OTHER',
    'fee-waivers/vendor3-hardship-letter.pdf',
    'Attaching financial hardship documentation. Our small business has been impacted by recent economic conditions and we need fee support.',
    'PENDING',
    NOW() - INTERVAL '5 days'
  );

  -- 4. APPROVED - Full fee waiver (6 months validity)
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    waiver_type,
    commission_rate,
    valid_from,
    valid_until,
    reviewed_by_admin_id,
    reviewed_at,
    note_from_admin,
    created_at
  ) VALUES (
    vendor4_id,
    'BPL_CARD',
    'fee-waivers/vendor4-bpl-card.pdf',
    'Family below poverty line. Running small handicraft business. Need full fee waiver support.',
    'APPROVED',
    'FULL_FEE_WAIVER',
    0.00,
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '5 months 20 days',
    admin1_id,
    NOW() - INTERVAL '10 days',
    'Approved based on valid BPL card documentation. Full fee waiver granted for 6 months.',
    NOW() - INTERVAL '15 days'
  );

  -- 5. APPROVED - Reduced commission (2%)
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    waiver_type,
    commission_rate,
    valid_from,
    valid_until,
    reviewed_by_admin_id,
    reviewed_at,
    note_from_admin,
    created_at
  ) VALUES (
    vendor1_id,
    'INCOME_CERTIFICATE',
    'fee-waivers/vendor1-income-cert-old.pdf',
    'Previous request - income certificate showing eligibility for reduced fees.',
    'APPROVED',
    'REDUCED_COMMISSION',
    0.02,
    NOW() - INTERVAL '20 days',
    NOW() + INTERVAL '5 months 10 days',
    admin1_id,
    NOW() - INTERVAL '20 days',
    'Approved for reduced commission rate of 2% based on income certificate. Valid for 6 months.',
    NOW() - INTERVAL '25 days'
  );

  -- 6. REJECTED - Insufficient documentation
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    reviewed_by_admin_id,
    reviewed_at,
    note_from_admin,
    created_at
  ) VALUES (
    vendor2_id,
    'OTHER',
    'fee-waivers/vendor2-request-old.pdf',
    'Need fee waiver for business growth.',
    'REJECTED',
    admin1_id,
    NOW() - INTERVAL '30 days',
    'Request rejected due to insufficient documentation. Please provide valid BPL card or income certificate.',
    NOW() - INTERVAL '35 days'
  );

  -- 7. REJECTED - Does not meet criteria
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    reviewed_by_admin_id,
    reviewed_at,
    note_from_admin,
    created_at
  ) VALUES (
    vendor3_id,
    'INCOME_CERTIFICATE',
    'fee-waivers/vendor3-expired-cert.pdf',
    'Requesting fee waiver support.',
    'REJECTED',
    admin1_id,
    NOW() - INTERVAL '45 days',
    'Income certificate has expired. Please submit updated documentation to be reconsidered.',
    NOW() - INTERVAL '50 days'
  );

  -- 8. PENDING - Very recent request
  INSERT INTO fee_waiver_requests (
    vendor_id,
    document_type,
    document_url,
    note_from_vendor,
    status,
    created_at
  ) VALUES (
    vendor4_id,
    'BPL_CARD',
    'fee-waivers/vendor4-new-bpl.pdf',
    'Renewal request - previous waiver expired. Attaching renewed BPL card for continued fee support.',
    'PENDING',
    NOW() - INTERVAL '6 hours'
  );

END $$;
