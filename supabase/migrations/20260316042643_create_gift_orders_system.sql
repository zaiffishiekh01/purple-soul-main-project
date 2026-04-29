/*
  # Create Gift Orders System

  1. New Tables
    - `gift_orders`
      - Stores all gift purchases including gift cards and send-as-gift orders
      - Tracks sender and recipient information
      - Manages delivery scheduling and status
      - Links to products for send-as-gift orders

  2. Security
    - Enable RLS on `gift_orders` table
    - Add policies for authenticated users to manage their gift orders
    - Recipients can view gifts sent to them

  3. Features
    - Gift card purchases with custom amounts and designs
    - Send products as gifts with personalized messages
    - Schedule gift delivery for future dates
    - Track gift delivery status
    - Anonymous gift sending option
*/

-- Create gift_orders table
CREATE TABLE IF NOT EXISTS gift_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('send-gift', 'gift-card')),

  -- Product reference (for send-gift type)
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,

  -- Amount (for gift cards or product price)
  amount decimal(10, 2) NOT NULL,

  -- Recipient information
  recipient_name text NOT NULL,
  recipient_email text NOT NULL,

  -- Sender information
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Gift details
  message text,
  delivery_date timestamptz NOT NULL DEFAULT now(),
  gift_wrap boolean DEFAULT false,
  include_receipt boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,

  -- Gift card specific
  design text,
  code text UNIQUE,
  redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  redeemed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status tracking
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'scheduled', 'sent', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Delivery tracking
  sent_at timestamptz,
  delivered_at timestamptz,
  tracking_number text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_gift_orders_sender_email ON gift_orders(sender_email);
CREATE INDEX IF NOT EXISTS idx_gift_orders_recipient_email ON gift_orders(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gift_orders_sender_user_id ON gift_orders(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_orders_product_id ON gift_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_gift_orders_status ON gift_orders(status);
CREATE INDEX IF NOT EXISTS idx_gift_orders_code ON gift_orders(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gift_orders_delivery_date ON gift_orders(delivery_date);

-- Function to generate unique gift card code
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..16 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    IF i % 4 = 0 AND i < 16 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate gift card code for gift card orders
CREATE OR REPLACE FUNCTION set_gift_card_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'gift-card' AND NEW.code IS NULL THEN
    NEW.code := generate_gift_card_code();

    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM gift_orders WHERE code = NEW.code) LOOP
      NEW.code := generate_gift_card_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_gift_card_code
  BEFORE INSERT ON gift_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_gift_card_code();

-- Trigger to update updated_at timestamp
CREATE TRIGGER set_gift_orders_updated_at
  BEFORE UPDATE ON gift_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE gift_orders ENABLE ROW LEVEL SECURITY;

-- Policies for senders (authenticated users)
CREATE POLICY "Users can view their sent gifts"
  ON gift_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can create gift orders"
  ON gift_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Users can update their gift orders"
  ON gift_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_user_id)
  WITH CHECK (auth.uid() = sender_user_id);

-- Policy for recipients to view gifts sent to them (by email)
CREATE POLICY "Recipients can view their gifts by email"
  ON gift_orders FOR SELECT
  TO authenticated
  USING (
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status IN ('sent', 'delivered')
  );

-- Policy for redeeming gift cards
CREATE POLICY "Users can redeem gift cards"
  ON gift_orders FOR UPDATE
  TO authenticated
  USING (
    type = 'gift-card'
    AND NOT redeemed
    AND status = 'sent'
  )
  WITH CHECK (
    type = 'gift-card'
    AND redeemed = true
    AND redeemed_by = auth.uid()
  );

-- Public policy for viewing gift cards by code (for redemption)
CREATE POLICY "Anyone can view gift card by code"
  ON gift_orders FOR SELECT
  TO authenticated
  USING (
    type = 'gift-card'
    AND code IS NOT NULL
  );

-- Create view for gift order summaries
CREATE OR REPLACE VIEW gift_order_summaries AS
SELECT
  go.*,
  p.name as product_name,
  p.image_url as product_image,
  CASE
    WHEN go.type = 'gift-card' THEN 'Gift Card - $' || go.amount::text
    ELSE p.name
  END as gift_description
FROM gift_orders go
LEFT JOIN products p ON go.product_id = p.id;

-- Grant permissions on the view
GRANT SELECT ON gift_order_summaries TO authenticated;
