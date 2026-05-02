/*
  # Create Catalog, Facet Filter, and Carrier Integration System

  ## New Tables Created:

  1. **category_groups** - Top-level flat category groups (Art, Jewelry, etc.)
     - id, name, slug, description, icon, display_order, is_active, is_system

  2. **categories** - Hierarchical product taxonomy
     - id, parent_id, name, slug, description, icon, display_order, is_active, is_system, level, path

  3. **facet_groups** - Filter group definitions (Faith Tradition, Material, etc.)
     - id, name, slug, description, display_order, is_active

  4. **facet_values** - Individual filter values within groups
     - id, facet_group_id, name, slug, description, display_order, is_active

  5. **category_facets** - Maps facet groups to categories
     - id, category_id, facet_group_id, is_required

  6. **product_facets** - Assigns facet values to products
     - id, product_id, facet_value_id

  7. **carrier_integrations** - Shipping carrier definitions
     - id, carrier_name, carrier_code, api_endpoint, is_active, supports_rates, supports_labels, supports_tracking, configuration

  ## Security:
  - RLS enabled on all tables
  - Admins can full CRUD on all catalog/facet/carrier tables
  - Vendors and public can read active categories, facet groups, facet values
  - Vendors can read/write their own product_facets

  ## Seed Data:
  - 7 default category groups
  - Default taxonomy categories per group
  - 7 default facet groups with values
  - 4 default shipping carriers (DHL, FedEx, UPS, USPS)
*/

-- ============================================================
-- CATEGORY GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS category_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  icon text DEFAULT '📦',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage category groups" ON category_groups;
DROP POLICY IF EXISTS "Anyone can view active category groups" ON category_groups;

CREATE POLICY "Admins can manage category groups"
  ON category_groups FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Anyone can view active category groups"
  ON category_groups FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- CATEGORIES (hierarchical taxonomy)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  icon text DEFAULT '📁',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  level integer DEFAULT 0,
  path text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pre-existing DBs: hybrid migration created categories without is_system; IF NOT EXISTS skips new columns
DO $catcols$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'category_groups' AND column_name = 'is_system'
  ) THEN
    ALTER TABLE public.category_groups ADD COLUMN is_system boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'is_system'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN is_system boolean DEFAULT false;
  END IF;
END $catcols$;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Vendors and public can view active categories" ON categories;

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors and public can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- FACET GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS facet_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE facet_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage facet groups" ON facet_groups;
DROP POLICY IF EXISTS "Vendors and public can view active facet groups" ON facet_groups;

CREATE POLICY "Admins can manage facet groups"
  ON facet_groups FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors and public can view active facet groups"
  ON facet_groups FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- FACET VALUES
-- ============================================================
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

ALTER TABLE facet_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage facet values" ON facet_values;
DROP POLICY IF EXISTS "Vendors and public can view active facet values" ON facet_values;

CREATE POLICY "Admins can manage facet values"
  ON facet_values FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors and public can view active facet values"
  ON facet_values FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- CATEGORY FACETS (maps facet groups to categories)
-- ============================================================
CREATE TABLE IF NOT EXISTS category_facets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  facet_group_id uuid NOT NULL REFERENCES facet_groups(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, facet_group_id)
);

ALTER TABLE category_facets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage category facets" ON category_facets;
DROP POLICY IF EXISTS "Vendors can view category facet mappings" ON category_facets;

CREATE POLICY "Admins can manage category facets"
  ON category_facets FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view category facet mappings"
  ON category_facets FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- PRODUCT FACETS (assigns facet values to products)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_facets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  facet_value_id uuid NOT NULL REFERENCES facet_values(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, facet_value_id)
);

ALTER TABLE product_facets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can manage their product facets" ON product_facets;
DROP POLICY IF EXISTS "Admins can view all product facets" ON product_facets;

CREATE POLICY "Vendors can manage their product facets"
  ON product_facets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = product_facets.product_id
        AND v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = product_facets.product_id
        AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all product facets"
  ON product_facets FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- ============================================================
-- CARRIER INTEGRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS carrier_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_name text NOT NULL,
  carrier_code text NOT NULL UNIQUE,
  api_endpoint text DEFAULT '',
  is_active boolean DEFAULT true,
  supports_rates boolean DEFAULT true,
  supports_labels boolean DEFAULT true,
  supports_tracking boolean DEFAULT true,
  configuration jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carrier_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage carrier integrations" ON carrier_integrations;
DROP POLICY IF EXISTS "Vendors can view active carriers" ON carrier_integrations;

