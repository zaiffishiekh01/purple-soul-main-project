/*
  # Add More PENDING Payout Requests for Admin Action Testing

  This migration adds additional PENDING payout requests to ensure the Actions column
  is populated with approve/reject buttons for comprehensive workflow testing.

  ## Purpose
  - Ensure PENDING requests appear in default view
  - Provide multiple requests to test approve action
  - Provide multiple requests to test reject action with reasons
  - Various amounts and vendors for diverse testing

  ## Actions Column Testing
  - Each PENDING request shows green ✅ Approve button
  - Each PENDING request shows red ❌ Reject button
  - Clicking Reject opens modal for rejection reason
  - Clicking Approve immediately processes

  ## Distribution
  - 15 PENDING requests (prominently visible)
  - Various amounts ($100 - $8,000)
  - All active vendors represented
  - Recent timestamps (last 3 days)
*/

-- Add 15 more PENDING payout requests for action testing
DO $$
DECLARE
  vendor1_id UUID;
  vendor2_id UUID;
  vendor3_id UUID;
  vendor4_id UUID;
  new_vendor_id UUID;
BEGIN
  -- Get vendor IDs
  SELECT id INTO vendor1_id FROM vendors WHERE business_name LIKE '%Demo Vendor 1%' OR business_name = 'Artisan Crafts Co' LIMIT 1;
  SELECT id INTO vendor2_id FROM vendors WHERE business_name LIKE '%Demo Vendor 2%' LIMIT 1;
  SELECT id INTO vendor3_id FROM vendors WHERE business_name LIKE '%Demo Vendor 3%' LIMIT 1;
  SELECT id INTO vendor4_id FROM vendors WHERE business_name LIKE '%Demo Vendor 4%' LIMIT 1;
  SELECT id INTO new_vendor_id FROM vendors WHERE contact_email = 'fk.envca@gmail.com' LIMIT 1;

  -- =====================================================
  -- ADDITIONAL PENDING REQUESTS (15 more)
  -- =====================================================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, notes, created_at
  ) VALUES

  -- Very recent pending (high priority - test quick approve)
  (
    vendor1_id, 425.50, 27.66, 397.84,
    'pending', NOW() - INTERVAL '1 hour',
    'TEST-PAYOUT-ACTIONS | Urgent weekly payout', NOW() - INTERVAL '1 hour'
  ),
  (
    vendor2_id, 680.75, 42.87, 637.88,
    'pending', NOW() - INTERVAL '2 hours',
    'TEST-PAYOUT-ACTIONS | Standard bi-weekly request', NOW() - INTERVAL '2 hours'
  ),
  (
    new_vendor_id, 315.90, 22.11, 293.79,
    'pending', NOW() - INTERVAL '3 hours',
    'TEST-PAYOUT-ACTIONS | First payout this week', NOW() - INTERVAL '3 hours'
  ),
  (
    vendor3_id, 892.40, 80.32, 812.08,
    'pending', NOW() - INTERVAL '4 hours',
    'TEST-PAYOUT-ACTIONS | Month-end sales payout', NOW() - INTERVAL '4 hours'
  ),
  (
    vendor4_id, 550.00, 45.10, 504.90,
    'pending', NOW() - INTERVAL '5 hours',
    'TEST-PAYOUT-ACTIONS | Regular payout cycle', NOW() - INTERVAL '5 hours'
  ),

  -- Medium amounts - today (test approve workflow)
  (
    vendor1_id, 1125.80, 73.18, 1052.62,
    'pending', NOW() - INTERVAL '8 hours',
    'TEST-PAYOUT-ACTIONS | Large order payment', NOW() - INTERVAL '8 hours'
  ),
  (
    vendor2_id, 1450.25, 91.37, 1358.88,
    'pending', NOW() - INTERVAL '10 hours',
    'TEST-PAYOUT-ACTIONS | Special promotion earnings', NOW() - INTERVAL '10 hours'
  ),
  (
    new_vendor_id, 975.60, 68.29, 907.31,
    'pending', NOW() - INTERVAL '12 hours',
    'TEST-PAYOUT-ACTIONS | Bulk order fulfillment', NOW() - INTERVAL '12 hours'
  ),

  -- Yesterday - aging (test approve and reject)
  (
    vendor3_id, 2100.00, 189.00, 1911.00,
    'pending', NOW() - INTERVAL '1 day' - INTERVAL '2 hours',
    'TEST-PAYOUT-ACTIONS | Large quarterly payout', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'
  ),
  (
    vendor4_id, 1680.50, 137.80, 1542.70,
    'pending', NOW() - INTERVAL '1 day' - INTERVAL '6 hours',
    'TEST-PAYOUT-ACTIONS | Consolidated weekly sales', NOW() - INTERVAL '1 day' - INTERVAL '6 hours'
  ),
  (
    vendor1_id, 780.30, 50.72, 729.58,
    'pending', NOW() - INTERVAL '1 day' - INTERVAL '10 hours',
    'TEST-PAYOUT-ACTIONS | Mid-month payout request', NOW() - INTERVAL '1 day' - INTERVAL '10 hours'
  ),

  -- 2 days ago - needs attention (test reject with reasons)
  (
    vendor2_id, 3500.00, 220.50, 3279.50,
    'pending', NOW() - INTERVAL '2 days' - INTERVAL '3 hours',
    'TEST-PAYOUT-ACTIONS | High value payout request', NOW() - INTERVAL '2 days' - INTERVAL '3 hours'
  ),
  (
    new_vendor_id, 495.75, 34.70, 461.05,
    'pending', NOW() - INTERVAL '2 days' - INTERVAL '8 hours',
    'TEST-PAYOUT-ACTIONS | Small business weekly payout', NOW() - INTERVAL '2 days' - INTERVAL '8 hours'
  ),
  (
    vendor3_id, 5200.00, 468.00, 4732.00,
    'pending', NOW() - INTERVAL '2 days' - INTERVAL '12 hours',
    'TEST-PAYOUT-ACTIONS | Largest pending request - needs review', NOW() - INTERVAL '2 days' - INTERVAL '12 hours'
  ),

  -- 3 days old - critical aging (test reject for review)
  (
    vendor4_id, 1890.90, 155.05, 1735.85,
    'pending', NOW() - INTERVAL '3 days',
    'TEST-PAYOUT-ACTIONS | AGING REQUEST - needs immediate action', NOW() - INTERVAL '3 days'
  );

  RAISE NOTICE 'Added 15 additional PENDING payout requests for action testing!';

END $$;

-- Create a helpful view for admins to see pending requests quickly
CREATE OR REPLACE VIEW admin_pending_payouts AS
SELECT
  pr.id,
  pr.vendor_id,
  v.business_name,
  v.contact_email,
  pr.amount,
  pr.platform_fee,
  pr.net_amount,
  pr.status,
  pr.request_date,
  pr.notes,
  EXTRACT(EPOCH FROM (NOW() - pr.request_date))/3600 AS hours_pending
FROM payout_requests pr
JOIN vendors v ON pr.vendor_id = v.id
WHERE pr.status = 'pending'
ORDER BY pr.request_date ASC;

COMMENT ON VIEW admin_pending_payouts IS 'Quick view of pending payout requests sorted by age for admin action';

-- Add helpful comment
COMMENT ON TABLE payout_requests IS 'Vendor payout requests - PENDING status shows approve/reject actions in admin UI';
