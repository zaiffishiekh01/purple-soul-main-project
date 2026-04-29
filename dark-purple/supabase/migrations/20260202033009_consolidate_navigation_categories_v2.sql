/*
  # Consolidate Navigation Categories from 10 to 5

  ## Overview
  This migration reorganizes the top-level navigation from 10 categories into 5 broader, more manageable categories while preserving all existing subcategories (layer 2).

  ## New Category Structure

  ### 1. Spiritual Practice
  Combines:
  - Prayer & Remembrance (8 subcategories)
  - Reflection & Inner Work (8 subcategories)
  Total: 16 subcategories

  ### 2. Sacred Living
  Combines:
  - Sacred Space & Home (8 subcategories)
  - Rituals & Life Moments (8 subcategories)
  Total: 16 subcategories

  ### 3. Learning & Growth
  Combines:
  - Learning & Scripture (8 subcategories)
  - Digital & Media Resources (8 subcategories)
  Total: 16 subcategories

  ### 4. Art & Expression
  Combines:
  - Sacred Art & Aesthetics (8 subcategories)
  - Music, Sound & Silence (8 subcategories)
  - Apparel & Personal Expression (8 subcategories)
  Total: 24 subcategories

  ### 5. Gifts & Collections
  Remains unchanged (8 subcategories)

  ## Changes Made
  1. Create 5 new consolidated parent categories
  2. Update all layer 2 subcategories to point to new parent categories
  3. Delete old layer 1 categories (after subcategories are safely moved)
  4. Update sort orders for clean navigation

  ## Data Safety
  - All subcategories are preserved and reassigned to new parents
  - Old categories are deleted only after subcategories are moved
  - All product associations remain intact through subcategories
*/

-- Step 1: Create new consolidated layer 1 categories
DO $$
BEGIN
  -- Only insert if they don't already exist
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'spiritual-practice' AND layer = 1) THEN
    INSERT INTO categories (id, name, slug, layer, parent_id, sort_order, description)
    VALUES (gen_random_uuid(), 'Spiritual Practice', 'spiritual-practice', 1, NULL, 1, 'Prayer, remembrance, meditation, and inner work tools');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sacred-living' AND layer = 1) THEN
    INSERT INTO categories (id, name, slug, layer, parent_id, sort_order, description)
    VALUES (gen_random_uuid(), 'Sacred Living', 'sacred-living', 1, NULL, 2, 'Sacred spaces, home items, and life moment rituals');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'learning-growth' AND layer = 1) THEN
    INSERT INTO categories (id, name, slug, layer, parent_id, sort_order, description)
    VALUES (gen_random_uuid(), 'Learning & Growth', 'learning-growth', 1, NULL, 3, 'Scripture, study materials, and digital resources');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'art-expression' AND layer = 1) THEN
    INSERT INTO categories (id, name, slug, layer, parent_id, sort_order, description)
    VALUES (gen_random_uuid(), 'Art & Expression', 'art-expression', 1, NULL, 4, 'Sacred art, music, apparel, and personal expression');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'gifts-collections-new' AND layer = 1) THEN
    INSERT INTO categories (id, name, slug, layer, parent_id, sort_order, description)
    VALUES (gen_random_uuid(), 'Gifts & Collections', 'gifts-collections-new', 1, NULL, 5, 'Curated gift sets, bundles, and special collections');
  END IF;
END $$;

-- Step 2: Reassign all layer 2 subcategories to new parent categories

-- Prayer & Remembrance + Reflection & Inner Work → Spiritual Practice
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1 LIMIT 1)
WHERE layer = 2 
  AND parent_id IN (
    SELECT id FROM categories WHERE layer = 1 AND slug IN ('prayer-remembrance', 'reflection-inner-work')
  );

-- Sacred Space & Home + Rituals & Life Moments → Sacred Living
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1 LIMIT 1)
WHERE layer = 2 
  AND parent_id IN (
    SELECT id FROM categories WHERE layer = 1 AND slug IN ('sacred-space-home', 'rituals-life-moments')
  );

