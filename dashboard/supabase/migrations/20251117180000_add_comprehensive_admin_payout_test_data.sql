/*
  # Add Comprehensive Admin Payout Request Test Data

  This migration creates diverse payout requests for testing all admin payout actions
  and workflow scenarios.

  ## Admin Payout Actions to Test
  1. **PENDING Status** → Approve or Reject (requires rejection reason)
  2. **APPROVED Status** → Waiting for bank processing
  3. **COMPLETED Status** → Fully processed and paid
  4. **REJECTED Status** → Denied with reason visible

  ## Test Data Distribution
  - 6-8 Pending requests (test approve/reject actions)
  - 4-5 Approved requests (waiting for bank processing)
  - 5-6 Completed requests (historical reference)
  - 3-4 Rejected requests (with various rejection reasons)

  ## Scenarios Covered
  - Small amounts ($100-$500)
  - Medium amounts ($500-$2,000)
  - Large amounts ($2,000-$10,000)
  - Different platform fee percentages
  - Recent and older requests
  - Various vendors
  - Multiple rejection reasons (insufficient docs, suspicious activity, etc.)

  Total: ~20 payout requests for comprehensive admin testing
*/

-- Clean existing payout test data
DELETE FROM payout_requests WHERE notes LIKE '%TEST-PAYOUT%';

-- Get vendor IDs
DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  vendor3_id UUID;
  vendor4_id UUID;
  new_vendor_id UUID;