CREATE POLICY "Admins can manage carrier integrations"
  ON carrier_integrations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active carriers"
  ON carrier_integrations FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- FIX SHIPMENTS TABLE - add actual_delivery column if missing
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shipments' AND column_name = 'actual_delivery'
  ) THEN
    ALTER TABLE shipments ADD COLUMN actual_delivery timestamptz;
  END IF;
END $$;

-- ============================================================
-- ADD category_id TO PRODUCTS IF MISSING
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_category_groups_slug ON category_groups(slug);
CREATE INDEX IF NOT EXISTS idx_category_groups_active ON category_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
CREATE INDEX IF NOT EXISTS idx_facet_values_group ON facet_values(facet_group_id);
CREATE INDEX IF NOT EXISTS idx_facet_values_active ON facet_values(is_active);
CREATE INDEX IF NOT EXISTS idx_category_facets_category ON category_facets(category_id);
CREATE INDEX IF NOT EXISTS idx_category_facets_group ON category_facets(facet_group_id);
CREATE INDEX IF NOT EXISTS idx_product_facets_product ON product_facets(product_id);
CREATE INDEX IF NOT EXISTS idx_product_facets_value ON product_facets(facet_value_id);
CREATE INDEX IF NOT EXISTS idx_carrier_integrations_code ON carrier_integrations(carrier_code);

