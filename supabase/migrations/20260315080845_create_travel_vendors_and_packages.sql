/*
  # Travel Vendors and Packages System

  ## Overview
  Creates a comprehensive travel vendor and package management system for Purple Soul pilgrimage planning.

  ## New Tables
  
  ### `travel_vendors`
  - `id` (uuid, primary key)
  - `name` (text) - Vendor name
  - `description` (text) - Vendor description
  - `logo_url` (text) - Vendor logo
  - `rating` (decimal) - Average rating
  - `total_reviews` (integer) - Number of reviews
  - `verified` (boolean) - Purple Soul verified badge
  - `specialties` (text[]) - Array of specialties (hajj, umrah, christian, jewish, etc.)
  - `contact_email` (text)
  - `contact_phone` (text)
  - `website_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `travel_packages`
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, foreign key to travel_vendors)
  - `name` (text) - Package name
  - `description` (text) - Package description
  - `pilgrimage_type` (text) - hajj, umrah, christian, jewish, universal
  - `duration_days` (integer) - Package duration
  - `price` (decimal) - Package price
  - `original_price` (decimal) - Original price before discount
  - `inclusions` (jsonb) - What's included
  - `exclusions` (jsonb) - What's not included
  - `highlights` (text[]) - Key highlights
  - `accommodation_level` (text) - economy, standard, premium, luxury
  - `group_size_min` (integer)
  - `group_size_max` (integer)
  - `available_dates` (jsonb) - Array of available dates
  - `rating` (decimal)
  - `total_bookings` (integer)
  - `image_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `package_addons`
  - `id` (uuid, primary key)
  - `package_id` (uuid, foreign key to travel_packages)
  - `name` (text) - Add-on name
  - `description` (text)
  - `price` (decimal)
  - `category` (text) - insurance, upgrade, excursion, etc.
  - `required` (boolean)
  - `created_at` (timestamptz)

  ### `travel_bookings`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `package_id` (uuid, foreign key to travel_packages)
  - `departure_date` (date)
  - `travelers_count` (integer)
  - `total_price` (decimal)
  - `selected_addons` (jsonb)
  - `status` (text) - pending, confirmed, cancelled
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for vendors and packages
  - Authenticated users can create bookings
  - Users can only view/edit their own bookings
*/

-- Create travel_vendors table
CREATE TABLE IF NOT EXISTS travel_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  verified boolean DEFAULT false,
  specialties text[] DEFAULT '{}',
  contact_email text,
  contact_phone text,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create travel_packages table
CREATE TABLE IF NOT EXISTS travel_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES travel_vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  pilgrimage_type text NOT NULL,
  duration_days integer NOT NULL,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  inclusions jsonb DEFAULT '[]',
  exclusions jsonb DEFAULT '[]',
  highlights text[] DEFAULT '{}',
  accommodation_level text DEFAULT 'standard',
  group_size_min integer DEFAULT 1,
  group_size_max integer DEFAULT 50,
  available_dates jsonb DEFAULT '[]',
  rating decimal(3,2) DEFAULT 0,
  total_bookings integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create package_addons table
CREATE TABLE IF NOT EXISTS package_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES travel_packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text DEFAULT 'optional',
  required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create travel_bookings table
CREATE TABLE IF NOT EXISTS travel_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid REFERENCES travel_packages(id),
  departure_date date NOT NULL,
  travelers_count integer NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL,
  selected_addons jsonb DEFAULT '[]',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE travel_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for travel_vendors
CREATE POLICY "Anyone can view travel vendors"
  ON travel_vendors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert vendors"
  ON travel_vendors FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- RLS Policies for travel_packages
CREATE POLICY "Anyone can view travel packages"
  ON travel_packages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert packages"
  ON travel_packages FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- RLS Policies for package_addons
CREATE POLICY "Anyone can view package addons"
  ON package_addons FOR SELECT
  TO public
  USING (true);

-- RLS Policies for travel_bookings
CREATE POLICY "Users can view own bookings"
  ON travel_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON travel_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON travel_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample verified vendors
