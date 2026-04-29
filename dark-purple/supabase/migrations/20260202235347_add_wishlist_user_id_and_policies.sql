/*
  # Enhance Wishlist System

  1. Schema Changes
    - Add user_id column to wishlist_items for direct user access
    - Add unique constraint to prevent duplicate wishlist entries
    - Add indexes for performance
  
  2. Security Changes
    - Enable RLS on wishlist_items
    - Add policies for users to manage their own wishlist items
    - Users can only view and modify their own wishlist items
  
  3. Performance
    - Add index on (user_id, product_id) for fast lookups
    - Add index on user_id for listing user wishlists
*/

-- Add user_id column to wishlist_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlist_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
    
    -- Populate user_id from wishlists table for existing records
    UPDATE wishlist_items wi
    SET user_id = w.user_id
    FROM wishlists w
    WHERE wi.wishlist_id = w.id;
    
    -- Make user_id NOT NULL after populating
    ALTER TABLE wishlist_items ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint to prevent duplicate wishlist entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wishlist_items_user_product_unique'
  ) THEN
    ALTER TABLE wishlist_items 
    ADD CONSTRAINT wishlist_items_user_product_unique 
    UNIQUE (user_id, product_id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id 
ON wishlist_items(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_product 
ON wishlist_items(user_id, product_id);

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
