/*
  # Add Enhanced Filter Fields to Products

  1. New Columns Added
    - `materials` (text array) - Materials used (Wood, Wool, Cotton, Silk, Leather, Stone, Metal, Mixed)
    - `handmade_process` (text array) - Craft processes (Handcrafted, Handwoven, Hand-embroidered, etc.)
    - `life_moments` (text array) - Life occasions (Birth & Welcome, Marriage & Union, New Home, etc.)
    - `use_contexts` (text array) - Where it's used (Home, Prayer Space, Study Area, Travel, Gift)
    - `care_level` (text) - Care requirement (Easy Care, Gentle Care, Occasional Care)
    - `availability` (text) - Stock status (In Stock, Made to Order, Limited Run)
    - `gift_ready` (boolean) - Whether item is gift-ready

  2. Purpose
    - Enable meaningful filtering that helps users feel more certain
    - Support handmade credibility and artisan storytelling
    - Align with Abrahamic life rhythms and sacred use contexts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'materials'
  ) THEN
    ALTER TABLE products ADD COLUMN materials text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'handmade_process'
  ) THEN
    ALTER TABLE products ADD COLUMN handmade_process text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'life_moments'
  ) THEN
    ALTER TABLE products ADD COLUMN life_moments text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'use_contexts'
  ) THEN
    ALTER TABLE products ADD COLUMN use_contexts text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'care_level'
  ) THEN
    ALTER TABLE products ADD COLUMN care_level text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'availability'
  ) THEN
    ALTER TABLE products ADD COLUMN availability text DEFAULT 'In Stock';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'gift_ready'
  ) THEN
    ALTER TABLE products ADD COLUMN gift_ready boolean DEFAULT false;
  END IF;
END $$;

COMMENT ON COLUMN products.materials IS 'Materials used in the product (Wood, Wool, Cotton, Silk, Leather, Stone, Metal, Mixed Natural Materials)';
COMMENT ON COLUMN products.handmade_process IS 'Handmade craft processes (Handcrafted, Handwoven, Hand-embroidered, Hand-carved, Hand-bound, Small Batch)';
COMMENT ON COLUMN products.life_moments IS 'Life occasions this product is suitable for (Birth & Welcome, Marriage & Union, New Home, Healing, Mourning & Remembrance, Pilgrimage)';
COMMENT ON COLUMN products.use_contexts IS 'Context where product is used (Home, Prayer Space, Study Area, Travel, Gift)';
COMMENT ON COLUMN products.care_level IS 'Care requirement level (Easy Care, Gentle Care, Occasional Care)';
COMMENT ON COLUMN products.availability IS 'Stock availability (In Stock, Made to Order, Limited Run)';
COMMENT ON COLUMN products.gift_ready IS 'Whether the product comes gift-ready';
