/*
  # Complete Payout Workflow System

  ## Overview
  This migration implements a complete payout workflow with proper state transitions,
  bank transfer tracking, and admin actions for each stage.

  ## Payout Workflow States
  1. PENDING - Vendor submitted, awaiting admin review
  2. APPROVED - Admin approved, ready for bank processing
  3. PROCESSING - Bank transfer initiated, in progress
  4. COMPLETED - Funds transferred successfully
  5. FAILED - Bank transfer failed, needs retry
  6. REJECTED - Admin rejected the request

  ## New Features
  - Bank transfer tracking
  - Payment batch management
  - Automatic transaction creation on completion
  - Retry mechanism for failed transfers
  - Admin actions for each state

  ## Database Changes
  1. Add new columns to payout_requests table
  2. Create payment_batches table
  3. Create bank_transfer_logs table
  4. Add helper functions for workflow automation
*/

-- =====================================================
-- 1. EXTEND PAYOUT_REQUESTS TABLE
-- =====================================================

DO $$
BEGIN
  -- Add bank_transfer_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'bank_transfer_id'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN bank_transfer_id TEXT;
  END IF;

  -- Add transfer_initiated_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'transfer_initiated_date'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN transfer_initiated_date TIMESTAMPTZ;
  END IF;

  -- Add transfer_completed_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'transfer_completed_date'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN transfer_completed_date TIMESTAMPTZ;
  END IF;

  -- Add failure_reason column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'failure_reason'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN failure_reason TEXT;
  END IF;

  -- Add retry_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'retry_count'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN retry_count INTEGER DEFAULT 0;
  END IF;

  -- Add payment_batch_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'payment_batch_id'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN payment_batch_id UUID;
  END IF;

  -- Add transaction_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN transaction_id UUID;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE PAYMENT_BATCHES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  initiated_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment batches"
  ON payment_batches FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create payment batches"
  ON payment_batches FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update payment batches"
  ON payment_batches FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_payment_batches_status ON payment_batches(status);
CREATE INDEX IF NOT EXISTS idx_payment_batches_created_at ON payment_batches(created_at DESC);

-- =====================================================
-- 3. CREATE BANK_TRANSFER_LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bank_transfer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_request_id UUID NOT NULL REFERENCES payout_requests(id) ON DELETE CASCADE,
  transfer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  initiated_by UUID REFERENCES auth.users(id),
  response_data JSONB,
  error_message TEXT,
  retry_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bank_transfer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view transfer logs"
  ON bank_transfer_logs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert transfer logs"
  ON bank_transfer_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_bank_transfer_logs_payout_request ON bank_transfer_logs(payout_request_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_logs_status ON bank_transfer_logs(status);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_logs_created_at ON bank_transfer_logs(created_at DESC);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to auto-create transaction when payout completes
CREATE OR REPLACE FUNCTION create_payout_transaction()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_transaction_id UUID;
BEGIN
  -- Only create transaction when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Create transaction record
    INSERT INTO transactions (
      vendor_id,
      type,
      amount,
      description,
      status,
      reference_id,
      transaction_date
    ) VALUES (
      NEW.vendor_id,
      'payout',
      NEW.net_amount,
      'Payout request #' || LEFT(NEW.id::TEXT, 8) || ' - Platform fee: $' || NEW.platform_fee::TEXT,
      'completed',
      NEW.id::TEXT,
      NEW.transfer_completed_date
    )
    RETURNING id INTO new_transaction_id;

    -- Link transaction to payout request
    NEW.transaction_id := new_transaction_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auto transaction creation
DROP TRIGGER IF EXISTS auto_create_payout_transaction ON payout_requests;
CREATE TRIGGER auto_create_payout_transaction
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_payout_transaction();

-- Function to generate batch number
CREATE OR REPLACE FUNCTION generate_batch_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  batch_num TEXT;
BEGIN
  batch_num := 'BATCH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((
    SELECT COUNT(*) + 1
    FROM payment_batches
    WHERE DATE(created_at) = CURRENT_DATE
  )::TEXT, 4, '0');
  RETURN batch_num;
END;
$$;

COMMENT ON TABLE payout_requests IS 'Vendor payout requests with complete workflow: pending → approved → processing → completed/failed';
COMMENT ON TABLE payment_batches IS 'Groups multiple payout requests for batch processing';
COMMENT ON TABLE bank_transfer_logs IS 'Audit trail of all bank transfer attempts and results';