BEGIN
  -- Get existing vendor IDs
  SELECT id INTO vendor1_id FROM vendors WHERE business_name LIKE '%Demo Vendor 1%' OR business_name = 'Artisan Crafts Co' LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors WHERE business_name LIKE '%Demo Vendor 2%' LIMIT 1;
  SELECT id INTO vendor3_id FROM vendors WHERE business_name LIKE '%Demo Vendor 3%' LIMIT 1;
  SELECT id INTO vendor4_id FROM vendors WHERE business_name LIKE '%Demo Vendor 4%' LIMIT 1;
  SELECT id INTO new_vendor_id FROM vendors WHERE contact_email = 'fk.envca@gmail.com' LIMIT 1;

  -- Create vendors if missing
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

  IF vendor4_id IS NULL THEN
    INSERT INTO vendors (user_id, business_name, contact_email, phone, status, commission_rate)
    VALUES (gen_random_uuid(), 'Demo Vendor 4', 'vendor4@test.com', '+1-555-0104', 'active', 8.2)
    RETURNING id INTO vendor4_id;
  END IF;

  IF new_vendor_id IS NULL THEN
    INSERT INTO vendors (user_id, business_name, contact_email, phone, status, commission_rate)
    VALUES (gen_random_uuid(), 'New Vendor', 'fk.envca@gmail.com', '+1-555-0199', 'active', 7.0)
    RETURNING id INTO new_vendor_id;
  END IF;

  -- =====================================================
  -- PENDING PAYOUT REQUESTS (Test Approve/Reject - 8 requests)
  -- =====================================================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, notes, created_at
  ) VALUES
  -- Small amounts
  (
    vendor1_id, 350.00, 22.75, 327.25,
    'pending', NOW() - INTERVAL '2 hours',
    'TEST-PAYOUT | Weekly sales payout request', NOW() - INTERVAL '2 hours'
  ),
  (
    vendor2_id, 485.50, 30.59, 454.91,
    'pending', NOW() - INTERVAL '5 hours',
    'TEST-PAYOUT | Regular payout for recent orders', NOW() - INTERVAL '5 hours'
  ),
  (
    new_vendor_id, 295.75, 20.70, 275.05,
    'pending', NOW() - INTERVAL '8 hours',
    'TEST-PAYOUT | First payout request this month', NOW() - INTERVAL '8 hours'
  ),

  -- Medium amounts
  (
    vendor3_id, 1250.00, 112.50, 1137.50,
    'pending', NOW() - INTERVAL '1 day',
    'TEST-PAYOUT | Month-end payout for October sales', NOW() - INTERVAL '1 day'
  ),
  (
    vendor4_id, 875.30, 71.77, 803.53,
    'pending', NOW() - INTERVAL '1 day' - INTERVAL '3 hours',
    'TEST-PAYOUT | Bi-weekly payout request', NOW() - INTERVAL '1 day' - INTERVAL '3 hours'
  ),
  (
    vendor1_id, 1680.45, 109.23, 1571.22,
    'pending', NOW() - INTERVAL '1 day' - INTERVAL '8 hours',
    'TEST-PAYOUT | Special promotion earnings payout', NOW() - INTERVAL '1 day' - INTERVAL '8 hours'
  ),

  -- Large amounts
  (
    vendor2_id, 4250.00, 267.75, 3982.25,
    'pending', NOW() - INTERVAL '2 days',
    'TEST-PAYOUT | Large order fulfillment payment', NOW() - INTERVAL '2 days'
  ),
  (
    vendor3_id, 5820.90, 523.88, 5297.02,
    'pending', NOW() - INTERVAL '2 days' - INTERVAL '4 hours',
    'TEST-PAYOUT | Quarterly earnings withdrawal', NOW() - INTERVAL '2 days' - INTERVAL '4 hours'
  );

  -- =====================================================
  -- APPROVED PAYOUT REQUESTS (Waiting for Bank - 5 requests)
  -- =====================================================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, processed_date, notes, created_at
  ) VALUES
  (
    vendor4_id, 650.00, 53.30, 596.70,
    'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days',
    'TEST-PAYOUT | Approved awaiting bank transfer', NOW() - INTERVAL '3 days'
  ),
  (
    new_vendor_id, 920.75, 64.45, 856.30,
    'approved', NOW() - INTERVAL '3 days' - INTERVAL '6 hours', NOW() - INTERVAL '2 days' - INTERVAL '4 hours',
    'TEST-PAYOUT | Approved for ACH processing', NOW() - INTERVAL '3 days' - INTERVAL '6 hours'
  ),
  (
    vendor1_id, 1540.20, 100.11, 1440.09,
    'approved', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days',
    'TEST-PAYOUT | Large payout approved by finance team', NOW() - INTERVAL '4 days'
  ),
  (
    vendor2_id, 2180.50, 137.37, 2043.13,
    'approved', NOW() - INTERVAL '4 days' - INTERVAL '8 hours', NOW() - INTERVAL '3 days' - INTERVAL '6 hours',
    'TEST-PAYOUT | Bulk order payment approved', NOW() - INTERVAL '4 days' - INTERVAL '8 hours'
  ),
  (
    vendor3_id, 785.60, 70.70, 714.90,
    'approved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days',
    'TEST-PAYOUT | Standard payout approved', NOW() - INTERVAL '5 days'
  );

  -- =====================================================
  -- COMPLETED PAYOUT REQUESTS (Historical - 6 requests)
  -- =====================================================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, processed_date, notes, created_at
  ) VALUES
  (
    vendor1_id, 425.80, 27.68, 398.12,
    'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days',
    'TEST-PAYOUT | Successfully paid via ACH', NOW() - INTERVAL '7 days'
  ),
  (
    vendor2_id, 1850.00, 116.55, 1733.45,
    'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days',
    'TEST-PAYOUT | Wire transfer completed', NOW() - INTERVAL '8 days'
  ),
  (
    vendor3_id, 995.40, 89.59, 905.81,
    'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days',
    'TEST-PAYOUT | Payment processed successfully', NOW() - INTERVAL '10 days'
  ),
  (
    vendor4_id, 3200.00, 262.40, 2937.60,
    'completed', NOW() - INTERVAL '12 days', NOW() - INTERVAL '9 days',
    'TEST-PAYOUT | Large quarterly payout completed', NOW() - INTERVAL '12 days'
  ),
  (
    new_vendor_id, 580.25, 40.62, 539.63,
    'completed', NOW() - INTERVAL '14 days', NOW() - INTERVAL '11 days',
    'TEST-PAYOUT | First successful payout', NOW() - INTERVAL '14 days'
  ),
  (
    vendor1_id, 1120.90, 72.86, 1048.04,
    'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days',
    'TEST-PAYOUT | Monthly earnings paid out', NOW() - INTERVAL '15 days'
  );

  -- =====================================================
  -- REJECTED PAYOUT REQUESTS (With Reasons - 4 requests)
  -- =====================================================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, processed_date, rejection_reason, notes, created_at
  ) VALUES
  (
    vendor2_id, 750.00, 47.25, 702.75,
    'rejected', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days',
    'Insufficient documentation. Please provide invoice copies for orders #ORD-2024-001 through #ORD-2024-015 before requesting payout.',
    'TEST-PAYOUT | Rejected due to missing documentation', NOW() - INTERVAL '6 days'
  ),
  (
    vendor4_id, 2450.00, 200.90, 2249.10,
    'rejected', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days',
    'Bank account verification required. Your bank account details could not be verified. Please update your payout settings with correct banking information.',
    'TEST-PAYOUT | Rejected - bank verification failed', NOW() - INTERVAL '9 days'
  ),
  (
    vendor3_id, 525.60, 47.30, 478.30,
    'rejected', NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days',
    'Minimum payout threshold not met. Your available balance must be at least $500 to request a payout. Current eligible balance: $478.30',
    'TEST-PAYOUT | Below minimum threshold', NOW() - INTERVAL '11 days'
  ),
  (
    new_vendor_id, 3900.00, 273.00, 3627.00,
    'rejected', NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days',
    'Suspicious activity detected. Multiple chargebacks reported on recent orders. Account under review. Please contact support@marketplace.com for resolution.',
    'TEST-PAYOUT | Rejected due to account review', NOW() - INTERVAL '13 days'
  );

  -- =====================================================
  -- ADDITIONAL MIXED SCENARIOS
  -- =====================================================

  -- Very recent pending (just submitted)
  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, notes, created_at
  ) VALUES
  (
    vendor1_id, 189.95, 12.35, 177.60,
    'pending', NOW() - INTERVAL '30 minutes',
    'TEST-PAYOUT | Urgent payout request for immediate needs', NOW() - INTERVAL '30 minutes'
  );

  -- Old pending (needs attention)
  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, notes, created_at
  ) VALUES
  (
    vendor2_id, 1425.75, 89.86, 1335.89,
    'pending', NOW() - INTERVAL '3 days',
    'TEST-PAYOUT | Aging request - needs review', NOW() - INTERVAL '3 days'
  );

  RAISE NOTICE 'Admin payout test data created successfully!';

