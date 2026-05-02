/*
  # Fix Payout Test Data - Add PENDING Requests for Admin Testing

  The admin dashboard needs PENDING payout requests to test approval/rejection workflow.
  This migration replaces the previous data with proper distribution:

  ## Status Distribution for Testing
  - PENDING (8 requests) - PRIMARY TEST DATA - Admin can approve/reject these
  - APPROVED (3 requests) - Ready to process to completed
  - COMPLETED (3 requests) - Historical reference
  - REJECTED (2 requests) - Examples of rejected payouts

  ## Admin Test Actions
  1. ✅ Approve pending payouts → moves to "approved" status
  2. ❌ Reject pending payouts → add rejection reason
  3. 💳 Process approved payouts → mark as completed
  4. 📊 View payout details modal
  5. 🔍 Filter by status
  6. 📈 Update platform fees (Platform Fees tab)
*/

-- Clean ALL existing payout test data
DELETE FROM payout_requests;

-- Insert fresh test data with PENDING requests
DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  vendor3_id UUID;
  vendor4_id UUID;
  new_vendor_id UUID;
  admin_finance_id UUID;
BEGIN
  -- Get vendor IDs
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name LIKE '%Demo Vendor 1%' OR business_name = 'Artisan Crafts Co' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at ASC LIMIT 1)
  ) INTO vendor1_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name LIKE '%Demo Vendor 2%' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
    (SELECT id FROM vendors WHERE id <> vendor1_id ORDER BY created_at ASC LIMIT 1),
    vendor1_id
  ) INTO vendor2_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name LIKE '%Demo Vendor 3%' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
    (SELECT id FROM vendors WHERE id NOT IN (vendor1_id, vendor2_id) ORDER BY created_at ASC LIMIT 1),
    vendor2_id,
    vendor1_id
  ) INTO vendor3_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name LIKE '%Demo Vendor 4%' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 4' LIMIT 1),
    (SELECT id FROM vendors WHERE id NOT IN (vendor1_id, vendor2_id, vendor3_id) ORDER BY created_at ASC LIMIT 1),
    vendor3_id,
    vendor2_id,
    vendor1_id
  ) INTO vendor4_id;
  SELECT id INTO new_vendor_id FROM vendors WHERE contact_email = 'fk.envca@gmail.com' LIMIT 1;

  -- Get admin ID
  SELECT COALESCE(
    (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'finance@sufiscience.com' LIMIT 1),
    (SELECT au.id FROM admin_users au JOIN auth.users u ON u.id = au.user_id WHERE u.email = 'admin@sufiscience.com' LIMIT 1),
    (SELECT id FROM admin_users ORDER BY created_at ASC LIMIT 1)
  ) INTO admin_finance_id;

  -- Create vendors if they don't exist
  IF vendor1_id IS NULL THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES ('payout-seed-vendor1@test.com', 'seed', now())
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO vendors (user_id, business_name, contact_email, contact_phone, phone, status, commission_rate)
    SELECT u.id, 'Demo Vendor 1', 'vendor1@test.com', '+1-555-0101', '+1-555-0101', 'active', 6.5
    FROM auth.users u
    WHERE u.email = 'payout-seed-vendor1@test.com'
    RETURNING id INTO vendor1_id;
  END IF;

  IF vendor2_id IS NULL THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES ('payout-seed-vendor2@test.com', 'seed', now())
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO vendors (user_id, business_name, contact_email, contact_phone, phone, status, commission_rate)
    SELECT u.id, 'Demo Vendor 2', 'vendor2@test.com', '+1-555-0102', '+1-555-0102', 'active', 6.3
    FROM auth.users u
    WHERE u.email = 'payout-seed-vendor2@test.com'
    RETURNING id INTO vendor2_id;
  END IF;

  IF vendor3_id IS NULL THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES ('payout-seed-vendor3@test.com', 'seed', now())
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO vendors (user_id, business_name, contact_email, contact_phone, phone, status, commission_rate)
    SELECT u.id, 'Demo Vendor 3', 'vendor3@test.com', '+1-555-0103', '+1-555-0103', 'active', 9.0
    FROM auth.users u
    WHERE u.email = 'payout-seed-vendor3@test.com'
    RETURNING id INTO vendor3_id;
  END IF;

  IF vendor4_id IS NULL THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES ('payout-seed-vendor4@test.com', 'seed', now())
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO vendors (user_id, business_name, contact_email, contact_phone, phone, status, commission_rate)
    SELECT u.id, 'Demo Vendor 4', 'vendor4@test.com', '+1-555-0104', '+1-555-0104', 'active', 8.2
    FROM auth.users u
    WHERE u.email = 'payout-seed-vendor4@test.com'
    RETURNING id INTO vendor4_id;
  END IF;

  IF new_vendor_id IS NULL THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES ('payout-seed-new-vendor@test.com', 'seed', now())
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO vendors (user_id, business_name, contact_email, contact_phone, phone, status, commission_rate)
    SELECT u.id, 'New Vendor', 'fk.envca@gmail.com', '+1-555-0199', '+1-555-0199', 'active', 7.0
    FROM auth.users u
    WHERE u.email = 'payout-seed-new-vendor@test.com'
    RETURNING id INTO new_vendor_id;
  END IF;

  -- =======================
  -- PENDING STATUS (8 requests)
  -- THESE ARE THE PRIMARY TEST DATA FOR ADMIN ACTIONS
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date,
    created_at, updated_at
  ) VALUES
  -- High priority - recent requests (most urgent)
  (
    new_vendor_id,
    4890.50,
    -342.34,
    4548.16,
    'pending',
    'bank_transfer',
    '{"bank_name": "Wells Fargo", "account_last4": "0999", "routing_number": "121000248", "account_holder": "New Vendor LLC"}',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
  ),

  (
    vendor2_id,
    3250.75,
    -227.55,
    3023.20,
    'pending',
    'paypal',
    '{"paypal_email": "vendor2@test.com", "verified": true}',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
  ),

  (
    vendor1_id,
    2780.40,
    -194.63,
    2585.77,
    'pending',
    'stripe',
    '{"stripe_account_id": "acct_vendor1stripe", "country": "US"}',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),

  (
    vendor4_id,
    1650.25,
    -115.52,
    1534.73,
    'pending',
    'bank_transfer',
    '{"bank_name": "US Bank", "account_last4": "0404", "routing_number": "091000022", "account_holder": "Demo Vendor 4 Inc"}',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),

  -- Medium priority requests
  (
    vendor3_id,
    5420.00,
    -379.40,
    5040.60,
    'pending',
    'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593", "account_holder": "Demo Vendor 3 LLC"}',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),

  (
    new_vendor_id,
    2125.90,
    -148.81,
    1977.09,
    'pending',
    'paypal',
    '{"paypal_email": "fk.envca@gmail.com", "verified": true}',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),

  -- Older pending requests
  (
    vendor1_id,
    3890.60,
    -272.34,
    3618.26,
    'pending',
    'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021", "account_holder": "Vendor One Corp"}',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  ),

  (
    vendor2_id,
    1095.50,
    -76.69,
    1018.81,
    'pending',
    'stripe',
    '{"stripe_account_id": "acct_vendor2stripe", "country": "US"}',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  );

  -- =======================
  -- APPROVED STATUS (3 requests)
  -- Ready to be marked as completed
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date, processed_date,
    notes, processed_by, created_at, updated_at
  ) VALUES
  (
    new_vendor_id,
    5804.23,
    -407.46,
    5396.77,
    'approved',
    'bank_transfer',
    '{"bank_name": "Wells Fargo", "account_last4": "0999", "routing_number": "121000248", "account_holder": "New Vendor LLC"}',
    '2025-11-15'::date,
    NOW() - INTERVAL '1 day',
    'Approved by Finance - ACH transfer initiated',
    admin_finance_id,
    '2025-11-15'::timestamp,
    NOW() - INTERVAL '1 day'
  ),

  (
    vendor1_id,
    2070.16,
    -135.60,
    1934.56,
    'approved',
    'stripe',
    '{"stripe_account_id": "acct_vendor1stripe", "country": "US"}',
    '2025-10-24'::date,
    NOW() - INTERVAL '2 days',
    'Approved - Stripe payout scheduled',
    admin_finance_id,
    '2025-10-24'::timestamp,
    NOW() - INTERVAL '2 days'
  ),

  (
    vendor4_id,
    1228.11,
    -100.58,
    1127.53,
    'approved',
    'paypal',
    '{"paypal_email": "vendor4@test.com", "verified": true}',
    '2025-10-31'::date,
    NOW() - INTERVAL '3 days',
    'Approved - PayPal batch payment queued',
    admin_finance_id,
    '2025-10-31'::timestamp,
    NOW() - INTERVAL '3 days'
  );

  -- =======================
  -- COMPLETED STATUS (3 requests)
  -- Historical successful payouts
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date, processed_date,
    notes, processed_by, created_at, updated_at
  ) VALUES
  (
    new_vendor_id,
    3956.76,
    -347.01,
    3609.75,
    'completed',
    'bank_transfer',
    '{"bank_name": "Wells Fargo", "account_last4": "0999", "routing_number": "121000248", "account_holder": "New Vendor LLC"}',
    '2025-10-29'::date,
    '2025-10-30 14:23:00'::timestamp,
    'Payment completed successfully - Confirmation: TXN-WF-20251030-789',
    admin_finance_id,
    '2025-10-29'::timestamp,
    '2025-10-30 14:23:00'::timestamp
  ),

  (
    vendor2_id,
    2812.57,
    -178.32,
    2634.25,
    'completed',
    'paypal',
    '{"paypal_email": "vendor2@test.com", "verified": true}',
    '2025-10-27'::date,
    '2025-10-28 10:15:00'::timestamp,
    'PayPal payout completed - ID: PP-20251028-ABC123',
    admin_finance_id,
    '2025-10-27'::timestamp,
    '2025-10-28 10:15:00'::timestamp
  ),

  (
    vendor3_id,
    2555.29,
    -231.00,
    2324.29,
    'completed',
    'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593", "account_holder": "Demo Vendor 3 LLC"}',
    '2025-10-19'::date,
    '2025-10-20 11:45:00'::timestamp,
    'Wire transfer completed - Reference: WIRE-BAC-102025-456',
    admin_finance_id,
    '2025-10-19'::timestamp,
    '2025-10-20 11:45:00'::timestamp
  );

  -- =======================
  -- REJECTED STATUS (2 requests)
  -- Examples of rejected payouts with reasons
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date, processed_date,
    rejection_reason, processed_by, created_at, updated_at
  ) VALUES
  (
    vendor1_id,
    1850.00,
    -129.50,
    1720.50,
    'rejected',
    'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021", "account_holder": "Vendor One Corp"}',
    '2025-10-08'::date,
    '2025-10-09 13:30:00'::timestamp,
    'Bank account verification failed. Please update your banking information and resubmit.',
    admin_finance_id,
    '2025-10-08'::timestamp,
    '2025-10-09 13:30:00'::timestamp
  ),

  (
    vendor4_id,
    2340.80,
    -163.86,
    2176.94,
    'rejected',
    'paypal',
    '{"paypal_email": "oldvendor4@test.com", "verified": false}',
    '2025-10-05'::date,
    '2025-10-06 10:15:00'::timestamp,
    'PayPal account not verified. Please verify your PayPal account or provide alternate payment method.',
    admin_finance_id,
    '2025-10-05'::timestamp,
    '2025-10-06 10:15:00'::timestamp
  );

