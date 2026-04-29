/*
  # Add Spiritual Depth and Craft Integrity Fields

  1. New Columns Added
    - `practice_depth` (text) - Practice intensity level (Everyday Use, Dedicated Practice, Occasional / Ceremonial)
    - `time_to_make` (text) - Estimated time artisan takes to create item
    - `purpose_description` (text) - Brief explanation of why this item exists and its intended use
    - `artisan_info` (text) - Information about maker/production process

  2. Purpose
    - Support practice depth filtering for different spiritual intensity levels
    - Humanize production through time-to-make transparency
    - Add meaning through purpose descriptions
    - Honor craft integrity with artisan information
    
  3. Philosophy
    - These fields elevate the platform from transactional to meaningful
    - They protect against dilution and preserve spiritual dignity
    - They build trust without bureaucracy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'practice_depth'
  ) THEN
    ALTER TABLE products ADD COLUMN practice_depth text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'time_to_make'
  ) THEN
    ALTER TABLE products ADD COLUMN time_to_make text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'purpose_description'
  ) THEN
    ALTER TABLE products ADD COLUMN purpose_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'artisan_info'
  ) THEN
    ALTER TABLE products ADD COLUMN artisan_info text DEFAULT 'Produced in small batches by independent artisans.';
  END IF;
END $$;

COMMENT ON COLUMN products.practice_depth IS 'Practice intensity level: Everyday Use, Dedicated Practice, or Occasional / Ceremonial';
COMMENT ON COLUMN products.time_to_make IS 'Estimated time to create this item (e.g., "3-5 days", "1-2 weeks")';
COMMENT ON COLUMN products.purpose_description IS 'Brief description of why this exists and its intended spiritual use';
COMMENT ON COLUMN products.artisan_info IS 'Information about the maker and production process';
