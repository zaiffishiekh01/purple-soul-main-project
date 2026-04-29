/*
  # Enhance Wishlist System with Smart Features

  1. New Columns Added to `wishlist_items`
    - `added_date` (timestamptz) - When item was added
    - `price_alert_threshold` (numeric) - Alert when price drops below this
    - `in_stock_notification` (boolean) - Notify when back in stock
    - `price_at_addition` (numeric) - Original price when added
    - `current_price` (numeric) - Current price (updated)
    - `times_viewed` (integer) - Track user interest
    - `last_viewed` (timestamptz) - Last time user viewed this item
    - `moved_to_cart_count` (integer) - How many times moved to cart then removed
    - `product_data` (jsonb) - Cached product details for fast loading

  2. New Columns for `wishlists`
    - `occasion_type` (text) - wedding, birthday, religious_celebration, etc.
    - `budget` (numeric) - Total budget for wishlist
    - `total_value` (numeric) - Total value of all items
    - `items_count` (integer) - Number of items
    - `completed_items_count` (integer) - Items purchased
    - `notification_preferences` (jsonb) - Price drops, stock alerts, etc.

  3. Purpose
    - Smart price tracking and alerts
    - Interest-based recommendations
    - Budget management
    - Stock notifications
    - Analytics and insights
*/

-- Add smart tracking columns to wishlist_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'added_date'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN added_date timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'price_alert_threshold'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN price_alert_threshold numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'in_stock_notification'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN in_stock_notification boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'price_at_addition'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN price_at_addition numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'current_price'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN current_price numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'times_viewed'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN times_viewed integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'last_viewed'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN last_viewed timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'moved_to_cart_count'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN moved_to_cart_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'product_data'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN product_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add smart management columns to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'occasion_type'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN occasion_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'budget'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN budget numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'total_value'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN total_value numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'items_count'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN items_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'completed_items_count'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN completed_items_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN notification_preferences jsonb DEFAULT '{"price_drops": true, "stock_alerts": true, "recommendations": true}'::jsonb;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_items_added_date ON wishlist_items(added_date DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_priority ON wishlist_items(priority);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_last_viewed ON wishlist_items(last_viewed DESC);
CREATE INDEX IF NOT EXISTS idx_wishlists_occasion_type ON wishlists(occasion_type);
