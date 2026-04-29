/*
  # Create Facet/Filter System

  This migration implements a dynamic facet/filter system for storefront filtering.
  Facets are admin-controlled attributes like "Faith Tradition", "Material", "Purpose", etc.

  ## Changes

  1. Create facet_groups table (e.g., Faith Tradition, Material, Purpose)
  2. Create facet_values table (e.g., Islamic, Wood, Meditation)
  3. Create category_facets table (maps facets to categories)
  4. Create product_facets table (assigns facet values to products)
  5. Add comprehensive indexes and RLS policies

  ## Security
  - Enable RLS on all new tables
  - Admin users can manage all facets
  - Vendors can read facets and assign values to their products
  - Public can read active facets for filtering
*/

-- Step 1: Create facet_groups table
CREATE TABLE IF NOT EXISTS facet_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Create facet_values table
CREATE TABLE IF NOT EXISTS facet_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facet_group_id uuid NOT NULL REFERENCES facet_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(facet_group_id, slug)
);

-- Step 3: Create category_facets mapping table
CREATE TABLE IF NOT EXISTS category_facets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  facet_group_id uuid NOT NULL REFERENCES facet_groups(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, facet_group_id)
);

-- Step 4: Create product_facets assignment table
CREATE TABLE IF NOT EXISTS product_facets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  facet_value_id uuid NOT NULL REFERENCES facet_values(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, facet_value_id)
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_facet_values_group_id ON facet_values(facet_group_id);
CREATE INDEX IF NOT EXISTS idx_facet_values_slug ON facet_values(slug);
CREATE INDEX IF NOT EXISTS idx_category_facets_category_id ON category_facets(category_id);
CREATE INDEX IF NOT EXISTS idx_category_facets_facet_group_id ON category_facets(facet_group_id);
CREATE INDEX IF NOT EXISTS idx_product_facets_product_id ON product_facets(product_id);
CREATE INDEX IF NOT EXISTS idx_product_facets_facet_value_id ON product_facets(facet_value_id);

-- Step 6: Enable RLS
ALTER TABLE facet_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE facet_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_facets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_facets ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for facet_groups
CREATE POLICY "Anyone can view active facet groups"
  ON facet_groups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all facet groups"
  ON facet_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage facet groups"
  ON facet_groups FOR ALL
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

-- Step 8: Create RLS policies for facet_values
CREATE POLICY "Anyone can view active facet values"
  ON facet_values FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM facet_groups
      WHERE id = facet_values.facet_group_id
      AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can view all facet values"
  ON facet_values FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage facet values"
  ON facet_values FOR ALL
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

-- Step 9: Create RLS policies for category_facets
CREATE POLICY "Anyone can view category facets"
  ON category_facets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage category facets"
  ON category_facets FOR ALL
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

-- Step 10: Create RLS policies for product_facets
CREATE POLICY "Anyone can view product facets"
  ON product_facets FOR SELECT
  USING (true);

CREATE POLICY "Vendors can manage their product facets"
  ON product_facets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      WHERE p.id = product_facets.product_id
      AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can delete their product facets"
  ON product_facets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      WHERE p.id = product_facets.product_id
      AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all product facets"
  ON product_facets FOR ALL
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

-- Step 11: Add updated_at triggers
CREATE TRIGGER trigger_facet_groups_updated_at
  BEFORE UPDATE ON facet_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_facet_values_updated_at
  BEFORE UPDATE ON facet_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Step 12: Create sample facet groups
INSERT INTO facet_groups (name, slug, description, display_order) VALUES
  ('Faith Tradition', 'faith-tradition', 'Religious or spiritual tradition', 1),
  ('Purpose', 'purpose', 'Intended use or purpose', 2),
  ('Material', 'material', 'Primary materials used', 3),
  ('Craft Origin', 'craft-origin', 'Geographic origin of the craft', 4),
  ('Style', 'style', 'Design style or aesthetic', 5),
  ('Occasion', 'occasion', 'Suitable occasions', 6),
  ('Color Family', 'color-family', 'Primary color palette', 7)
ON CONFLICT (slug) DO NOTHING;

-- Step 13: Create sample facet values
DO $$
DECLARE
  faith_id uuid;
  purpose_id uuid;
  material_id uuid;
  origin_id uuid;
  style_id uuid;
  occasion_id uuid;
  color_id uuid;
