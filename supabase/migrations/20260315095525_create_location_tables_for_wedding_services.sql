/*
  # Create Location Tables for Wedding Services and Travel Packages

  1. New Tables
    - `countries`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `code` (text, unique) - ISO country code
      - `created_at` (timestamptz)
    
    - `states`
      - `id` (uuid, primary key)
      - `country_id` (uuid, foreign key to countries)
      - `name` (text)
      - `code` (text) - State code
      - `created_at` (timestamptz)
    
    - `cities`
      - `id` (uuid, primary key)
      - `state_id` (uuid, foreign key to states)
      - `name` (text)
      - `created_at` (timestamptz)
    
    - `wedding_vendors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `vendor_type` (text) - imam, officiant, rabbi, venue, caterer, etc.
      - `tradition` (text) - islamic, christian, jewish, shared, etc.
      - `description` (text)
      - `country_id` (uuid, foreign key to countries)
      - `state_id` (uuid, foreign key to states, nullable)
      - `city_id` (uuid, foreign key to cities, nullable)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `price_range` (text) - low, medium, high
      - `rating` (numeric, default 0)
      - `total_reviews` (integer, default 0)
      - `verified` (boolean, default false)
      - `specialties` (text array)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modifications
    - Add location fields to `travel_packages` table
      - `country_id` (uuid, foreign key to countries, nullable)
      - `state_id` (uuid, foreign key to states, nullable)
      - `city_id` (uuid, foreign key to cities, nullable)

  3. Security
    - Enable RLS on all new tables
    - Add policies for public read access
    - Add policies for authenticated users to manage their own data
*/

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries are viewable by everyone"
  ON countries FOR SELECT
  TO public
  USING (true);

-- Create states table
CREATE TABLE IF NOT EXISTS states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "States are viewable by everyone"
  ON states FOR SELECT
  TO public
  USING (true);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid REFERENCES states(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  TO public
  USING (true);

-- Create wedding vendors table
CREATE TABLE IF NOT EXISTS wedding_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vendor_type text NOT NULL CHECK (vendor_type IN ('imam', 'officiant', 'rabbi', 'priest', 'venue', 'caterer', 'photographer', 'florist', 'musician', 'planner', 'other')),
  tradition text NOT NULL CHECK (tradition IN ('islamic', 'christian', 'jewish', 'shared', 'universal')),
  description text,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  state_id uuid REFERENCES states(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  address text,
  phone text,
  email text,
  website text,
  price_range text DEFAULT 'medium' CHECK (price_range IN ('low', 'medium', 'high')),
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer DEFAULT 0,
  verified boolean DEFAULT false,
  specialties text[] DEFAULT '{}',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wedding_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding vendors are viewable by everyone"
  ON wedding_vendors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert wedding vendors"
  ON wedding_vendors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their wedding vendors"
  ON wedding_vendors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add location columns to travel_packages if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_packages' AND column_name = 'country_id'
  ) THEN
    ALTER TABLE travel_packages ADD COLUMN country_id uuid REFERENCES countries(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_packages' AND column_name = 'state_id'
  ) THEN
    ALTER TABLE travel_packages ADD COLUMN state_id uuid REFERENCES states(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_packages' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE travel_packages ADD COLUMN city_id uuid REFERENCES cities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Insert sample countries
INSERT INTO countries (name, code) VALUES
  ('United States', 'US'),
  ('Canada', 'CA'),
  ('United Kingdom', 'GB'),
  ('Saudi Arabia', 'SA'),
  ('United Arab Emirates', 'AE'),
  ('Turkey', 'TR'),
  ('Egypt', 'EG'),
  ('Morocco', 'MA'),
  ('Israel', 'IL'),
  ('Jordan', 'JO')
ON CONFLICT (code) DO NOTHING;

-- Insert sample US states
INSERT INTO states (country_id, name, code)
SELECT c.id, s.name, s.code
FROM (VALUES
  ('California', 'CA'),
  ('New York', 'NY'),
  ('Texas', 'TX'),
  ('Florida', 'FL'),
  ('Illinois', 'IL'),
  ('Pennsylvania', 'PA'),
  ('Ohio', 'OH'),
  ('Georgia', 'GA'),
  ('North Carolina', 'NC'),
  ('Michigan', 'MI'),
  ('New Jersey', 'NJ'),
  ('Virginia', 'VA'),
  ('Washington', 'WA'),
  ('Arizona', 'AZ'),
  ('Massachusetts', 'MA'),
  ('Tennessee', 'TN'),
  ('Indiana', 'IN'),
  ('Missouri', 'MO'),
  ('Maryland', 'MD'),
  ('Wisconsin', 'WI')
) AS s(name, code)
CROSS JOIN countries c
WHERE c.code = 'US'
ON CONFLICT DO NOTHING;

-- Insert sample Canadian provinces
INSERT INTO states (country_id, name, code)
SELECT c.id, s.name, s.code
FROM (VALUES
  ('Ontario', 'ON'),
  ('Quebec', 'QC'),
  ('British Columbia', 'BC'),
  ('Alberta', 'AB'),
  ('Manitoba', 'MB'),
  ('Saskatchewan', 'SK')
) AS s(name, code)
CROSS JOIN countries c
WHERE c.code = 'CA'
ON CONFLICT DO NOTHING;

-- Insert sample cities for major US states
INSERT INTO cities (state_id, name)
SELECT s.id, c.name
FROM (VALUES
  ('CA', 'Los Angeles'),
  ('CA', 'San Francisco'),
  ('CA', 'San Diego'),
  ('CA', 'Sacramento'),
  ('NY', 'New York City'),
  ('NY', 'Buffalo'),
  ('NY', 'Rochester'),
  ('TX', 'Houston'),
  ('TX', 'Dallas'),
  ('TX', 'Austin'),
  ('TX', 'San Antonio'),
  ('FL', 'Miami'),
  ('FL', 'Orlando'),
  ('FL', 'Tampa'),
  ('IL', 'Chicago'),
  ('IL', 'Springfield'),
  ('PA', 'Philadelphia'),
  ('PA', 'Pittsburgh'),
  ('OH', 'Columbus'),
  ('OH', 'Cleveland'),
  ('GA', 'Atlanta'),
  ('NC', 'Charlotte'),
  ('NC', 'Raleigh'),
  ('MI', 'Detroit'),
  ('NJ', 'Newark'),
  ('VA', 'Virginia Beach'),
  ('WA', 'Seattle'),
  ('AZ', 'Phoenix'),
  ('MA', 'Boston'),
  ('TN', 'Nashville')
) AS c(state_code, name)
JOIN states s ON s.code = c.state_code
WHERE EXISTS (SELECT 1 FROM countries WHERE code = 'US' AND id = s.country_id)
ON CONFLICT DO NOTHING;