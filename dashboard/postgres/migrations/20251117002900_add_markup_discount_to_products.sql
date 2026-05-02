/*
  # Add markup and discount columns to products table

  1. Changes
    - Add `markup_amount` column to store admin-set markup (can be $ or %)
    - Add `markup_type` column to track if markup is 'amount' or 'percent'
    - Add `discount_amount` column to store admin-set discount (can be $ or %)
    - Add `discount_type` column to track if discount is 'amount' or 'percent'
    - Add `final_price` column to store the calculated final price after markup/discount
  
  2. Notes
    - markup_amount: positive value added to cost price
    - discount_amount: positive value subtracted from price
    - final_price: auto-calculated based on cost + markup - discount
    - Both markup and discount can be percentage or fixed amount
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'markup_amount'
  ) THEN
    ALTER TABLE products ADD COLUMN markup_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'markup_type'
  ) THEN
    ALTER TABLE products ADD COLUMN markup_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE products ADD COLUMN discount_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'discount_type'
  ) THEN
    ALTER TABLE products ADD COLUMN discount_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'final_price'
  ) THEN
    ALTER TABLE products ADD COLUMN final_price numeric;
  END IF;
END $$;

COMMENT ON COLUMN products.markup_amount IS 'Markup amount or percentage applied by admin to cost price';
COMMENT ON COLUMN products.markup_type IS 'Type of markup: amount or percent';
COMMENT ON COLUMN products.discount_amount IS 'Discount amount or percentage applied by admin';
COMMENT ON COLUMN products.discount_type IS 'Type of discount: amount or percent';
COMMENT ON COLUMN products.final_price IS 'Final calculated price after markup and discount';
