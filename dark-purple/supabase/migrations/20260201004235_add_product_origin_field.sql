/*
  # Add Origin Field to Products

  1. Changes
    - Add `origin` column to products table to store the craft region/origin
    - Valid values: Kashmir, Anatolia, Levant, Maghreb, Andalusia
  
  2. Purpose
    - Enable filtering products by their geographic/spiritual origin
    - Support the Spiritual Geography Framework
    - Add trust signals and craft authenticity
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'origin'
  ) THEN
    ALTER TABLE products ADD COLUMN origin text;
  END IF;
END $$;

COMMENT ON COLUMN products.origin IS 'Geographic/spiritual origin of the product craft (Kashmir, Anatolia, Levant, Maghreb, Andalusia)';
