/*
  # Add Product Detail Fields

  1. New Columns
    - `color` (text) - Product color
    - `size_dimensions` (text) - Product size or dimensions
    - `care_instructions` (text) - Care instructions for the product
    - `material` (text) - Material composition
    - `shipping_timeline` (text) - Expected shipping timeline (e.g., "3-5 business days")
    - `stock_quantity` (integer) - Current stock quantity
    - `tags` (text[]) - Array of product tags (max 10)
    - `image_metadata` (jsonb) - Metadata about images (background, size, resolution)

  2. Changes
    - Add default values where appropriate
    - Update existing products to have default stock quantity

  3. Security
    - No RLS changes needed (existing policies apply)
*/

-- Add new columns to products table
DO $$
BEGIN
  -- Add color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'color'
  ) THEN
    ALTER TABLE products ADD COLUMN color text;
  END IF;

  -- Add size_dimensions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'size_dimensions'
  ) THEN
    ALTER TABLE products ADD COLUMN size_dimensions text;
  END IF;

  -- Add care_instructions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'care_instructions'
  ) THEN
    ALTER TABLE products ADD COLUMN care_instructions text;
  END IF;

  -- Add material column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'material'
  ) THEN
    ALTER TABLE products ADD COLUMN material text;
  END IF;

  -- Add shipping_timeline column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'shipping_timeline'
  ) THEN
    ALTER TABLE products ADD COLUMN shipping_timeline text;
  END IF;

  -- Add stock_quantity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;

  -- Add tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'tags'
  ) THEN
    ALTER TABLE products ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Add image_metadata column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_metadata'
  ) THEN
    ALTER TABLE products ADD COLUMN image_metadata jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create index on tags for faster searches
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);

-- Create index on stock_quantity for inventory queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products (stock_quantity);
