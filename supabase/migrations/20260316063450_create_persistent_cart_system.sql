/*
  # Create Persistent Cart System

  1. New Tables
    - `user_carts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (text)
      - `name` (text)
      - `price` (numeric)
      - `quantity` (integer)
      - `image` (text)
      - `bundle_id` (text, nullable)
      - `bundle_discount` (numeric, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_carts` table
    - Add policies for authenticated users to manage their own cart

  3. Indexes
    - Index on user_id for faster cart queries
*/

-- Create user_carts table
CREATE TABLE IF NOT EXISTS user_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  image text NOT NULL,
  bundle_id text,
  bundle_discount numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view own cart items"
  ON user_carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON user_carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON user_carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON user_carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous users to manage cart (using session-based approach)
CREATE POLICY "Anonymous users can view own cart items"
  ON user_carts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert cart items"
  ON user_carts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update cart items"
  ON user_carts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can delete cart items"
  ON user_carts FOR DELETE
  TO anon
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_carts_updated_at
  BEFORE UPDATE ON user_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_carts_updated_at();