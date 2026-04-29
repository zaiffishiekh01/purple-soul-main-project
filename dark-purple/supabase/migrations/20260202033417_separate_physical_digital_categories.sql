/*
  # Separate Physical and Digital Categories

  ## Overview
  Restructure to keep physical products separate from digital products.
  
  ## New 5-Category Structure
  
  1. **Spiritual Practice** (Physical)
     - Prayer & Remembrance subcategories
     - Reflection & Inner Work subcategories
  
  2. **Sacred Living** (Physical)
     - Sacred Space & Home subcategories
     - Rituals & Life Moments subcategories
  
  3. **Learning & Scripture** (Physical)
     - All physical book and study material subcategories
  
  4. **Art & Expression** (Physical)
     - Sacred Art & Aesthetics subcategories
     - Music, Sound & Silence subcategories
     - Apparel & Personal Expression subcategories
  
  5. **Digital & Gifts** (Digital + Mixed)
     - Digital & Media Resources subcategories
     - Gifts & Collections subcategories
  
  ## Changes
  - Keep "Learning & Scripture" as standalone physical category
  - Move Digital & Media Resources subcategories to new "Digital & Gifts" category
  - Merge Gifts & Collections into "Digital & Gifts"
*/

-- Step 1: Delete old consolidated categories and create new structure
DELETE FROM categories WHERE layer = 1;

-- Step 2: Create the 5 new top-level categories
INSERT INTO categories (id, name, slug, layer, parent_id, sort_order, description)
VALUES 
  (gen_random_uuid(), 'Spiritual Practice', 'spiritual-practice', 1, NULL, 1, 'Prayer, remembrance, meditation, and inner work tools'),
  (gen_random_uuid(), 'Sacred Living', 'sacred-living', 1, NULL, 2, 'Sacred spaces, home items, and life moment rituals'),
  (gen_random_uuid(), 'Learning & Scripture', 'learning-scripture', 1, NULL, 3, 'Physical books, sacred texts, and study materials'),
  (gen_random_uuid(), 'Art & Expression', 'art-expression', 1, NULL, 4, 'Sacred art, music, sound, and apparel'),
  (gen_random_uuid(), 'Digital & Gifts', 'digital-gifts', 1, NULL, 5, 'Digital resources, media, and curated gift collections');

-- Step 3: Assign subcategories to correct parents based on their original categories

-- Spiritual Practice: Prayer & Remembrance + Reflection & Inner Work subcategories
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1 LIMIT 1)
WHERE layer = 2 AND slug IN (
  'prayer-beads-counters', 'prayer-mats-rugs', 'prayer-books-aids', 
  'daily-remembrance-tools', 'travel-prayer-essentials', 'prayer-accessories',
  'time-rhythm-tools', 'quiet-prayer-spaces',
  'spiritual-journals', 'meditation-contemplation-tools', 'breathwork-presence-aids',
  'retreat-stillness-kits', 'silence-fasting-aids', 'night-practice-tools',
  'intention-habit-trackers', 'dream-vision-recording'
);

-- Sacred Living: Sacred Space & Home + Rituals & Life Moments subcategories
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1 LIMIT 1)
WHERE layer = 2 AND slug IN (
  'prayer-corners-altars', 'wall-blessings-inscriptions', 'sacred-lighting',
  'table-hospitality-items', 'textiles-soft-furnishings', 'entryway-threshold-items',
  'home-fragrance', 'sacred-storage-organization',
  'birth-welcome', 'coming-of-age', 'marriage-union', 'new-home',
  'healing-illness', 'mourning-remembrance', 'pilgrimage-sacred-travel',
  'blessing-ceremonies'
);

-- Learning & Scripture: Physical books and study materials only
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1 LIMIT 1)
WHERE layer = 2 AND slug IN (
  'sacred-texts', 'study-editions-commentaries', 'beginner-guides',
  'advanced-spiritual-texts', 'ethics-moral-teachings', 'comparative-abrahamic-studies',
  'journals-study-notebooks', 'language-translation-aids'
);

-- Art & Expression: Art + Music + Apparel subcategories
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1 LIMIT 1)
WHERE layer = 2 AND slug IN (
  'calligraphy-sacred-text-art', 'sacred-geometry', 'icon-inspired-art',
  'heritage-manuscript-art', 'sculptural-objects', 'desk-study-art',
  'limited-collector-editions', 'children-family-art',
  'sacred-music-chants', 'instrumental-soundscapes', 'guided-listening-sessions',
  'night-dawn-sound-sets', 'silence-timers-bells', 'live-session-recordings',
  'prayer-call-adhan', 'ambient-background-sound',
  'modest-wear', 'scarves-shawls', 'outerwear-layers', 'headwear',
  'bags-totes', 'jewelry-non-ritual', 'limited-edition-pieces', 'accessories-small-items'
);

-- Digital & Gifts: Digital resources + Gift collections
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1 LIMIT 1)
WHERE layer = 2 AND slug IN (
  'ebooks-pdfs', 'audio-programs', 'video-teachings', 'guided-practices',
  'downloadable-journals', 'annual-subscriptions', 'digital-gift-cards',
  'digital-courses-workshops',
  'gift-sets-bundles', 'gifts-under-50', 'gifts-under-100',
  'host-guest-gifts', 'gratitude-thankyou-gifts', 'scholar-student-gifts',
  'spiritual-beginner-kits', 'seasonal-collections'
);

-- Step 4: Update sort orders for all subcategories
DO $$
DECLARE
  parent_cat RECORD;
  sub_cat RECORD;
  counter INTEGER;
BEGIN
  FOR parent_cat IN SELECT id FROM categories WHERE layer = 1 ORDER BY sort_order
  LOOP
    counter := 1;
    FOR sub_cat IN 
      SELECT id FROM categories 
      WHERE parent_id = parent_cat.id AND layer = 2 
      ORDER BY sort_order
    LOOP
      UPDATE categories SET sort_order = counter WHERE id = sub_cat.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;
