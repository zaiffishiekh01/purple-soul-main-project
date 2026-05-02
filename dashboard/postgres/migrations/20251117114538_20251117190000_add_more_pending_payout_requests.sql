-- Add 15 more PENDING payout requests for action testing
DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  vendor3_id UUID;
  vendor4_id UUID;
  new_vendor_id UUID;
BEGIN
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at ASC LIMIT 1)
  ) INTO vendor1_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at DESC LIMIT 1)
  ) INTO vendor2_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 2' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at ASC LIMIT 1)
  ) INTO vendor3_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Demo Vendor 3' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at DESC LIMIT 1)
  ) INTO vendor4_id;
  SELECT COALESCE(
    (SELECT id FROM vendors WHERE business_name = 'Artisan Crafts Co' LIMIT 1),
    (SELECT id FROM vendors WHERE business_name = 'Approved Seed Vendor' LIMIT 1),
    (SELECT id FROM vendors ORDER BY created_at DESC LIMIT 1)
  ) INTO new_vendor_id;

  -- Add 15 PENDING payout requests
  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, notes, created_at
  ) VALUES
  -- Very recent pending (high priority - test quick approve)
  (vendor1_id, 425.50, 27.66, 397.84, 'pending', NOW() - INTERVAL '1 hour', 'TEST-PAYOUT-ACTIONS | Urgent weekly payout', NOW() - INTERVAL '1 hour'),
  (vendor2_id, 680.75, 42.87, 637.88, 'pending', NOW() - INTERVAL '2 hours', 'TEST-PAYOUT-ACTIONS | Standard bi-weekly request', NOW() - INTERVAL '2 hours'),
  (new_vendor_id, 315.90, 22.11, 293.79, 'pending', NOW() - INTERVAL '3 hours', 'TEST-PAYOUT-ACTIONS | First payout this week', NOW() - INTERVAL '3 hours'),
  (vendor3_id, 892.40, 80.32, 812.08, 'pending', NOW() - INTERVAL '4 hours', 'TEST-PAYOUT-ACTIONS | Month-end sales payout', NOW() - INTERVAL '4 hours'),
  (vendor4_id, 550.00, 45.10, 504.90, 'pending', NOW() - INTERVAL '5 hours', 'TEST-PAYOUT-ACTIONS | Regular payout cycle', NOW() - INTERVAL '5 hours'),
  -- Medium amounts - today (test approve workflow)
  (vendor1_id, 1125.80, 73.18, 1052.62, 'pending', NOW() - INTERVAL '8 hours', 'TEST-PAYOUT-ACTIONS | Large order payment', NOW() - INTERVAL '8 hours'),
  (vendor2_id, 1450.25, 91.37, 1358.88, 'pending', NOW() - INTERVAL '10 hours', 'TEST-PAYOUT-ACTIONS | Special promotion earnings', NOW() - INTERVAL '10 hours'),
  (new_vendor_id, 975.60, 68.29, 907.31, 'pending', NOW() - INTERVAL '12 hours', 'TEST-PAYOUT-ACTIONS | Bulk order fulfillment', NOW() - INTERVAL '12 hours'),
  -- Yesterday - aging (test approve and reject)
  (vendor3_id, 2100.00, 189.00, 1911.00, 'pending', NOW() - INTERVAL '1 day' - INTERVAL '2 hours', 'TEST-PAYOUT-ACTIONS | Large quarterly payout', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
  (vendor4_id, 1680.50, 137.80, 1542.70, 'pending', NOW() - INTERVAL '1 day' - INTERVAL '6 hours', 'TEST-PAYOUT-ACTIONS | Consolidated weekly sales', NOW() - INTERVAL '1 day' - INTERVAL '6 hours'),
  (vendor1_id, 780.30, 50.72, 729.58, 'pending', NOW() - INTERVAL '1 day' - INTERVAL '10 hours', 'TEST-PAYOUT-ACTIONS | Mid-month payout request', NOW() - INTERVAL '1 day' - INTERVAL '10 hours'),
  -- 2 days ago - needs attention (test reject with reasons)
  (vendor2_id, 3500.00, 220.50, 3279.50, 'pending', NOW() - INTERVAL '2 days' - INTERVAL '3 hours', 'TEST-PAYOUT-ACTIONS | High value payout request', NOW() - INTERVAL '2 days' - INTERVAL '3 hours'),
  (new_vendor_id, 495.75, 34.70, 461.05, 'pending', NOW() - INTERVAL '2 days' - INTERVAL '8 hours', 'TEST-PAYOUT-ACTIONS | Small business weekly payout', NOW() - INTERVAL '2 days' - INTERVAL '8 hours'),
  (vendor3_id, 5200.00, 468.00, 4732.00, 'pending', NOW() - INTERVAL '2 days' - INTERVAL '12 hours', 'TEST-PAYOUT-ACTIONS | Largest pending request - needs review', NOW() - INTERVAL '2 days' - INTERVAL '12 hours'),
  -- 3 days old - critical aging (test reject for review)
  (vendor4_id, 1890.90, 155.05, 1735.85, 'pending', NOW() - INTERVAL '3 days', 'TEST-PAYOUT-ACTIONS | AGING REQUEST - needs immediate action', NOW() - INTERVAL '3 days');

  RAISE NOTICE 'Added 15 additional PENDING payout requests for action testing!';
END $$;