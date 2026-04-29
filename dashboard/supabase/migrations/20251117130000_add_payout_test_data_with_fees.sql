/*
  # Add Comprehensive Payout Request Test Data with Platform Fees

  This migration creates realistic payout request data matching the admin dashboard UI:

  ## Data Structure
  - Amount: Gross payout amount before fees
  - Platform Fee: Calculated fee (negative, shown in red)
  - Net Amount: Final amount to be paid (amount - platform_fee)
  - Status: pending, approved, completed, rejected
  - Request Date: When vendor requested payout

  ## Status Distribution
  - PENDING (6 requests) - Awaiting admin action
  - APPROVED (4 requests) - Approved but not yet paid
  - COMPLETED (5 requests) - Successfully paid out
  - REJECTED (2 requests) - Denied requests

  ## Test Actions
  - Approve pending requests
  - Reject with reason
  - Process approved payouts
  - View details and history
  - Filter by status
  - Sort by date/amount
*/

-- Clean existing test data
DELETE FROM payout_requests;

-- Ensure table has all required columns
DO $$
BEGIN
  -- Add platform_fee if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'platform_fee') THEN
    ALTER TABLE payout_requests ADD COLUMN platform_fee DECIMAL(10, 2) DEFAULT 0;
  END IF;

  -- Add net_amount if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'net_amount') THEN
    ALTER TABLE payout_requests ADD COLUMN net_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;

  -- Add request_date if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'request_date') THEN
    ALTER TABLE payout_requests ADD COLUMN request_date TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add processed_date if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'processed_date') THEN
    ALTER TABLE payout_requests ADD COLUMN processed_date TIMESTAMPTZ;
  END IF;

  -- Add rejection_reason if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'rejection_reason') THEN
    ALTER TABLE payout_requests ADD COLUMN rejection_reason TEXT;
  END IF;

  -- Add notes if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'notes') THEN
    ALTER TABLE payout_requests ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Insert comprehensive payout test data
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
  SELECT id INTO vendor1_id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1;
  SELECT id INTO vendor3_id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1;

  -- Create additional test vendors if needed
  INSERT INTO vendors (
    user_id, business_name, contact_email, phone, address, city, state,
    zip_code, country, business_type, tax_id, bank_account_number,
    bank_routing_number, status, commission_rate
  )
  SELECT
    auth.uid(),
    'Demo Vendor 4',
    'vendor4@test.com',
    '+1-555-0104',
    '404 Commerce Dr',
    'San Diego',
    'CA',
    '92101',
    'US',
    'LLC',
    'TAX-104',
    'BANK-****0404',
    'ROUTE-404',
    'active',
    7.0
  WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE business_name = 'Demo Vendor 4')
  RETURNING id INTO vendor4_id;

  IF vendor4_id IS NULL THEN
    SELECT id INTO vendor4_id FROM vendors WHERE business_name = 'Demo Vendor 4' LIMIT 1;
  END IF;

  -- Create "New Vendor" for testing
  INSERT INTO vendors (
    user_id, business_name, contact_email, phone, address, city, state,
    zip_code, country, business_type, tax_id, bank_account_number,
    bank_routing_number, status, commission_rate
  )
  SELECT
    auth.uid(),
    'New Vendor',
    'fk.envca@gmail.com',
    '+1-555-0199',
    '999 Startup Ave',
    'San Francisco',
    'CA',
    '94105',
    'US',
    'Sole Proprietor',
    'TAX-199',
    'BANK-****0999',
    'ROUTE-999',
    'active',
    8.5
  WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE contact_email = 'fk.envca@gmail.com')
  RETURNING id INTO new_vendor_id;

  IF new_vendor_id IS NULL THEN
    SELECT id INTO new_vendor_id FROM vendors WHERE contact_email = 'fk.envca@gmail.com' LIMIT 1;
  END IF;

  -- Get admin ID
  SELECT id INTO admin_finance_id FROM admin_users WHERE email = 'finance@sufiscience.com' LIMIT 1;

  -- =======================
  -- APPROVED STATUS (4 requests)
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date, processed_date,
    notes, processed_by, created_at, updated_at
  ) VALUES
  -- New Vendor - Most Recent Approved
  (
    new_vendor_id,
    5804.23,
    -407.46,
    5396.77,
    'approved',
    'bank_transfer',
    '{"bank_name": "Wells Fargo", "account_last4": "0999", "routing_number": "121000248"}',
    '2025-11-15'::date,
    NOW() - INTERVAL '2 hours',
    'Approved by Finance Team - Ready for processing',
    admin_finance_id,
    '2025-11-15'::timestamp,
    NOW() - INTERVAL '2 hours'
  ),

  -- Demo Vendor 4
  (
    vendor4_id,
    1228.11,
    -100.58,
    1127.53,
    'approved',
    'paypal',
    '{"paypal_email": "vendor4@test.com", "verified": true}',
    '2025-10-31'::date,
    NOW() - INTERVAL '1 day',
    'Approved - PayPal payout scheduled',
    admin_finance_id,
    '2025-10-31'::timestamp,
    NOW() - INTERVAL '1 day'
  ),

  -- Demo Vendor 1 (Artisan Crafts)
  (
    vendor1_id,
    2070.16,
    -135.60,
    1934.56,
    'approved',
    'stripe',
    '{"stripe_account_id": "acct_artisan123", "country": "US"}',
    '2025-10-24'::date,
    NOW() - INTERVAL '3 days',
    'Approved for Stripe transfer',
    admin_finance_id,
    '2025-10-24'::timestamp,
    NOW() - INTERVAL '3 days'
  ),

  -- Demo Vendor 3
  (
    vendor3_id,
    2555.29,
    -231.00,
    2324.29,
    'approved',
    'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593"}',
    '2025-10-19'::date,
    NOW() - INTERVAL '5 days',
    'Approved - ACH transfer initiated',
    admin_finance_id,
    '2025-10-19'::timestamp,
    NOW() - INTERVAL '5 days'
  );

  -- =======================
  -- COMPLETED STATUS (5 requests)
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date, processed_date,
    notes, processed_by, created_at, updated_at
  ) VALUES
  -- New Vendor - Completed
  (
    new_vendor_id,
    3956.76,
    -347.01,
    3609.75,
    'completed',
    'bank_transfer',
    '{"bank_name": "Wells Fargo", "account_last4": "0999", "routing_number": "121000248"}',
    '2025-10-29'::date,
    '2025-10-30 14:23:00'::timestamp,
    'Payment completed - Confirmation: TXN-20251030-WF789',
    admin_finance_id,
    '2025-10-29'::timestamp,
    '2025-10-30 14:23:00'::timestamp
  ),

  -- Demo Vendor 2 - Completed
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
    'PayPal payout completed - ID: PP-20251028-456',
    admin_finance_id,
    '2025-10-27'::timestamp,
    '2025-10-28 10:15:00'::timestamp
  ),

  -- Demo Vendor 1 - Completed
  (
    vendor1_id,
    3420.50,
    -245.80,
    3174.70,
    'completed',
    'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
    '2025-10-22'::date,
    '2025-10-23 16:45:00'::timestamp,
    'ACH completed - Trace: ACH-102325-123',
    admin_finance_id,
    '2025-10-22'::timestamp,
    '2025-10-23 16:45:00'::timestamp
  ),

  -- Demo Vendor 4 - Completed
  (
    vendor4_id,
    1890.25,
    -132.30,
    1757.95,
    'completed',
    'stripe',
    '{"stripe_account_id": "acct_vendor4stripe", "country": "US"}',
    '2025-10-18'::date,
    '2025-10-19 09:30:00'::timestamp,
    'Stripe transfer completed successfully',
    admin_finance_id,
    '2025-10-18'::timestamp,
    '2025-10-19 09:30:00'::timestamp
  ),

  -- Demo Vendor 3 - Completed
  (
    vendor3_id,
    4125.80,
    -288.80,
    3837.00,
    'completed',
    'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593"}',
    '2025-10-15'::date,
    '2025-10-16 11:20:00'::timestamp,
    'Wire transfer completed - Ref: WIRE-101625-789',
    admin_finance_id,
    '2025-10-15'::timestamp,
    '2025-10-16 11:20:00'::timestamp
  );

  -- =======================
  -- PENDING STATUS (6 requests)
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date,
    created_at, updated_at
  ) VALUES
  -- Recent pending requests (need admin action)
  (
    new_vendor_id,
    4250.90,
    -382.58,
    3868.32,
    'pending',
    'bank_transfer',
    '{"bank_name": "Wells Fargo", "account_last4": "0999", "routing_number": "121000248"}',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  ),

  (
    vendor2_id,
    3180.45,
    -222.63,
    2957.82,
    'pending',
    'paypal',
    '{"paypal_email": "vendor2@test.com", "verified": true}',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
  ),

  (
    vendor1_id,
    2675.30,
    -187.27,
    2488.03,
    'pending',
    'stripe',
    '{"stripe_account_id": "acct_artisan123", "country": "US"}',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),

  (
    vendor4_id,
    1520.75,
    -106.45,
    1414.30,
    'pending',
    'bank_transfer',
    '{"bank_name": "US Bank", "account_last4": "0404", "routing_number": "091000022"}',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),

  (
    vendor3_id,
    5890.50,
    -412.34,
    5478.16,
    'pending',
    'bank_transfer',
    '{"bank_name": "Bank of America", "account_last4": "5678", "routing_number": "026009593"}',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),

  (
    vendor2_id,
    980.20,
    -68.61,
    911.59,
    'pending',
    'stripe',
    '{"stripe_account_id": "acct_vendor2stripe", "country": "US"}',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  );

  -- =======================
  -- REJECTED STATUS (2 requests)
  -- =======================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount, status,
    payout_method, payout_details, request_date, processed_date,
    rejection_reason, processed_by, created_at, updated_at
  ) VALUES
  (
    vendor1_id,
    1750.00,
    -122.50,
    1627.50,
    'rejected',
    'bank_transfer',
    '{"bank_name": "Chase Bank", "account_last4": "1234", "routing_number": "021000021"}',
    '2025-10-08'::date,
    '2025-10-09 13:30:00'::timestamp,
    'Insufficient documentation - Bank account verification required',
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
    '{"paypal_email": "vendor4old@test.com", "verified": false}',
    '2025-10-05'::date,
    '2025-10-06 10:15:00'::timestamp,
    'PayPal account not verified - Please update payment details',
    admin_finance_id,
    '2025-10-05'::timestamp,
    '2025-10-06 10:15:00'::timestamp
  );

END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_status_date
  ON payout_requests(status, request_date DESC);

CREATE INDEX IF NOT EXISTS idx_payout_requests_vendor_status
  ON payout_requests(vendor_id, status);

CREATE INDEX IF NOT EXISTS idx_payout_requests_amount
  ON payout_requests(amount DESC);

-- Add helpful comment
COMMENT ON COLUMN payout_requests.platform_fee IS 'Platform commission fee (negative value)';
COMMENT ON COLUMN payout_requests.net_amount IS 'Final payout amount after platform fee (amount + platform_fee)';
