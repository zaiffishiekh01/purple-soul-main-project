/*
  # Add Navigation & Visibility Settings

  1. Schema Changes
    - Add `is_featured` column to categories (for homepage highlighting)
    - Add `show_in_navigation` column to categories (control nav menu visibility)
    - Add `navigation_label` column (custom label for nav if different from name)
    - Add `seo_title` column (custom SEO title)
    - Add `seo_description` column (meta description)
    - Add `seo_keywords` column (meta keywords)
    - Add `url_slug_override` column (custom URL path)
    - Add `featured_order` column (order on homepage when featured)
    - Add `navigation_parent_id` column (for custom nav hierarchy, separate from category hierarchy)
    - Add `mega_menu_enabled` column (enable mega menu dropdown)
    - Add `mega_menu_columns` column (number of columns in mega menu)

  2. Security
    - Existing RLS policies apply
*/

-- Add new columns for navigation and visibility control
DO $$ 
BEGIN
  -- Featured categories (homepage)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE categories ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'featured_order'
  ) THEN
    ALTER TABLE categories ADD COLUMN featured_order integer DEFAULT 0;
  END IF;

  -- Navigation menu visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'show_in_navigation'
  ) THEN
    ALTER TABLE categories ADD COLUMN show_in_navigation boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'navigation_label'
  ) THEN
    ALTER TABLE categories ADD COLUMN navigation_label text DEFAULT '';
  END IF;

  -- Mega menu settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'mega_menu_enabled'
  ) THEN
    ALTER TABLE categories ADD COLUMN mega_menu_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'mega_menu_columns'
  ) THEN
    ALTER TABLE categories ADD COLUMN mega_menu_columns integer DEFAULT 3;
  END IF;

  -- SEO settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE categories ADD COLUMN seo_title text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE categories ADD COLUMN seo_description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'seo_keywords'
  ) THEN
    ALTER TABLE categories ADD COLUMN seo_keywords text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'url_slug_override'
  ) THEN
    ALTER TABLE categories ADD COLUMN url_slug_override text DEFAULT '';
  END IF;
END $$;

-- Create index for featured categories query
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured, featured_order) WHERE is_featured = true;

-- Create index for navigation visibility
CREATE INDEX IF NOT EXISTS idx_categories_navigation ON categories(show_in_navigation, display_order) WHERE show_in_navigation = true;
