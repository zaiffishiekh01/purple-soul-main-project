/*
  # Add Refund Transaction Tracking to Returns
  
  1. Changes
    - Add `refund_transaction_id` column to `returns` table to store Stripe refund ID
    - This enables tracking of actual payment refunds from Stripe
  
  2. Security
    - No RLS changes needed - inherits existing policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'returns' 
    AND column_name = 'refund_transaction_id'
  ) THEN
    ALTER TABLE returns 
    ADD COLUMN refund_transaction_id text;
  END IF;
END $$;

COMMENT ON COLUMN returns.refund_transaction_id IS 'Stripe refund transaction ID for tracking payment refunds';