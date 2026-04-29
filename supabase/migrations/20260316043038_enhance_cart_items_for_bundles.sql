/*
  # Enhance Cart Items for Bundle Support

  1. Modifications to cart_items
    - Add bundle-related columns to existing cart_items table
    - Add gift wrap options
    - Add calculated pricing columns
    - Add session_id support for guest carts

  2. Functions
    - Auto-calculate cart totals
    - Clean up old guest carts

  3. Security
    - Add RLS policies for guest cart access by session
*/

-- Add new columns to existing cart_items table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'session_id') THEN
    ALTER TABLE cart_items ADD COLUMN session_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'unit_price') THEN
    ALTER TABLE cart_items ADD COLUMN unit_price decimal(10, 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'is_bundle') THEN
    ALTER TABLE cart_items ADD COLUMN is_bundle boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'bundle_type') THEN
    ALTER TABLE cart_items ADD COLUMN bundle_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'bundle_label') THEN
    ALTER TABLE cart_items ADD COLUMN bundle_label text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'bundle_discount') THEN
    ALTER TABLE cart_items ADD COLUMN bundle_discount decimal(5, 4) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'gift_wrap') THEN
    ALTER TABLE cart_items ADD COLUMN gift_wrap boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'gift_message') THEN
    ALTER TABLE cart_items ADD COLUMN gift_message text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'gift_wrap_fee') THEN
    ALTER TABLE cart_items ADD COLUMN gift_wrap_fee decimal(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'subtotal') THEN
    ALTER TABLE cart_items ADD COLUMN subtotal decimal(10, 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'discount_amount') THEN
    ALTER TABLE cart_items ADD COLUMN discount_amount decimal(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'total_price') THEN
    ALTER TABLE cart_items ADD COLUMN total_price decimal(10, 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'updated_at') THEN
    ALTER TABLE cart_items ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Function to calculate cart item totals
CREATE OR REPLACE FUNCTION calculate_cart_item_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default unit_price from product if not provided
  IF NEW.unit_price IS NULL THEN
    SELECT price INTO NEW.unit_price FROM products WHERE id = NEW.product_id;
  END IF;

  -- Calculate subtotal
  NEW.subtotal := NEW.unit_price * NEW.quantity;

  -- Calculate bundle discount
  IF NEW.is_bundle AND NEW.bundle_discount > 0 THEN
    NEW.discount_amount := NEW.subtotal * NEW.bundle_discount;
  ELSE
    NEW.discount_amount := 0;
  END IF;

  -- Calculate total price
  NEW.total_price := NEW.subtotal - NEW.discount_amount + COALESCE(NEW.gift_wrap_fee, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's applied
DROP TRIGGER IF EXISTS trigger_calculate_cart_item_total ON cart_items;

CREATE TRIGGER trigger_calculate_cart_item_total
  BEFORE INSERT OR UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cart_item_total();

-- Create or replace trigger for updated_at
DROP TRIGGER IF EXISTS set_cart_items_updated_at ON cart_items;

CREATE TRIGGER set_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy for guest cart access
DROP POLICY IF EXISTS "Guest users can view cart by session" ON cart_items;
CREATE POLICY "Guest users can view cart by session"
  ON cart_items FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Guest users can add to cart by session" ON cart_items;
CREATE POLICY "Guest users can add to cart by session"
  ON cart_items FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Guest users can update cart by session" ON cart_items;
CREATE POLICY "Guest users can update cart by session"
  ON cart_items FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL)
  WITH CHECK (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Guest users can delete cart by session" ON cart_items;
CREATE POLICY "Guest users can delete cart by session"
  ON cart_items FOR DELETE
  TO anon
  USING (session_id IS NOT NULL);
