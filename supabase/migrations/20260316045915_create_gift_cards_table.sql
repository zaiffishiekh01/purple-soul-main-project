/*
  # Create Gift Cards System

  1. New Tables
    - `gift_cards`
      - `id` (uuid, primary key)
      - `code` (text, unique) - Gift card redemption code
      - `amount` (decimal) - Original gift card amount
      - `balance` (decimal) - Remaining balance
      - `purchaser_id` (uuid) - Reference to auth.users
      - `recipient_email` (text) - Recipient's email address
      - `recipient_name` (text) - Recipient's name
      - `message` (text, nullable) - Personal message
      - `delivery_date` (date) - When to deliver the gift card
      - `status` (text) - active, redeemed, expired
      - `redeemed_by` (uuid, nullable) - User who redeemed
      - `redeemed_at` (timestamptz, nullable) - When it was redeemed
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - Expiration date (1 year from creation)

  2. Security
    - Enable RLS on `gift_cards` table
    - Add policies for purchasers to view their sent gift cards
    - Add policies for recipients to view and redeem their gift cards
    - Add policy for authenticated users to create gift cards
*/

CREATE TABLE IF NOT EXISTS gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  balance decimal(10,2) NOT NULL CHECK (balance >= 0),
  purchaser_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  message text,
  delivery_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  redeemed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 year')
);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Purchasers can view their sent gift cards"
  ON gift_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = purchaser_id);

CREATE POLICY "Recipients can view gift cards sent to them"
  ON gift_cards FOR SELECT
  TO authenticated
  USING (
    recipient_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create gift cards"
  ON gift_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = purchaser_id);

CREATE POLICY "Recipients can redeem gift cards"
  ON gift_cards FOR UPDATE
  TO authenticated
  USING (
    recipient_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    recipient_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser ON gift_cards(purchaser_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient_email ON gift_cards(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
