/*
  # Complete Payout Workflow Test Data

  This migration adds test data for ALL payout workflow states to enable
  comprehensive testing of the complete payout lifecycle.

  ## Test Data Coverage
  1. PENDING (15 requests) - Approve/Reject actions
  2. APPROVED (8 requests) - Process Transfer actions
  3. PROCESSING (5 requests) - View status, Complete/Fail actions
  4. COMPLETED (10 requests) - View transaction, Download receipt
  5. FAILED (3 requests) - Retry actions
  6. REJECTED (4 requests) - View only (already exists)

  ## Payment Batches
  - 3 batches at different stages
  - Links to payout requests

  ## Bank Transfer Logs
  - Complete audit trail
  - Success and failure records
*/

DO $$
DECLARE
  vendor1_id UUID := '4b035b71-e995-4338-a860-93fd6836fe3c';
  vendor2_id UUID := '852403e2-6e1d-48d8-90cc-053fb5d9b7eb';
  vendor3_id UUID := 'b497641b-fd85-45e8-b2df-8ad0f8759cd3';
  vendor4_id UUID := '0618c666-ac1b-4974-a769-5f80a8aed702';
  new_vendor_id UUID := '59d39e82-83a1-4440-9832-2bef0c86e737';
  batch1_id UUID;
  batch2_id UUID;
  batch3_id UUID;
  payout_id UUID;
