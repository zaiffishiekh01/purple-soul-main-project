/*
  # Create Categories Management System

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name
      - `slug` (text, unique) - URL-friendly slug
      - `description` (text) - Category description
      - `icon` (text) - Icon name or emoji
      - `display_order` (integer) - Sort order
      - `is_active` (boolean) - Active status
      - `is_system` (boolean) - System category (cannot be deleted)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `categories` table
    - Admins can manage all categories
    - Vendors can view active categories only
    - Public can view active categories

  3. Initial Data
    - Insert Sacred Gift Shop categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '📦',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all categories"
  ON categories FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete non-system categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    public.is_admin() AND
    is_system = false
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Insert Sacred Gift Shop categories
INSERT INTO categories (name, slug, description, icon, display_order, is_active, is_system) VALUES
  ('Art & Wall Decor', 'art-wall-decor', 'Beautiful art pieces and wall decorations for your sacred space', '🎨', 1, true, true),
  ('Jewelry & Accessories', 'jewelry-accessories', 'Spiritual jewelry and meaningful accessories', '💎', 2, true, true),
  ('Home & Living', 'home-living', 'Sacred items for your home and daily living', '🏠', 3, true, true),
  ('Fashion & Apparel', 'fashion-apparel', 'Modest and spiritual fashion clothing', '👗', 4, true, true),
  ('Wellness & Meditation', 'wellness-meditation', 'Products for wellness, meditation, and spiritual practice', '🧘', 5, true, true),
  ('Digital Books', 'digital-books', 'Digital books and e-publications', '📚', 6, true, true),
  ('Audio Spectrum', 'audio-spectrum', 'Spiritual audio content, music, and guided meditations', '🎵', 7, true, true)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS categories_updated_at_trigger ON categories;
CREATE TRIGGER categories_updated_at_trigger
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();
