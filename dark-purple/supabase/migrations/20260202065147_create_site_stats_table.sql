/*
  # Create site_stats configuration table

  1. New Tables
    - `site_stats`
      - `id` (uuid, primary key)
      - `stats_start_date` (date) - The start date for auto-increment calculations
      - `base_customers` (integer) - Base value for happy customers
      - `base_products` (integer) - Base value for authentic products
      - `base_countries` (integer) - Base value for countries served
      - `customer_daily_min` (integer) - Minimum daily increment for customers
      - `customer_daily_max` (integer) - Maximum daily increment for customers
      - `product_daily_min` (integer) - Minimum daily increment for products
      - `product_daily_max` (integer) - Maximum daily increment for products
      - `country_increment_every_months` (integer) - Months between country increments
      - `dynamic_enabled` (boolean) - Toggle for dynamic stats
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `site_stats` table
    - Add policy for public read access
    - Add policy for authenticated admin updates (for future CMS)

  3. Initial Data
    - Insert default configuration with base values
*/

CREATE TABLE IF NOT EXISTS site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stats_start_date date NOT NULL DEFAULT '2026-02-02',
  base_customers integer NOT NULL DEFAULT 2456,
  base_products integer NOT NULL DEFAULT 3256,
  base_countries integer NOT NULL DEFAULT 32,
  customer_daily_min integer NOT NULL DEFAULT 12,
  customer_daily_max integer NOT NULL DEFAULT 15,
  product_daily_min integer NOT NULL DEFAULT 5,
  product_daily_max integer NOT NULL DEFAULT 8,
  country_increment_every_months integer NOT NULL DEFAULT 2,
  dynamic_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site stats"
  ON site_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update site stats"
  ON site_stats
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default configuration
INSERT INTO site_stats (
  stats_start_date,
  base_customers,
  base_products,
  base_countries,
  customer_daily_min,
  customer_daily_max,
  product_daily_min,
  product_daily_max,
  country_increment_every_months,
  dynamic_enabled
) VALUES (
  '2026-02-02',
  2456,
  3256,
  32,
  12,
  15,
  5,
  8,
  2,
  true
)
ON CONFLICT DO NOTHING;