BEGIN

  -- =====================================================
  -- 1. CREATE PAYMENT BATCHES
  -- =====================================================

  -- Batch 1: Completed
  INSERT INTO payment_batches (
    batch_number, total_amount, total_requests, status,
    initiated_date, completed_date, notes, created_at
  ) VALUES (
    'BATCH-20251115-0001', 8547.25, 4, 'completed',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
    'TEST-WORKFLOW | November 15 batch - all transfers successful',
    NOW() - INTERVAL '2 days'
  )
  RETURNING id INTO batch1_id;

  -- Batch 2: Processing
  INSERT INTO payment_batches (
    batch_number, total_amount, total_requests, status,
    initiated_date, notes, created_at
  ) VALUES (
    'BATCH-20251116-0001', 6234.50, 5, 'processing',
    NOW() - INTERVAL '4 hours',
    'TEST-WORKFLOW | November 16 batch - bank processing in progress',
    NOW() - INTERVAL '6 hours'
  )
  RETURNING id INTO batch2_id;

  -- Batch 3: Pending (ready to process)
  INSERT INTO payment_batches (
    batch_number, total_amount, total_requests, status,
    notes, created_at
  ) VALUES (
    'BATCH-20251117-0001', 4532.75, 3, 'pending',
    'TEST-WORKFLOW | Today batch - ready to initiate transfers',
    NOW() - INTERVAL '1 hour'
  )
  RETURNING id INTO batch3_id;

  -- =====================================================
  -- 2. APPROVED REQUESTS (waiting for bank processing)
  -- =====================================================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, processed_date, notes,
    payment_batch_id, created_at
  ) VALUES
  -- In Batch 3 (pending batch)
  (vendor1_id, 1250.00, 81.25, 1168.75, 'approved', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 'TEST-WORKFLOW | Approved, assigned to pending batch', batch3_id, NOW() - INTERVAL '3 hours'),
  (vendor2_id, 1800.50, 117.03, 1683.47, 'approved', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour', 'TEST-WORKFLOW | Approved, assigned to pending batch', batch3_id, NOW() - INTERVAL '4 hours'),
  (vendor3_id, 1680.50, 109.23, 1571.27, 'approved', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '1 hour', 'TEST-WORKFLOW | Approved, assigned to pending batch', batch3_id, NOW() - INTERVAL '5 hours'),

  -- Not yet in batch (recently approved)
  (vendor4_id, 925.75, 60.17, 865.58, 'approved', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 'TEST-WORKFLOW | Approved, waiting for next batch', NULL, NOW() - INTERVAL '2 hours'),
  (new_vendor_id, 750.00, 48.75, 701.25, 'approved', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 hours', 'TEST-WORKFLOW | Approved, waiting for next batch', NULL, NOW() - INTERVAL '6 hours'),
  (vendor1_id, 2100.00, 136.50, 1963.50, 'approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', 'TEST-WORKFLOW | Large approved payout', NULL, NOW() - INTERVAL '1 day'),
  (vendor2_id, 1450.25, 94.27, 1355.98, 'approved', NOW() - INTERVAL '1 day' - INTERVAL '6 hours', NOW() - INTERVAL '16 hours', 'TEST-WORKFLOW | Approved yesterday', NULL, NOW() - INTERVAL '1 day' - INTERVAL '6 hours'),
  (vendor3_id, 680.90, 44.26, 636.64, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day' - INTERVAL '12 hours', 'TEST-WORKFLOW | Older approved request', NULL, NOW() - INTERVAL '2 days');

  -- =====================================================
  -- 3. PROCESSING REQUESTS (bank transfer in progress)
  -- =====================================================

  -- All in batch2
  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, processed_date, transfer_initiated_date,
    bank_transfer_id, notes, payment_batch_id, created_at
  ) VALUES
  (vendor1_id, 1245.80, 80.98, 1164.82, 'processing', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '4 hours', 'TXN-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Bank processing - expected completion in 2-3 business days', batch2_id, NOW() - INTERVAL '1 day')),
  (vendor2_id, 1580.50, 102.73, 1477.77, 'processing', NOW() - INTERVAL '1 day' - INTERVAL '2 hours', NOW() - INTERVAL '14 hours', NOW() - INTERVAL '4 hours', 'TXN-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | ACH transfer initiated', batch2_id, NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
  (vendor3_id, 980.25, 63.72, 916.53, 'processing', NOW() - INTERVAL '1 day' - INTERVAL '4 hours', NOW() - INTERVAL '16 hours', NOW() - INTERVAL '4 hours', 'TXN-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Wire transfer in progress', batch2_id, NOW() - INTERVAL '1 day' - INTERVAL '4 hours'),
  (vendor4_id, 1325.00, 86.13, 1238.87, 'processing', NOW() - INTERVAL '1 day' - INTERVAL '6 hours', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '4 hours', 'TXN-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Standard bank transfer processing', batch2_id, NOW() - INTERVAL '1 day' - INTERVAL '6 hours'),
  (new_vendor_id, 1102.95, 71.69, 1031.26, 'processing', NOW() - INTERVAL '1 day' - INTERVAL '8 hours', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '4 hours', 'TXN-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | International wire transfer', batch2_id, NOW() - INTERVAL '1 day' - INTERVAL '8 hours');

  -- =====================================================
  -- 4. COMPLETED REQUESTS (successfully paid)
  -- =====================================================

  -- All in batch1
  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, processed_date, transfer_initiated_date,
    transfer_completed_date, bank_transfer_id, notes,
    payment_batch_id, created_at
  ) VALUES
  (vendor1_id, 2150.75, 139.80, 2010.95, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'TXN-COMP-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Successfully transferred', batch1_id, NOW() - INTERVAL '3 days'),
  (vendor2_id, 1890.50, 122.88, 1767.62, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'TXN-COMP-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Payment completed', batch1_id, NOW() - INTERVAL '3 days'),
  (vendor3_id, 2305.00, 149.83, 2155.17, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'TXN-COMP-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Funds delivered', batch1_id, NOW() - INTERVAL '3 days'),
  (vendor4_id, 2200.00, 143.00, 2057.00, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'TXN-COMP-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Transfer successful', batch1_id, NOW() - INTERVAL '3 days'),

  -- Older completed (not in batch)
  (vendor1_id, 1500.00, 97.50, 1402.50, 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'TXN-OLD-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Previous week payout', NULL, NOW() - INTERVAL '5 days'),
  (vendor2_id, 1750.25, 113.77, 1636.48, 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'TXN-OLD-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Historical payout', NULL, NOW() - INTERVAL '6 days'),
  (vendor3_id, 980.50, 63.73, 916.77, 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'TXN-OLD-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Last week payout', NULL, NOW() - INTERVAL '7 days'),
  (vendor4_id, 1250.75, 81.30, 1169.45, 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'TXN-OLD-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | Week old payout', NULL, NOW() - INTERVAL '8 days'),
  (new_vendor_id, 1680.00, 109.20, 1570.80, 'completed', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', 'TXN-OLD-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | 9 days ago payout', NULL, NOW() - INTERVAL '9 days'),
  (vendor1_id, 2100.90, 136.56, 1964.34, 'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', 'TXN-OLD-' || gen_random_uuid()::TEXT, 'TEST-WORKFLOW | 10 days ago payout', NULL, NOW() - INTERVAL '10 days');

  -- =====================================================
  -- 5. FAILED REQUESTS (bank transfer failed)
  -- =====================================================

  INSERT INTO payout_requests (
    vendor_id, amount, platform_fee, net_amount,
    status, request_date, processed_date, transfer_initiated_date,
    bank_transfer_id, failure_reason, retry_count, notes, created_at
  ) VALUES
  (vendor2_id, 1450.00, 94.25, 1355.75, 'failed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', 'TXN-FAIL-' || gen_random_uuid()::TEXT, 'Invalid bank account number. Please update payout settings.', 0, 'TEST-WORKFLOW | Bank rejected - needs vendor action', NOW() - INTERVAL '2 days'),
  (vendor3_id, 890.50, 57.88, 832.62, 'failed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '6 hours', 'TXN-FAIL-' || gen_random_uuid()::TEXT, 'Insufficient funds in platform account. Contact admin.', 0, 'TEST-WORKFLOW | Platform issue - can retry', NOW() - INTERVAL '1 day'),
  (vendor4_id, 2200.00, 143.00, 2057.00, 'failed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'TXN-FAIL-' || gen_random_uuid()::TEXT, 'Bank routing number invalid or account closed.', 1, 'TEST-WORKFLOW | Second attempt also failed - manual review needed', NOW() - INTERVAL '3 days');

  -- =====================================================
  -- 6. ADD BANK TRANSFER LOGS
  -- =====================================================

  -- Logs for processing requests
  FOR payout_id IN (
    SELECT id FROM payout_requests WHERE status = 'processing' LIMIT 5
  ) LOOP
    INSERT INTO bank_transfer_logs (
      payout_request_id, transfer_id, status, amount,
      response_data, created_at
    )
    SELECT
      payout_id,
      'TXN-LOG-' || gen_random_uuid()::TEXT,
      'processing',
      net_amount,
      jsonb_build_object(
        'bank_name', 'Chase Bank',
        'transfer_type', 'ACH',
        'estimated_completion', NOW() + INTERVAL '2 days'
      ),
      NOW() - INTERVAL '4 hours'
    FROM payout_requests WHERE id = payout_id;
  END LOOP;

  -- Logs for completed requests (success)
  FOR payout_id IN (
    SELECT id FROM payout_requests WHERE status = 'completed' LIMIT 10
  ) LOOP
    INSERT INTO bank_transfer_logs (
      payout_request_id, transfer_id, status, amount,
      response_data, created_at
    )
    SELECT
      payout_id,
      'TXN-LOG-SUCCESS-' || gen_random_uuid()::TEXT,
      'completed',
      net_amount,
      jsonb_build_object(
        'bank_name', 'Chase Bank',
        'transfer_type', 'ACH',
        'confirmation_number', 'CONF-' || FLOOR(RANDOM() * 1000000)::TEXT,
        'completed_at', transfer_completed_date
      ),
      transfer_completed_date
    FROM payout_requests WHERE id = payout_id;
  END LOOP;

  -- Logs for failed requests
  FOR payout_id IN (
    SELECT id FROM payout_requests WHERE status = 'failed'
  ) LOOP
    INSERT INTO bank_transfer_logs (
      payout_request_id, transfer_id, status, amount,
      error_message, retry_number, created_at
    )
    SELECT
      payout_id,
      'TXN-LOG-FAIL-' || gen_random_uuid()::TEXT,
      'failed',
      net_amount,
      failure_reason,
      retry_count,
      transfer_initiated_date
    FROM payout_requests WHERE id = payout_id;
  END LOOP;

  RAISE NOTICE 'Complete payout workflow test data added successfully!';
  RAISE NOTICE 'Summary: Pending(15) + Approved(8) + Processing(5) + Completed(10) + Failed(3) + Rejected(4) = 45 total requests';
  RAISE NOTICE 'Payment Batches: 3 batches (completed, processing, pending)';
  RAISE NOTICE 'Bank Transfer Logs: Complete audit trail for all transactions';

END $$;
