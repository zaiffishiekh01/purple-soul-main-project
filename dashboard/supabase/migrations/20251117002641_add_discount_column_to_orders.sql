/*
  # Add discount column to orders table

  1. Changes
    - Add `discount_amount` column to track discounts applied by admins
    - Add `discount_type` column to track if discount was fixed amount or percentage
    - Add `discount_note` column for admin notes about the discount
    - Update total_amount to account for discounts
  
  2. Notes
    - discount_amount stores the calculated discount value
    - discount_type can be 'amount' or 'percent'
    - Original subtotal remains unchanged for reference
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_note'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_note text;
  END IF;
END $$;

COMMENT ON COLUMN orders.discount_amount IS 'Discount amount applied by admin';
COMMENT ON COLUMN orders.discount_type IS 'Type of discount: amount or percent';
COMMENT ON COLUMN orders.discount_note IS 'Admin notes about the discount';
