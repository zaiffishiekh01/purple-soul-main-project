-- Add 15 more PENDING payout requests for action testing
DO $$
DECLARE
  vendor1_id UUID := '4b035b71-e995-4338-a860-93fd6836fe3c';
  vendor2_id UUID := '852403e2-6e1d-48d8-90cc-053fb5d9b7eb';
  vendor3_id UUID := 'b497641b-fd85-45e8-b2df-8ad0f8759cd3';
  vendor4_id UUID := '0618c666-ac1b-4974-a769-5f80a8aed702';
  new_vendor_id UUID := '59d39e82-83a1-4440-9832-2bef0c86e737';
BEGIN
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