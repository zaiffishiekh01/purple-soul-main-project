-- =====================================================
-- REMAINING FEATURE TABLES
-- =====================================================
-- Creates the last 5 missing tables
-- =====================================================

-- 1. ARTISANS TABLE
CREATE TABLE IF NOT EXISTS artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  bio TEXT,
  specialty TEXT,
  years_experience INTEGER,
  profile_image_url TEXT,
  cover_image_url TEXT,
  location TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artisans are publicly readable" ON artisans;
CREATE POLICY "Artisans are publicly readable" ON artisans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own artisan profile" ON artisans;
CREATE POLICY "Users can manage own artisan profile" ON artisans
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all artisans" ON artisans;
CREATE POLICY "Admins can manage all artisans" ON artisans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- 2. TRAVEL VENDORS TABLE
CREATE TABLE IF NOT EXISTS travel_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  license_number TEXT,
  specialization TEXT,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  service_areas TEXT[],
  is_certified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE travel_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Travel vendors are publicly readable" ON travel_vendors;
CREATE POLICY "Travel vendors are publicly readable" ON travel_vendors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can manage own travel profile" ON travel_vendors;
CREATE POLICY "Vendors can manage own travel profile" ON travel_vendors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM vendors WHERE vendors.id = travel_vendors.vendor_id AND vendors.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage all travel vendors" ON travel_vendors;
CREATE POLICY "Admins can manage all travel vendors" ON travel_vendors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- 3. TRAVEL PACKAGES TABLE
CREATE TABLE IF NOT EXISTS travel_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES travel_vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('hajj', 'umrah', 'islamic heritage', 'christian pilgrimage', 'jewish heritage', 'multi-faith', 'cultural')),
  destination TEXT,
  country TEXT,
  duration_days INTEGER,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  max_group_size INTEGER,
  departure_date DATE,
  return_date DATE,
  includes JSONB DEFAULT '[]',
  excludes JSONB DEFAULT '[]',
  itinerary JSONB DEFAULT '[]',
  images TEXT[],
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE travel_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active travel packages are public" ON travel_packages;
CREATE POLICY "Active travel packages are public" ON travel_packages
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Vendors can manage own packages" ON travel_packages;
CREATE POLICY "Vendors can manage own packages" ON travel_packages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM travel_vendors tv JOIN vendors v ON tv.vendor_id = v.id WHERE tv.id = travel_packages.vendor_id AND v.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage all travel packages" ON travel_packages;
CREATE POLICY "Admins can manage all travel packages" ON travel_packages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_travel_packages_vendor_id ON travel_packages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_travel_packages_type ON travel_packages(type);
CREATE INDEX IF NOT EXISTS idx_travel_packages_country ON travel_packages(country);
CREATE INDEX IF NOT EXISTS idx_travel_packages_is_active ON travel_packages(is_active);

-- 4. WEDDING REGISTRIES TABLE (extends celebration_registries concept)
CREATE TABLE IF NOT EXISTS wedding_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_email TEXT,
  registry_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  wedding_date DATE,
  venue_name TEXT,
  venue_location TEXT,
  description TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'elegant',
  total_items INTEGER DEFAULT 0,
  purchased_items INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  purchased_value DECIMAL(10,2) DEFAULT 0,
  share_token TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wedding_registries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public wedding registries are viewable" ON wedding_registries;
CREATE POLICY "Public wedding registries are viewable" ON wedding_registries
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can manage own wedding registry" ON wedding_registries;
CREATE POLICY "Users can manage own wedding registry" ON wedding_registries
  FOR ALL USING (auth.uid() = couple_user_id);

DROP POLICY IF EXISTS "Admins can manage all wedding registries" ON wedding_registries;
CREATE POLICY "Admins can manage all wedding registries" ON wedding_registries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_wedding_registries_couple_user_id ON wedding_registries(couple_user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_registries_slug ON wedding_registries(slug);
CREATE INDEX IF NOT EXISTS idx_wedding_registries_is_public ON wedding_registries(is_public);

-- 5. CELEBRATION REGISTRIES TABLE
CREATE TABLE IF NOT EXISTS celebration_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registry_type TEXT NOT NULL CHECK (registry_type IN ('birth', 'seasonal', 'remembrance', 'home_blessing', 'family_gift', 'custom')),
  celebration_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  celebration_date DATE,
  description TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'celebration',
  total_items INTEGER DEFAULT 0,
  purchased_items INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  purchased_value DECIMAL(10,2) DEFAULT 0,
  share_token TEXT UNIQUE,
  occasion_details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE celebration_registries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public celebration registries are viewable" ON celebration_registries;
CREATE POLICY "Public celebration registries are viewable" ON celebration_registries
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can manage own celebration registry" ON celebration_registries;
CREATE POLICY "Users can manage own celebration registry" ON celebration_registries
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all celebration registries" ON celebration_registries;
CREATE POLICY "Admins can manage all celebration registries" ON celebration_registries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_celebration_registries_user_id ON celebration_registries(user_id);
CREATE INDEX IF NOT EXISTS idx_celebration_registries_type ON celebration_registries(registry_type);
CREATE INDEX IF NOT EXISTS idx_celebration_registries_slug ON celebration_registries(slug);
CREATE INDEX IF NOT EXISTS idx_celebration_registries_is_public ON celebration_registries(is_public);

-- Migration tracking
INSERT INTO _migrations (migration_id, name) VALUES
  ('20260412_feature_tables_artisans_travel_wedding', 'Feature Tables: Artisans, Travel, Wedding, Celebration')
ON CONFLICT (migration_id) DO NOTHING;
