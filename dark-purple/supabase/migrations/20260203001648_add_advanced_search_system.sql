/*
  # Advanced Search & Filtering System

  ## Overview
  Implements full-text search with PostgreSQL's built-in search capabilities,
  search analytics, and popular search tracking.

  ## New Tables
  
  ### `search_queries`
  Tracks all search queries for analytics and popular searches
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable) - References auth.users
  - `query_text` (text) - The search query
  - `result_count` (integer) - Number of results returned
  - `filters_applied` (jsonb) - Any filters used (price, category, etc)
  - `created_at` (timestamptz)
  
  ### `popular_searches`
  Aggregated view of popular search terms
  - `id` (uuid, primary key)
  - `query_text` (text, unique) - The search term
  - `search_count` (integer) - Number of times searched
  - `last_searched_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Changes to Existing Tables
  
  ### `products`
  - Add `search_vector` (tsvector) - Full-text search vector
  - Add GIN index for fast full-text search
  - Add trigger to automatically update search_vector on insert/update
  
  ## Indexes
  - GIN index on products.search_vector for fast text search
  - Index on products(price) for price range filtering
  - Composite index on search_queries(query_text, created_at)
  
  ## Functions
  - `update_product_search_vector()` - Trigger function to maintain search_vector
  - `increment_popular_search()` - Function to track popular searches
  
  ## Security
  - Enable RLS on search_queries table
  - Enable RLS on popular_searches table
  - Authenticated users can insert their own search queries
  - All users can read popular searches
*/

-- Create search_queries table
CREATE TABLE IF NOT EXISTS search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query_text text NOT NULL,
  result_count integer DEFAULT 0,
  filters_applied jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create popular_searches table
CREATE TABLE IF NOT EXISTS popular_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text UNIQUE NOT NULL,
  search_count integer DEFAULT 1,
  last_searched_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add search_vector column to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE products ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.layer1_category_slug, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.layer2_category_slug, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.materials, ' '), '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.traditions, ' '), '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.purposes, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector
DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- Update existing products with search vectors
UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(layer1_category_slug, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(layer2_category_slug, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(materials, ' '), '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(traditions, ' '), '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(purposes, ' '), '')), 'D')
WHERE search_vector IS NULL;

-- Create function to increment popular search
CREATE OR REPLACE FUNCTION increment_popular_search(search_term text)
RETURNS void AS $$
BEGIN
  INSERT INTO popular_searches (query_text, search_count, last_searched_at, updated_at)
  VALUES (search_term, 1, now(), now())
  ON CONFLICT (query_text) DO UPDATE
  SET 
    search_count = popular_searches.search_count + 1,
    last_searched_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_layer1_category ON products(layer1_category_slug);
CREATE INDEX IF NOT EXISTS idx_products_layer2_category ON products(layer2_category_slug);
CREATE INDEX IF NOT EXISTS idx_search_queries_text_date ON search_queries(query_text, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches(search_count DESC);

-- Enable RLS
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_queries
CREATE POLICY "Users can insert own search queries"
  ON search_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own search queries"
  ON search_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert search queries"
  ON search_queries FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- RLS Policies for popular_searches
CREATE POLICY "Anyone can view popular searches"
  ON popular_searches FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can manage popular searches"
  ON popular_searches FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