END $$;

-- Ensure platform fees are set for all vendors
INSERT INTO platform_fees (vendor_id, fee_percentage, fee_type, created_at)
SELECT id,
  CASE
    WHEN business_name LIKE '%Vendor 1%' THEN 6.5
    WHEN business_name LIKE '%Vendor 2%' THEN 6.3
    WHEN business_name LIKE '%Vendor 3%' THEN 9.0
    WHEN business_name LIKE '%Vendor 4%' THEN 8.2
    ELSE 7.0
  END,
  'percentage',
  NOW()
FROM vendors
WHERE NOT EXISTS (
  SELECT 1 FROM platform_fees pf WHERE pf.vendor_id = vendors.id
);

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status, request_date DESC);
CREATE INDEX IF NOT EXISTS idx_payout_requests_vendor ON payout_requests(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_pending ON payout_requests(status, request_date)
  WHERE status = 'pending';

-- Add comments
COMMENT ON TABLE payout_requests IS 'Vendor payout requests managed by admin';
COMMENT ON COLUMN payout_requests.status IS 'pending→approved→completed (or rejected)';
COMMENT ON COLUMN payout_requests.amount IS 'Gross payout amount before fees';
COMMENT ON COLUMN payout_requests.platform_fee IS 'Platform fee deducted from gross amount';
COMMENT ON COLUMN payout_requests.net_amount IS 'Final amount paid to vendor (amount - platform_fee)';
COMMENT ON COLUMN payout_requests.rejection_reason IS 'Admin reason for rejecting payout request';
