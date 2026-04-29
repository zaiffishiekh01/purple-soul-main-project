/*
  # Add Public Read Access to Products and Categories

  1. Changes
    - Add policy for anonymous users to read active products
    - Add policy for anonymous users to read all categories
    - Add policy for anonymous users to read active collections

  2. Security
    - Read-only access for public
    - Only active/published items visible
*/

-- Allow anonymous users to view categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Public can view categories'
  ) THEN
    CREATE POLICY "Public can view categories"
      ON categories FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Allow anonymous users to view active products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products' 
    AND policyname = 'Public can view active products'
  ) THEN
    CREATE POLICY "Public can view active products"
      ON products FOR SELECT
      TO anon
      USING (is_active = true);
  END IF;
END $$;

-- Allow anonymous users to view active collections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'collections' 
    AND policyname = 'Public can view active collections'
  ) THEN
    CREATE POLICY "Public can view active collections"
      ON collections FOR SELECT
      TO anon
      USING (is_active = true);
  END IF;
END $$;
