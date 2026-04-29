/*
  # Fix Wishlist Items Schema

  1. Changes
    - Make wishlist_id nullable since we're using direct user_id access now
    - Remove the old wishlist-based policy that conflicts with direct user access
  
  2. Notes
    - This allows wishlist items to work with direct user_id without requiring a wishlist parent
    - Maintains backward compatibility for existing wishlist-based items
*/

-- Make wishlist_id nullable to support direct user access
ALTER TABLE wishlist_items 
ALTER COLUMN wishlist_id DROP NOT NULL;

-- Drop the old wishlist-based policy that might conflict
DROP POLICY IF EXISTS "Users can manage own wishlist items" ON wishlist_items;

-- Drop the public view policy as we want wishlist items to be private by default
DROP POLICY IF EXISTS "Anyone can view public wishlist items" ON wishlist_items;