-- Learning & Scripture + Digital & Media Resources → Learning & Growth
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'learning-growth' AND layer = 1 LIMIT 1)
WHERE layer = 2 
  AND parent_id IN (
    SELECT id FROM categories WHERE layer = 1 AND slug IN ('learning-scripture', 'digital-media-resources')
  );

-- Sacred Art & Aesthetics + Music, Sound & Silence + Apparel & Personal Expression → Art & Expression
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1 LIMIT 1)
WHERE layer = 2 
  AND parent_id IN (
    SELECT id FROM categories WHERE layer = 1 AND slug IN ('sacred-art-aesthetics', 'music-sound-silence', 'apparel-personal-expression')
  );

-- Gifts & Collections → New Gifts & Collections
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'gifts-collections-new' AND layer = 1 LIMIT 1)
WHERE layer = 2 
  AND parent_id IN (
    SELECT id FROM categories WHERE layer = 1 AND slug = 'gifts-collections'
  );

-- Step 3: Delete old layer 1 categories (now that all subcategories are safely reassigned)
DELETE FROM categories
WHERE layer = 1 
  AND slug IN (
    'prayer-remembrance',
    'sacred-space-home',
    'learning-scripture',
    'rituals-life-moments',
    'reflection-inner-work',
    'apparel-personal-expression',
    'sacred-art-aesthetics',
    'music-sound-silence',
    'gifts-collections',
    'digital-media-resources'
  );

-- Step 4: Update sort orders for layer 2 categories under new parents
-- Spiritual Practice subcategories
DO $$
DECLARE
  spiritual_practice_id UUID;
  counter INTEGER := 1;
  sub RECORD;
BEGIN
  SELECT id INTO spiritual_practice_id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1;
  
  FOR sub IN 
    SELECT id FROM categories 
    WHERE parent_id = spiritual_practice_id AND layer = 2 
    ORDER BY sort_order
  LOOP
    UPDATE categories SET sort_order = counter WHERE id = sub.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Sacred Living subcategories
DO $$
DECLARE
  sacred_living_id UUID;
  counter INTEGER := 1;
  sub RECORD;
BEGIN
  SELECT id INTO sacred_living_id FROM categories WHERE slug = 'sacred-living' AND layer = 1;
  
  FOR sub IN 
    SELECT id FROM categories 
    WHERE parent_id = sacred_living_id AND layer = 2 
    ORDER BY sort_order
  LOOP
    UPDATE categories SET sort_order = counter WHERE id = sub.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Learning & Growth subcategories
DO $$
DECLARE
  learning_growth_id UUID;
  counter INTEGER := 1;
  sub RECORD;
BEGIN
  SELECT id INTO learning_growth_id FROM categories WHERE slug = 'learning-growth' AND layer = 1;
  
  FOR sub IN 
    SELECT id FROM categories 
    WHERE parent_id = learning_growth_id AND layer = 2 
    ORDER BY sort_order
  LOOP
    UPDATE categories SET sort_order = counter WHERE id = sub.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Art & Expression subcategories
DO $$
DECLARE
  art_expression_id UUID;
  counter INTEGER := 1;
  sub RECORD;
BEGIN
  SELECT id INTO art_expression_id FROM categories WHERE slug = 'art-expression' AND layer = 1;
  
  FOR sub IN 
    SELECT id FROM categories 
    WHERE parent_id = art_expression_id AND layer = 2 
    ORDER BY sort_order
  LOOP
    UPDATE categories SET sort_order = counter WHERE id = sub.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Gifts & Collections subcategories
DO $$
DECLARE
  gifts_id UUID;
  counter INTEGER := 1;
  sub RECORD;
BEGIN
  SELECT id INTO gifts_id FROM categories WHERE slug = 'gifts-collections-new' AND layer = 1;
  
  FOR sub IN 
    SELECT id FROM categories 
    WHERE parent_id = gifts_id AND layer = 2 
    ORDER BY sort_order
  LOOP
    UPDATE categories SET sort_order = counter WHERE id = sub.id;
    counter := counter + 1;
  END LOOP;
END $$;
