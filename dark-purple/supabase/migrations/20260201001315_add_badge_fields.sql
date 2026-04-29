/*
  # Add Badge Fields to Products

  1. New Columns
    - `craft_badges` (text array) - Handcrafted, Artisan Made, Small Batch, etc.
    - `experience_badges` (text array) - Quiet Design, Minimal Form, Contemplative Use, etc.
    - `curation_badge` (text) - Limited Run, Editor's Selection (only one)
    - `practical_badges` (text array) - Gift Ready, Ships Flat, Easy Returns

  2. Purpose
    - Enable curated badge system for product cards
    - Whisper, not shout - selective display
    - Maintain contemplative aesthetic
*/

-- Add craft badges (Handcrafted, Artisan Made, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'craft_badges'
  ) THEN
    ALTER TABLE products ADD COLUMN craft_badges text[] DEFAULT '{}';
  END IF;
END $$;

-- Add experience badges (Quiet Design, Minimal Form, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'experience_badges'
  ) THEN
    ALTER TABLE products ADD COLUMN experience_badges text[] DEFAULT '{}';
  END IF;
END $$;

-- Add curation badge (Limited Run, Editor's Selection - only one)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'curation_badge'
  ) THEN
    ALTER TABLE products ADD COLUMN curation_badge text DEFAULT NULL;
  END IF;
END $$;

-- Add practical badges (Gift Ready, Ships Flat, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'practical_badges'
  ) THEN
    ALTER TABLE products ADD COLUMN practical_badges text[] DEFAULT '{}';
  END IF;
END $$;
