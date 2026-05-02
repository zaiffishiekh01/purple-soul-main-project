/*
  # Fix Payout Workflow Issues

  This migration fixes critical issues preventing the payout workflow from functioning:
  
  1. Adds missing columns to transactions table
  2. Fixes RLS policies for admin notification insertion
  3. Updates the transaction creation trigger
*/

-- Add missing columns to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'transaction_date'
  ) THEN
    ALTER TABLE transactions ADD COLUMN transaction_date TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payout_request_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payout_request_id UUID REFERENCES payout_requests(id);
  END IF;
END $$;

-- Fix notifications RLS to allow admin inserts
DROP POLICY IF EXISTS "Admins can insert notifications for any vendor" ON notifications;
CREATE POLICY "Admins can insert notifications for any vendor"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Update the transaction creation trigger to use correct columns
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
      payout_request_id,
      transaction_date,
      created_at
    ) VALUES (
      NEW.vendor_id,
      'payout',
      NEW.net_amount,
      'Payout completed - Request #' || LEFT(NEW.id::TEXT, 8) || ' | Platform fee: $' || NEW.platform_fee::TEXT,
      'completed',
      NEW.id,
      NEW.transfer_completed_date,
      NOW()
    )
    RETURNING id INTO new_transaction_id;

    NEW.transaction_id := new_transaction_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS auto_create_payout_transaction ON payout_requests;
CREATE TRIGGER auto_create_payout_transaction
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_payout_transaction();