END $$;

-- Update vendor commission rates for realistic platform fees
UPDATE vendors SET commission_rate = 7.0 WHERE business_name = 'New Vendor';
UPDATE vendors SET commission_rate = 6.3 WHERE business_name LIKE '%Demo Vendor 2%';
UPDATE vendors SET commission_rate = 6.5 WHERE business_name LIKE '%Demo Vendor 1%' OR business_name = 'Artisan Crafts Co';
UPDATE vendors SET commission_rate = 9.0 WHERE business_name LIKE '%Demo Vendor 3%';
UPDATE vendors SET commission_rate = 8.2 WHERE business_name LIKE '%Demo Vendor 4%';

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_payout_requests_status_date
  ON payout_requests(status, request_date DESC);

CREATE INDEX IF NOT EXISTS idx_payout_requests_vendor_status
  ON payout_requests(vendor_id, status);

-- Add helpful statistics view
COMMENT ON TABLE payout_requests IS 'Vendor payout requests with platform fee deductions';
COMMENT ON COLUMN payout_requests.status IS 'pending=awaiting admin action, approved=ready to process, completed=paid out, rejected=denied';
COMMENT ON COLUMN payout_requests.platform_fee IS 'Platform commission (negative value deducted from amount)';
COMMENT ON COLUMN payout_requests.net_amount IS 'Final payout after platform fee (amount + platform_fee)';
