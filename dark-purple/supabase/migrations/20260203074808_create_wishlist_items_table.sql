/*
  # Create Wishlist Items Table

  1. New Tables
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users) - The user who added the item
      - `product_id` (uuid, references products) - The product in the wishlist
      - `added_at` (timestamptz) - When the item was added
      - `notes` (text, optional) - User notes about the item

  2. Security
    - Enable RLS on `wishlist_items` table
    - Add policies for authenticated users to manage their own wishlist items
    - Users can only view and modify their own wishlist items

  3. Performance
    - Add unique index on (user_id, product_id) to prevent duplicates
    - Add index on user_id for fast user wishlist lookups
    - Add index on added_at for sorting
*/

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate wishlist entries
CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_user_product_unique
ON wishlist_items(user_id, product_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id
ON wishlist_items(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id
ON wishlist_items(product_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_added_at
ON wishlist_items(added_at DESC);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON wishlist_items;

-- Create RLS policies for wishlist_items
CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_wishlist_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON wishlist_items;
CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_items_updated_at();