INSERT INTO travel_vendors (name, description, logo_url, rating, total_reviews, verified, specialties, contact_email, contact_phone, website_url)
VALUES
  ('Sacred Journey Tours', 'Premier Islamic pilgrimage specialist with 20 years of experience', 'https://images.pexels.com/photos/3243090/pexels-photo-3243090.jpeg?auto=compress&cs=tinysrgb&w=200', 4.8, 1247, true, ARRAY['hajj', 'umrah'], 'info@sacredjourney.com', '+1-800-HAJJ-NOW', 'https://sacredjourney.com'),
  ('Holy Land Pilgrimages', 'Christian pilgrimage tours to Jerusalem, Rome, and beyond', 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=200', 4.9, 892, true, ARRAY['christian'], 'bookings@holyland.com', '+1-888-HOLY-123', 'https://holylandpilgrimages.com'),
  ('Heritage Travel Group', 'Jewish heritage tours and Bar/Bat Mitzvah trips to Israel', 'https://images.pexels.com/photos/7412081/pexels-photo-7412081.jpeg?auto=compress&cs=tinysrgb&w=200', 4.7, 654, true, ARRAY['jewish'], 'contact@heritagetravel.com', '+1-877-ISRAEL-1', 'https://heritagetravel.com'),
  ('Universal Spiritual Journeys', 'Interfaith and multi-tradition pilgrimage experiences', 'https://images.pexels.com/photos/6919905/pexels-photo-6919905.jpeg?auto=compress&cs=tinysrgb&w=200', 4.6, 423, true, ARRAY['universal', 'interfaith'], 'info@universaljourneys.com', '+1-866-SPIRIT-1', 'https://universaljourneys.com'),
  ('Al-Amin Travel', 'Affordable Hajj and Umrah packages for families', 'https://images.pexels.com/photos/8837574/pexels-photo-8837574.jpeg?auto=compress&cs=tinysrgb&w=200', 4.5, 1089, true, ARRAY['hajj', 'umrah'], 'support@alamintravel.com', '+1-855-UMRAH-GO', 'https://alamintravel.com'),
  ('Faith Routes International', 'Customized religious tours worldwide', 'https://images.pexels.com/photos/6963944/pexels-photo-6963944.jpeg?auto=compress&cs=tinysrgb&w=200', 4.7, 567, true, ARRAY['christian', 'jewish', 'universal'], 'hello@faithroutes.com', '+1-844-FAITH-11', 'https://faithroutes.com');

-- Insert sample packages for Hajj
INSERT INTO travel_packages (vendor_id, name, description, pilgrimage_type, duration_days, price, original_price, inclusions, exclusions, highlights, accommodation_level, group_size_min, group_size_max, rating, total_bookings, image_url)
SELECT 
  id,
  'Complete Hajj Package 2026',
  'All-inclusive Hajj experience with premium accommodations near Haram',
  'hajj',
  14,
  6499.00,
  7999.00,
  '["5-star hotel near Haram", "All meals included", "Guided tours", "Transportation", "Visa assistance", "Ihram clothing", "Educational seminars"]',
  '["International flights", "Travel insurance", "Personal expenses"]',
  ARRAY['Walk to Haram in 5 minutes', 'Experienced multilingual guides', '24/7 support', 'Pre-departure training'],
  'premium',
  10,
  40,
  4.8,
  234,
  'https://images.pexels.com/photos/4350210/pexels-photo-4350210.jpeg?auto=compress&cs=tinysrgb&w=800'
FROM travel_vendors WHERE name = 'Sacred Journey Tours';

INSERT INTO travel_packages (vendor_id, name, description, pilgrimage_type, duration_days, price, original_price, inclusions, exclusions, highlights, accommodation_level, group_size_min, group_size_max, rating, total_bookings, image_url)
SELECT 
  id,
  'Economy Hajj Package 2026',
  'Budget-friendly Hajj package with comfortable accommodations',
  'hajj',
  14,
  4299.00,
  5299.00,
  '["3-star hotel", "Daily breakfast", "Group transportation", "Visa processing", "Basic guidance"]',
  '["Lunch and dinner", "International flights", "Insurance", "Ihram"]',
  ARRAY['Affordable pricing', 'Group travel', 'Essential services covered'],
  'economy',
  15,
  50,
  4.5,
  567,
  'https://images.pexels.com/photos/4350788/pexels-photo-4350788.jpeg?auto=compress&cs=tinysrgb&w=800'
FROM travel_vendors WHERE name = 'Al-Amin Travel';

-- Insert sample packages for Umrah
INSERT INTO travel_packages (vendor_id, name, description, pilgrimage_type, duration_days, price, original_price, inclusions, exclusions, highlights, accommodation_level, group_size_min, group_size_max, rating, total_bookings, image_url)
SELECT 
  id,
  'Ramadan Umrah Special',
  'Experience Umrah during blessed month of Ramadan',
  'umrah',
  10,
  3499.00,
  4299.00,
  '["4-star hotel", "All meals", "Daily Iftar at Haram", "Ziyarat tours", "Transportation", "Visa"]',
  '["Flights", "Travel insurance", "Shopping expenses"]',
  ARRAY['Ramadan special prayers', 'Taraweeh at Haram', 'Spiritual lectures', 'Iftar included'],
  'standard',
  8,
  35,
  4.9,
  892,
  'https://images.pexels.com/photos/7294404/pexels-photo-7294404.jpeg?auto=compress&cs=tinysrgb&w=800'
FROM travel_vendors WHERE name = 'Sacred Journey Tours';

-- Insert sample packages for Christian pilgrimages
INSERT INTO travel_packages (vendor_id, name, description, pilgrimage_type, duration_days, price, original_price, inclusions, exclusions, highlights, accommodation_level, group_size_min, group_size_max, rating, total_bookings, image_url)
SELECT 
  id,
  'Holy Land Pilgrimage - Jerusalem & Galilee',
  'Walk where Jesus walked - comprehensive tour of biblical sites',
  'christian',
  12,
  3999.00,
  4799.00,
  '["4-star hotels", "All breakfasts and dinners", "Daily Mass", "Expert biblical guide", "All entrance fees", "Transportation"]',
  '["Flights", "Lunches", "Travel insurance", "Personal expenses"]',
  ARRAY['Church of Holy Sepulchre', 'Garden of Gethsemane', 'Sea of Galilee', 'Via Dolorosa', 'Bethlehem'],
  'standard',
  12,
  45,
  4.9,
  456,
  'https://images.pexels.com/photos/3589857/pexels-photo-3589857.jpeg?auto=compress&cs=tinysrgb&w=800'
FROM travel_vendors WHERE name = 'Holy Land Pilgrimages';

-- Insert sample packages for Jewish pilgrimages
INSERT INTO travel_packages (vendor_id, name, description, pilgrimage_type, duration_days, price, original_price, inclusions, exclusions, highlights, accommodation_level, group_size_min, group_size_max, rating, total_bookings, image_url)
SELECT 
  id,
  'Israel Heritage Tour',
  'Explore Jewish heritage sites across Israel',
  'jewish',
  10,
  3799.00,
  4599.00,
  '["Boutique hotels", "Kosher meals", "Shabbat services", "Expert guides", "All sites", "Transportation"]',
  '["Flights", "Travel insurance", "Personal shopping"]',
  ARRAY['Western Wall', 'Masada', 'Yad Vashem', 'Old City Jerusalem', 'Tel Aviv'],
  'premium',
  10,
  30,
  4.7,
  321,
  'https://images.pexels.com/photos/3879071/pexels-photo-3879071.jpeg?auto=compress&cs=tinysrgb&w=800'
FROM travel_vendors WHERE name = 'Heritage Travel Group';

-- Insert sample add-ons
INSERT INTO package_addons (package_id, name, description, price, category, required)
SELECT 
  id,
  'Travel Insurance - Comprehensive',
  'Full medical and trip cancellation coverage',
  149.00,
  'insurance',
  false
FROM travel_packages WHERE name LIKE '%Hajj%' LIMIT 1;

INSERT INTO package_addons (package_id, name, description, price, category, required)
SELECT 
  id,
  'Private Room Upgrade',
  'Upgrade to private room (subject to availability)',
  799.00,
  'upgrade',
  false
FROM travel_packages WHERE name LIKE '%Hajj%' LIMIT 1;

INSERT INTO package_addons (package_id, name, description, price, category, required)
SELECT 
  id,
  'Madinah Extension - 3 Days',
  'Extended stay in Madinah with guided tours',
  599.00,
  'excursion',
  false
FROM travel_packages WHERE name LIKE '%Umrah%' LIMIT 1;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_pilgrimage_type ON travel_packages(pilgrimage_type);
CREATE INDEX IF NOT EXISTS idx_packages_vendor ON travel_packages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON travel_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_addons_package ON package_addons(package_id);