-- ============================================================
-- SEED DATA: Category Groups
-- ============================================================
INSERT INTO category_groups (name, slug, description, icon, display_order, is_active, is_system) VALUES
  ('Art & Wall Decor', 'art-wall-decor', 'Islamic calligraphy, paintings, and wall art', '🎨', 1, true, true),
  ('Jewelry & Accessories', 'jewelry-accessories', 'Rings, necklaces, bracelets, and accessories', '💎', 2, true, true),
  ('Home & Living', 'home-living', 'Decorative items for home and living spaces', '🏠', 3, true, true),
  ('Fashion & Apparel', 'fashion-apparel', 'Islamic modest fashion and clothing', '👗', 4, true, true),
  ('Wellness & Meditation', 'wellness-meditation', 'Prayer beads, incense, and wellness items', '🧘', 5, true, true),
  ('Digital Books', 'digital-books', 'Islamic e-books, PDFs, and digital literature', '📚', 6, true, true),
  ('Audio Spectrum', 'audio-spectrum', 'Nasheeds, Quran recitations, and audio content', '🎵', 7, true, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Categories (Taxonomy)
-- ============================================================
INSERT INTO categories (name, slug, description, icon, display_order, is_active, is_system, level, path) VALUES
  ('Art & Wall Decor', 'art-wall-decor', 'Islamic calligraphy, paintings, and wall art', '🎨', 1, true, true, 0, 'art-wall-decor'),
  ('Jewelry & Accessories', 'jewelry-accessories', 'Rings, necklaces, bracelets, and accessories', '💎', 2, true, true, 0, 'jewelry-accessories'),
  ('Home & Living', 'home-living', 'Decorative items for home and living spaces', '🏠', 3, true, true, 0, 'home-living'),
  ('Fashion & Apparel', 'fashion-apparel', 'Islamic modest fashion and clothing', '👗', 4, true, true, 0, 'fashion-apparel'),
  ('Wellness & Meditation', 'wellness-meditation', 'Prayer beads, incense, and wellness items', '🧘', 5, true, true, 0, 'wellness-meditation'),
  ('Digital Books', 'digital-books', 'Islamic e-books, PDFs, and digital literature', '📚', 6, true, true, 0, 'digital-books'),
  ('Audio Spectrum', 'audio-spectrum', 'Nasheeds, Quran recitations, and audio content', '🎵', 7, true, true, 0, 'audio-spectrum')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  art_id uuid;
  jewelry_id uuid;
  home_id uuid;
  fashion_id uuid;
  wellness_id uuid;
  digital_id uuid;
  audio_id uuid;
BEGIN
  SELECT id INTO art_id FROM categories WHERE slug = 'art-wall-decor';
  SELECT id INTO jewelry_id FROM categories WHERE slug = 'jewelry-accessories';
  SELECT id INTO home_id FROM categories WHERE slug = 'home-living';
  SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion-apparel';
  SELECT id INTO wellness_id FROM categories WHERE slug = 'wellness-meditation';
  SELECT id INTO digital_id FROM categories WHERE slug = 'digital-books';
  SELECT id INTO audio_id FROM categories WHERE slug = 'audio-spectrum';

  INSERT INTO categories (parent_id, name, slug, description, icon, display_order, is_active, is_system, level, path) VALUES
    (art_id, 'Islamic Calligraphy', 'islamic-calligraphy', 'Traditional Arabic calligraphy art', '✍️', 1, true, false, 1, 'art-wall-decor/islamic-calligraphy'),
    (art_id, 'Canvas Paintings', 'canvas-paintings', 'Islamic themed canvas art', '🖼️', 2, true, false, 1, 'art-wall-decor/canvas-paintings'),
    (art_id, 'Framed Prints', 'framed-prints', 'Ready to hang framed Islamic prints', '🗃️', 3, true, false, 1, 'art-wall-decor/framed-prints'),
    (jewelry_id, 'Rings', 'rings', 'Islamic themed rings', '💍', 1, true, false, 1, 'jewelry-accessories/rings'),
    (jewelry_id, 'Necklaces', 'necklaces', 'Pendants and necklaces', '📿', 2, true, false, 1, 'jewelry-accessories/necklaces'),
    (jewelry_id, 'Bracelets', 'bracelets', 'Wristbands and bracelets', '🪬', 3, true, false, 1, 'jewelry-accessories/bracelets'),
    (home_id, 'Prayer Rugs', 'prayer-rugs', 'Decorative and functional prayer mats', '🕌', 1, true, false, 1, 'home-living/prayer-rugs'),
    (home_id, 'Candles & Incense', 'candles-incense', 'Aromatic candles and incense', '🕯️', 2, true, false, 1, 'home-living/candles-incense'),
    (home_id, 'Home Decor', 'home-decor', 'Decorative pieces for the home', '🏺', 3, true, false, 1, 'home-living/home-decor'),
    (fashion_id, 'Abayas', 'abayas', 'Traditional Islamic robes', '👘', 1, true, false, 1, 'fashion-apparel/abayas'),
    (fashion_id, 'Hijabs & Scarves', 'hijabs-scarves', 'Head coverings and scarves', '🧕', 2, true, false, 1, 'fashion-apparel/hijabs-scarves'),
    (fashion_id, 'Kufis & Caps', 'kufis-caps', 'Traditional Islamic caps', '🎩', 3, true, false, 1, 'fashion-apparel/kufis-caps'),
    (wellness_id, 'Prayer Beads (Tasbih)', 'prayer-beads-tasbih', 'Dhikr beads and prayer counters', '📿', 1, true, false, 1, 'wellness-meditation/prayer-beads-tasbih'),
    (wellness_id, 'Incense & Bakhoor', 'incense-bakhoor', 'Aromatic incense and bakhoor', '🌿', 2, true, false, 1, 'wellness-meditation/incense-bakhoor'),
    (wellness_id, 'Essential Oils', 'essential-oils', 'Natural oils and attar', '🧴', 3, true, false, 1, 'wellness-meditation/essential-oils'),
    (digital_id, 'Quran & Tafsir', 'quran-tafsir', 'Digital Quran and interpretation books', '📖', 1, true, false, 1, 'digital-books/quran-tafsir'),
    (digital_id, 'Islamic History', 'islamic-history', 'Books on Islamic history and civilization', '📜', 2, true, false, 1, 'digital-books/islamic-history'),
    (digital_id, 'Spiritual Guidance', 'spiritual-guidance', 'Books on spirituality and self-improvement', '🌙', 3, true, false, 1, 'digital-books/spiritual-guidance'),
    (audio_id, 'Quran Recitations', 'quran-recitations', 'Audio recitations of the Holy Quran', '🎙️', 1, true, false, 1, 'audio-spectrum/quran-recitations'),
    (audio_id, 'Nasheeds', 'nasheeds', 'Islamic vocal music and nasheeds', '🎵', 2, true, false, 1, 'audio-spectrum/nasheeds'),
    (audio_id, 'Lectures & Talks', 'lectures-talks', 'Islamic lectures and educational talks', '🎧', 3, true, false, 1, 'audio-spectrum/lectures-talks')
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================================
-- SEED DATA: Facet Groups
-- ============================================================
INSERT INTO facet_groups (name, slug, description, display_order, is_active) VALUES
  ('Faith Tradition', 'faith-tradition', 'The faith tradition or religious background of the product', 1, true),
  ('Purpose', 'purpose', 'The intended purpose or use of the product', 2, true),
  ('Material', 'material', 'The primary material the product is made from', 3, true),
  ('Craft Origin', 'craft-origin', 'The geographic origin of the craft or product', 4, true),
  ('Style', 'style', 'The artistic or design style of the product', 5, true),
  ('Occasion', 'occasion', 'The occasion or event the product is suited for', 6, true),
  ('Color Family', 'color-family', 'The primary color family of the product', 7, true)
ON CONFLICT (slug) DO NOTHING;

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

  INSERT INTO facet_values (facet_group_id, name, slug, display_order, is_active) VALUES
    (faith_id, 'Islamic', 'islamic', 1, true),
    (faith_id, 'Christian', 'christian', 2, true),
    (faith_id, 'Jewish', 'jewish', 3, true),
    (faith_id, 'Buddhist', 'buddhist', 4, true),
    (faith_id, 'Hindu', 'hindu', 5, true),
    (faith_id, 'Multi-Faith', 'multi-faith', 6, true),
    (faith_id, 'Spiritual', 'spiritual', 7, true),
    (purpose_id, 'Prayer & Meditation', 'prayer-meditation', 1, true),
    (purpose_id, 'Home Decoration', 'home-decoration', 2, true),
    (purpose_id, 'Gift', 'gift', 3, true),
    (purpose_id, 'Personal Use', 'personal-use', 4, true),
    (purpose_id, 'Educational', 'educational', 5, true),
    (material_id, 'Wood', 'wood', 1, true),
    (material_id, 'Cotton', 'cotton', 2, true),
    (material_id, 'Silk', 'silk', 3, true),
    (material_id, 'Wool', 'wool', 4, true),
    (material_id, 'Leather', 'leather', 5, true),
    (material_id, 'Metal', 'metal', 6, true),
    (material_id, 'Stone', 'stone', 7, true),
    (material_id, 'Glass', 'glass', 8, true),
    (material_id, 'Ceramic', 'ceramic', 9, true),
    (material_id, 'Paper', 'paper', 10, true),
    (material_id, 'Digital', 'digital', 11, true),
    (origin_id, 'Middle East', 'middle-east', 1, true),
    (origin_id, 'North Africa', 'north-africa', 2, true),
    (origin_id, 'South Asia', 'south-asia', 3, true),
    (origin_id, 'Southeast Asia', 'southeast-asia', 4, true),
    (origin_id, 'Central Asia', 'central-asia', 5, true),
    (origin_id, 'West Africa', 'west-africa', 6, true),
    (origin_id, 'Europe', 'europe', 7, true),
    (style_id, 'Traditional', 'traditional', 1, true),
    (style_id, 'Contemporary', 'contemporary', 2, true),
    (style_id, 'Minimalist', 'minimalist', 3, true),
    (style_id, 'Ornate', 'ornate', 4, true),
    (style_id, 'Geometric', 'geometric', 5, true),
    (style_id, 'Calligraphic', 'calligraphic', 6, true),
    (occasion_id, 'Ramadan', 'ramadan', 1, true),
    (occasion_id, 'Eid', 'eid', 2, true),
    (occasion_id, 'Wedding', 'wedding', 3, true),
    (occasion_id, 'Birth', 'birth', 4, true),
    (occasion_id, 'Everyday', 'everyday', 5, true),
    (occasion_id, 'Special Occasion', 'special-occasion', 6, true),
    (color_id, 'Neutral', 'neutral', 1, true),
    (color_id, 'Earth Tones', 'earth-tones', 2, true),
    (color_id, 'Blue', 'blue', 3, true),
    (color_id, 'Green', 'green', 4, true),
    (color_id, 'Red', 'red', 5, true),
    (color_id, 'Gold', 'gold', 6, true),
    (color_id, 'Black & White', 'black-white', 7, true),
    (color_id, 'Multicolor', 'multicolor', 8, true)
  ON CONFLICT (facet_group_id, slug) DO NOTHING;
END $$;

-- ============================================================
-- SEED DATA: Carrier Integrations
-- ============================================================
INSERT INTO carrier_integrations (carrier_name, carrier_code, api_endpoint, is_active, supports_rates, supports_labels, supports_tracking) VALUES
  ('DHL Express', 'dhl', 'https://api.dhl.com/v1', true, true, true, true),
  ('FedEx', 'fedex', 'https://api.fedex.com/v1', true, true, true, true),
  ('UPS', 'ups', 'https://api.ups.com/v1', true, true, true, true),
  ('USPS', 'usps', 'https://api.usps.com/v1', true, true, false, true)
ON CONFLICT (carrier_code) DO NOTHING;