BEGIN
  SELECT id INTO faith_id FROM facet_groups WHERE slug = 'faith-tradition';
  SELECT id INTO purpose_id FROM facet_groups WHERE slug = 'purpose';
  SELECT id INTO material_id FROM facet_groups WHERE slug = 'material';
  SELECT id INTO origin_id FROM facet_groups WHERE slug = 'craft-origin';
  SELECT id INTO style_id FROM facet_groups WHERE slug = 'style';
  SELECT id INTO occasion_id FROM facet_groups WHERE slug = 'occasion';
  SELECT id INTO color_id FROM facet_groups WHERE slug = 'color-family';

  -- Faith Tradition values
  INSERT INTO facet_values (facet_group_id, name, slug, display_order) VALUES
    (faith_id, 'Islamic', 'islamic', 1),
    (faith_id, 'Christian', 'christian', 2),
    (faith_id, 'Jewish', 'jewish', 3),
    (faith_id, 'Buddhist', 'buddhist', 4),
    (faith_id, 'Hindu', 'hindu', 5),
    (faith_id, 'Multi-Faith', 'multi-faith', 6),
    (faith_id, 'Spiritual', 'spiritual', 7)
  ON CONFLICT DO NOTHING;

  -- Purpose values
  INSERT INTO facet_values (facet_group_id, name, slug, display_order) VALUES
    (purpose_id, 'Prayer & Meditation', 'prayer-meditation', 1),
    (purpose_id, 'Home Decoration', 'home-decoration', 2),
    (purpose_id, 'Personal Adornment', 'personal-adornment', 3),
    (purpose_id, 'Gift Giving', 'gift-giving', 4),
    (purpose_id, 'Study & Learning', 'study-learning', 5),
    (purpose_id, 'Celebration', 'celebration', 6),
    (purpose_id, 'Daily Use', 'daily-use', 7)
  ON CONFLICT DO NOTHING;

  -- Material values
  INSERT INTO facet_values (facet_group_id, name, slug, display_order) VALUES
    (material_id, 'Wood', 'wood', 1),
    (material_id, 'Cotton', 'cotton', 2),
    (material_id, 'Silk', 'silk', 3),
    (material_id, 'Wool', 'wool', 4),
    (material_id, 'Leather', 'leather', 5),
    (material_id, 'Metal', 'metal', 6),
    (material_id, 'Stone', 'stone', 7),
    (material_id, 'Glass', 'glass', 8),
    (material_id, 'Ceramic', 'ceramic', 9),
    (material_id, 'Paper', 'paper', 10),
    (material_id, 'Digital', 'digital', 11)
  ON CONFLICT DO NOTHING;

  -- Craft Origin values
  INSERT INTO facet_values (facet_group_id, name, slug, display_order) VALUES
    (origin_id, 'Middle East', 'middle-east', 1),
    (origin_id, 'North Africa', 'north-africa', 2),
    (origin_id, 'South Asia', 'south-asia', 3),
    (origin_id, 'Southeast Asia', 'southeast-asia', 4),
    (origin_id, 'Central Asia', 'central-asia', 5),
    (origin_id, 'Mediterranean', 'mediterranean', 6),
    (origin_id, 'Handmade USA', 'handmade-usa', 7)
  ON CONFLICT DO NOTHING;

  -- Style values
  INSERT INTO facet_values (facet_group_id, name, slug, display_order) VALUES
    (style_id, 'Traditional', 'traditional', 1),
    (style_id, 'Contemporary', 'contemporary', 2),
    (style_id, 'Minimalist', 'minimalist', 3),
    (style_id, 'Ornate', 'ornate', 4),
    (style_id, 'Geometric', 'geometric', 5),
    (style_id, 'Calligraphic', 'calligraphic', 6)
  ON CONFLICT DO NOTHING;

  -- Occasion values
  INSERT INTO facet_values (facet_group_id, name, slug, display_order) VALUES
    (occasion_id, 'Ramadan', 'ramadan', 1),
    (occasion_id, 'Eid', 'eid', 2),
    (occasion_id, 'Wedding', 'wedding', 3),
    (occasion_id, 'Birth', 'birth', 4),
    (occasion_id, 'Everyday', 'everyday', 5),
    (occasion_id, 'Special Occasions', 'special-occasions', 6)
  ON CONFLICT DO NOTHING;

  -- Color Family values
  INSERT INTO facet_values (facet_group_id, name, slug, display_order) VALUES
    (color_id, 'Neutral', 'neutral', 1),
    (color_id, 'Earth Tones', 'earth-tones', 2),
    (color_id, 'Blue', 'blue', 3),
    (color_id, 'Green', 'green', 4),
    (color_id, 'Red', 'red', 5),
    (color_id, 'Gold', 'gold', 6),
    (color_id, 'Black & White', 'black-white', 7),
    (color_id, 'Multicolor', 'multicolor', 8)
  ON CONFLICT DO NOTHING;
END $$;

-- Step 14: Create default category-facet mappings
DO $$
DECLARE
  faith_id uuid;
  purpose_id uuid;
  material_id uuid;
  origin_id uuid;
  style_id uuid;
  occasion_id uuid;
  color_id uuid;
BEGIN
  SELECT id INTO faith_id FROM facet_groups WHERE slug = 'faith-tradition';
  SELECT id INTO purpose_id FROM facet_groups WHERE slug = 'purpose';
  SELECT id INTO material_id FROM facet_groups WHERE slug = 'material';
  SELECT id INTO origin_id FROM facet_groups WHERE slug = 'craft-origin';
  SELECT id INTO style_id FROM facet_groups WHERE slug = 'style';
  SELECT id INTO occasion_id FROM facet_groups WHERE slug = 'occasion';
  SELECT id INTO color_id FROM facet_groups WHERE slug = 'color-family';

  -- Map facets to all leaf categories (categories without children)
  INSERT INTO category_facets (category_id, facet_group_id, is_required)
  SELECT c.id, faith_id, false
  FROM categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM categories child WHERE child.parent_id = c.id
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO category_facets (category_id, facet_group_id, is_required)
  SELECT c.id, purpose_id, false
  FROM categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM categories child WHERE child.parent_id = c.id
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO category_facets (category_id, facet_group_id, is_required)
  SELECT c.id, material_id, true
  FROM categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM categories child WHERE child.parent_id = c.id
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO category_facets (category_id, facet_group_id, is_required)
  SELECT c.id, origin_id, false
  FROM categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM categories child WHERE child.parent_id = c.id
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO category_facets (category_id, facet_group_id, is_required)
  SELECT c.id, style_id, false
  FROM categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM categories child WHERE child.parent_id = c.id
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO category_facets (category_id, facet_group_id, is_required)
  SELECT c.id, color_id, false
  FROM categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM categories child WHERE child.parent_id = c.id
  )
  ON CONFLICT DO NOTHING;
END $$;