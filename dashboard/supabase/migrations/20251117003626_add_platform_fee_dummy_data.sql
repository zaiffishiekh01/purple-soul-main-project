/*
  # Add Platform Fee Dummy Data

  1. Data
    - Set platform fees for existing vendors
    - Create sample payout requests with different statuses
*/

-- Set platform fees for vendors (5-10% commission)
INSERT INTO platform_fees (vendor_id, fee_percentage, fee_type, created_by)
SELECT 
  id,
  (RANDOM() * 5 + 5)::numeric(5,2), -- Random fee between 5% and 10%
  'percentage',
  (SELECT user_id FROM admin_users LIMIT 1)
FROM vendors
ON CONFLICT DO NOTHING;

-- Create sample payout requests
INSERT INTO payout_requests (vendor_id, amount, platform_fee, net_amount, status, request_date, notes)
SELECT 
  v.id,
  (RANDOM() * 5000 + 1000)::numeric(10,2), -- Random amount between $1000-$6000
  0, -- Will be calculated
  0, -- Will be calculated
  CASE 
    WHEN RANDOM() < 0.3 THEN 'pending'
    WHEN RANDOM() < 0.6 THEN 'approved'
    WHEN RANDOM() < 0.8 THEN 'completed'
    ELSE 'rejected'
  END,
  NOW() - (RANDOM() * INTERVAL '30 days'),
  'Payout request for monthly earnings'
FROM vendors v
LIMIT 10
ON CONFLICT DO NOTHING;

-- Update platform_fee and net_amount based on vendor fees
UPDATE payout_requests pr
SET 
  platform_fee = pr.amount * (pf.fee_percentage / 100),
  net_amount = pr.amount - (pr.amount * (pf.fee_percentage / 100))
FROM platform_fees pf
WHERE pr.vendor_id = pf.vendor_id;
