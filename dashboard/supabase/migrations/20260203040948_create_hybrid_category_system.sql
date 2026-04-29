/*
  # Create Hybrid Category System

  This migration implements a hybrid category system with:
  - Flat "Category Groups" (existing 7 categories)
  - Hierarchical "Catalog Taxonomy" (tree structure)
  - Mapping between taxonomy nodes and category groups

  ## Changes

  1. Rename existing categories table to category_groups
  2. Create new hierarchical categories table with parent_id
  3. Create category_group_mappings table
  4. Update products table to reference taxonomy
  5. Migrate existing data
  6. Add comprehensive indexes and RLS policies

  ## Security
  - Enable RLS on all new tables
  - Admin users can manage all categories
  - Vendors can read categories for product assignment
*/

-- Step 1: Rename existing categories table to category_groups
ALTER TABLE IF EXISTS categories RENAME TO category_groups;

-- Step 2: Create new hierarchical categories table (Catalog Taxonomy)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '📦',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  level integer DEFAULT 0,
  path text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 3: Create category group mappings table
CREATE TABLE IF NOT EXISTS category_group_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES category_groups(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, group_id)
);

-- Step 4: Add category_id to products (for hierarchical taxonomy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_category_group_mappings_category_id ON category_group_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_category_group_mappings_group_id ON category_group_mappings(group_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Step 6: Create function to update category path and level
CREATE OR REPLACE FUNCTION update_category_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.level = 0;
    NEW.path = NEW.id::text;
  ELSE
    SELECT level + 1, path || '.' || NEW.id::text
    INTO NEW.level, NEW.path
    FROM categories
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category hierarchy
DROP TRIGGER IF EXISTS trigger_update_category_hierarchy ON categories;
CREATE TRIGGER trigger_update_category_hierarchy
  BEFORE INSERT OR UPDATE OF parent_id ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_hierarchy();

-- Step 7: Enable RLS
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_group_mappings ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for category_groups
CREATE POLICY "Anyone can view active category groups"
  ON category_groups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage category groups"
  ON category_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Step 9: Create RLS policies for categories (hierarchical taxonomy)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Step 10: Create RLS policies for category_group_mappings
CREATE POLICY "Anyone can view category group mappings"
  ON category_group_mappings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage category group mappings"
  ON category_group_mappings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Step 11: Create initial taxonomy data (sample structure)
INSERT INTO categories (name, slug, description, icon, display_order, parent_id, is_active) VALUES
  ('Islamic Art', 'islamic-art', 'Traditional and contemporary Islamic art pieces', '🎨', 1, NULL, true),
  ('Home Decor', 'home-decor', 'Items for beautifying your home', '🏠', 2, NULL, true),
  ('Fashion', 'fashion', 'Modest and Islamic fashion items', '👗', 3, NULL, true),
  ('Books & Media', 'books-media', 'Islamic books, audio, and digital content', '📚', 4, NULL, true),
  ('Wellness', 'wellness', 'Products for spiritual and physical wellness', '🧘', 5, NULL, true),
  ('Jewelry', 'jewelry', 'Islamic jewelry and accessories', '💍', 6, NULL, true)
ON CONFLICT (slug) DO NOTHING;

-- Step 12: Create sample sub-categories
DO $$
DECLARE
  art_id uuid;
  home_id uuid;
  fashion_id uuid;
  books_id uuid;
BEGIN
  SELECT id INTO art_id FROM categories WHERE slug = 'islamic-art';
  SELECT id INTO home_id FROM categories WHERE slug = 'home-decor';
  SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion';
  SELECT id INTO books_id FROM categories WHERE slug = 'books-media';

  -- Islamic Art subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
    ('Calligraphy', 'calligraphy', art_id, 1),
    ('Geometric Patterns', 'geometric-patterns', art_id, 2),
    ('Canvas Prints', 'canvas-prints', art_id, 3),
    ('Wall Art', 'wall-art', art_id, 4)
  ON CONFLICT (slug) DO NOTHING;

  -- Home Decor subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
    ('Prayer Rugs', 'prayer-rugs', home_id, 1),
    ('Cushions & Pillows', 'cushions-pillows', home_id, 2),
    ('Table Decor', 'table-decor', home_id, 3),
    ('Lighting', 'lighting', home_id, 4)
  ON CONFLICT (slug) DO NOTHING;

  -- Fashion subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
    ('Hijabs & Scarves', 'hijabs-scarves', fashion_id, 1),
    ('Abayas', 'abayas', fashion_id, 2),
    ('Modest Dresses', 'modest-dresses', fashion_id, 3),
    ('Men''s Wear', 'mens-wear', fashion_id, 4)
  ON CONFLICT (slug) DO NOTHING;

  -- Books & Media subcategories
  INSERT INTO categories (name, slug, parent_id, display_order) VALUES
    ('Quran & Tafsir', 'quran-tafsir', books_id, 1),
    ('Islamic History', 'islamic-history', books_id, 2),
    ('Children''s Books', 'childrens-books', books_id, 3),
    ('Audio Books', 'audio-books', books_id, 4),
    ('Digital Downloads', 'digital-downloads', books_id, 5)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Step 13: Create default mappings from taxonomy to category groups
DO $$
DECLARE
  art_group_id uuid;
  jewelry_group_id uuid;
  home_group_id uuid;
  fashion_group_id uuid;
  wellness_group_id uuid;
  digital_group_id uuid;
  audio_group_id uuid;
BEGIN
  SELECT id INTO art_group_id FROM category_groups WHERE slug = 'art-wall-decor';
  SELECT id INTO jewelry_group_id FROM category_groups WHERE slug = 'jewelry-accessories';
  SELECT id INTO home_group_id FROM category_groups WHERE slug = 'home-living';
  SELECT id INTO fashion_group_id FROM category_groups WHERE slug = 'fashion-apparel';
  SELECT id INTO wellness_group_id FROM category_groups WHERE slug = 'wellness-meditation';
  SELECT id INTO digital_group_id FROM category_groups WHERE slug = 'digital-books';
  SELECT id INTO audio_group_id FROM category_groups WHERE slug = 'audio-spectrum';

  -- Map taxonomy categories to groups
  INSERT INTO category_group_mappings (category_id, group_id)
  SELECT c.id, art_group_id
  FROM categories c
  WHERE c.slug IN ('islamic-art', 'calligraphy', 'geometric-patterns', 'canvas-prints', 'wall-art')
  ON CONFLICT DO NOTHING;

  INSERT INTO category_group_mappings (category_id, group_id)
  SELECT c.id, home_group_id
  FROM categories c
  WHERE c.slug IN ('home-decor', 'prayer-rugs', 'cushions-pillows', 'table-decor', 'lighting')
  ON CONFLICT DO NOTHING;

  INSERT INTO category_group_mappings (category_id, group_id)
  SELECT c.id, fashion_group_id
  FROM categories c
  WHERE c.slug IN ('fashion', 'hijabs-scarves', 'abayas', 'modest-dresses', 'mens-wear')
  ON CONFLICT DO NOTHING;

  INSERT INTO category_group_mappings (category_id, group_id)
  SELECT c.id, jewelry_group_id
  FROM categories c
  WHERE c.slug = 'jewelry'
  ON CONFLICT DO NOTHING;

  INSERT INTO category_group_mappings (category_id, group_id)
  SELECT c.id, wellness_group_id
  FROM categories c
  WHERE c.slug = 'wellness'
  ON CONFLICT DO NOTHING;

  INSERT INTO category_group_mappings (category_id, group_id)
  SELECT c.id, digital_group_id
  FROM categories c
  WHERE c.slug IN ('digital-downloads', 'quran-tafsir', 'islamic-history', 'childrens-books')
  ON CONFLICT DO NOTHING;

  INSERT INTO category_group_mappings (category_id, group_id)
  SELECT c.id, audio_group_id
  FROM categories c
  WHERE c.slug IN ('audio-books', 'books-media')
  ON CONFLICT DO NOTHING;
END $$;

-- Step 14: Add updated_at trigger for new tables
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_category_groups_updated_at ON category_groups;
CREATE TRIGGER trigger_category_groups_updated_at
  BEFORE UPDATE ON category_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON categories;
CREATE TRIGGER trigger_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();