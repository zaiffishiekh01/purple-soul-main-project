/*
  # Add Product Source Tracking and Import System

  1. New Tables
    - `product_sources`
      - Track vendors, marketplaces, and research sources
      - Store contact information and verification status
    
    - `product_attributes`
      - Flexible key-value attributes for filtering
      - Material, size, color, dimensions, etc.
    
    - `product_tags`
      - Tagging system for discovery and search
    
    - `product_images_extended`
      - Additional images beyond primary image
      - Display order and metadata
    
  2. Modifications
    - Add source tracking columns to existing products table
    
  3. Security
    - Enable RLS on all new tables
    - Public read, authenticated write access
*/

-- Product Sources Table
CREATE TABLE IF NOT EXISTS product_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text,
  contact_email text,
  contact_phone text,
  source_type text NOT NULL CHECK (source_type IN ('vendor', 'marketplace', 'manufacturer', 'artisan', 'research')),
  is_verified boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified sources"
  ON product_sources FOR SELECT
  USING (is_verified = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sources"
  ON product_sources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sources"
  ON product_sources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sources"
  ON product_sources FOR DELETE
  TO authenticated
  USING (true);

-- Add source tracking columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'source_id'
  ) THEN
    ALTER TABLE products ADD COLUMN source_id uuid REFERENCES product_sources(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE products ADD COLUMN source_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'source_notes'
  ) THEN
    ALTER TABLE products ADD COLUMN source_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'material'
  ) THEN
    ALTER TABLE products ADD COLUMN material text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'origin'
  ) THEN
    ALTER TABLE products ADD COLUMN origin text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'craft_type'
  ) THEN
    ALTER TABLE products ADD COLUMN craft_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'dimensions'
  ) THEN
    ALTER TABLE products ADD COLUMN dimensions text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text UNIQUE;
  END IF;
END $$;

-- Product Attributes Table
CREATE TABLE IF NOT EXISTS product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  attribute_name text NOT NULL,
  attribute_value text NOT NULL,
  is_filterable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product attributes"
  ON product_attributes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert attributes"
  ON product_attributes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attributes"
  ON product_attributes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attributes"
  ON product_attributes FOR DELETE
  TO authenticated
  USING (true);

-- Product Tags Table
CREATE TABLE IF NOT EXISTS product_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, tag)
);

ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product tags"
  ON product_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert tags"
  ON product_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
  ON product_tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tags"
  ON product_tags FOR DELETE
  TO authenticated
  USING (true);

-- Product Images Extended Table
CREATE TABLE IF NOT EXISTS product_images_extended (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images extended"
  ON product_images_extended FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert product images"
  ON product_images_extended FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product images"
  ON product_images_extended FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product images"
  ON product_images_extended FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_filterable ON product_attributes(attribute_name, attribute_value) WHERE is_filterable = true;
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag);
CREATE INDEX IF NOT EXISTS idx_product_images_extended_product ON product_images_extended(product_id);