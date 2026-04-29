/*
  # Complete Payout Workflow System
*/

-- =====================================================
-- 1. EXTEND PAYOUT_REQUESTS TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'bank_transfer_id'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN bank_transfer_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'transfer_initiated_date'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN transfer_initiated_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'transfer_completed_date'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN transfer_completed_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'failure_reason'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN failure_reason TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'retry_count'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN retry_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'payment_batch_id'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN payment_batch_id UUID;
  END IF;

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
  created_by UUID,
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

DROP POLICY IF EXISTS "Admins can manage payment batches" ON payment_batches;
CREATE POLICY "Admins can manage payment batches"
  ON payment_batches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

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
  initiated_by UUID,
  response_data JSONB,
  error_message TEXT,
  retry_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bank_transfer_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage transfer logs" ON bank_transfer_logs;
CREATE POLICY "Admins can manage transfer logs"
  ON bank_transfer_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_bank_transfer_logs_payout_request ON bank_transfer_logs(payout_request_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_logs_status ON bank_transfer_logs(status);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_logs_created_at ON bank_transfer_logs(created_at DESC);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION create_payout_transaction()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_transaction_id UUID;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
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

    NEW.transaction_id := new_transaction_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_create_payout_transaction ON payout_requests;
CREATE TRIGGER auto_create_payout_transaction
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_payout_transaction();

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