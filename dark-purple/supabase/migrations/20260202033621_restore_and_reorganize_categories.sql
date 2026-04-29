/*
  # Restore and Reorganize Categories - Physical/Digital Separation

  ## Overview
  This migration restores all categories that were accidentally deleted and reorganizes them into 5 main categories with physical/digital separation.

  ## New 5-Category Structure (Physical/Digital Separated)

  ### 1. Spiritual Practice (Physical)
     Prayer & Remembrance + Reflection & Inner Work subcategories

  ### 2. Sacred Living (Physical)
     Sacred Space & Home + Rituals & Life Moments subcategories

  ### 3. Learning & Scripture (Physical Books Only)
     Physical books, texts, and study materials

  ### 4. Art & Expression (Physical)
     Sacred Art + Music + Apparel subcategories

  ### 5. Digital & Gifts (Digital + Mixed)
     Digital resources + Gift collections

  ## Data Restoration
  All 80+ subcategories are restored and properly assigned to new parent categories
*/

-- Step 1: Create the 5 new top-level categories
INSERT INTO categories (id, name, slug, layer, parent_id, sort_order, description)
VALUES 
  (gen_random_uuid(), 'Spiritual Practice', 'spiritual-practice', 1, NULL, 1, 'Prayer, remembrance, meditation, and inner work tools'),
  (gen_random_uuid(), 'Sacred Living', 'sacred-living', 1, NULL, 2, 'Sacred spaces, home items, and life moment rituals'),
  (gen_random_uuid(), 'Learning & Scripture', 'learning-scripture', 1, NULL, 3, 'Physical books, sacred texts, and study materials'),
  (gen_random_uuid(), 'Art & Expression', 'art-expression', 1, NULL, 4, 'Sacred art, music, sound, and apparel'),
  (gen_random_uuid(), 'Digital & Gifts', 'digital-gifts', 1, NULL, 5, 'Digital resources, media, and curated gift collections')
ON CONFLICT DO NOTHING;

-- Step 2: Restore and create all layer 2 subcategories

-- Spiritual Practice subcategories (Prayer & Remembrance + Reflection & Inner Work)
INSERT INTO categories (id, name, slug, layer, parent_id, sort_order) VALUES
(gen_random_uuid(), 'Prayer Beads & Counters', 'prayer-beads-counters', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 1),
(gen_random_uuid(), 'Prayer Mats & Rugs', 'prayer-mats-rugs', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 2),
(gen_random_uuid(), 'Prayer Books & Aids', 'prayer-books-aids', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 3),
(gen_random_uuid(), 'Daily Remembrance Tools', 'daily-remembrance-tools', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 4),
(gen_random_uuid(), 'Travel Prayer Essentials', 'travel-prayer-essentials', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 5),
(gen_random_uuid(), 'Prayer Accessories', 'prayer-accessories', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 6),
(gen_random_uuid(), 'Time & Rhythm Tools', 'time-rhythm-tools', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 7),
(gen_random_uuid(), 'Quiet Prayer Spaces', 'quiet-prayer-spaces', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 8),
(gen_random_uuid(), 'Spiritual Journals', 'spiritual-journals', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 9),
(gen_random_uuid(), 'Meditation & Contemplation Tools', 'meditation-contemplation-tools', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 10),
(gen_random_uuid(), 'Breathwork & Presence Aids', 'breathwork-presence-aids', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 11),
(gen_random_uuid(), 'Retreat & Stillness Kits', 'retreat-stillness-kits', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 12),
(gen_random_uuid(), 'Silence & Fasting Aids', 'silence-fasting-aids', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 13),
(gen_random_uuid(), 'Night Practice Tools', 'night-practice-tools', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 14),
(gen_random_uuid(), 'Intention & Habit Trackers', 'intention-habit-trackers', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 15),
(gen_random_uuid(), 'Dream & Vision Recording', 'dream-vision-recording', 2, (SELECT id FROM categories WHERE slug = 'spiritual-practice' AND layer = 1), 16)
ON CONFLICT DO NOTHING;

-- Sacred Living subcategories (Sacred Space & Home + Rituals & Life Moments)
INSERT INTO categories (id, name, slug, layer, parent_id, sort_order) VALUES
(gen_random_uuid(), 'Prayer Corners & Altars', 'prayer-corners-altars', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 1),
(gen_random_uuid(), 'Wall Blessings & Inscriptions', 'wall-blessings-inscriptions', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 2),
(gen_random_uuid(), 'Sacred Lighting', 'sacred-lighting', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 3),
(gen_random_uuid(), 'Table & Hospitality Items', 'table-hospitality-items', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 4),
(gen_random_uuid(), 'Textiles & Soft Furnishings', 'textiles-soft-furnishings', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 5),
(gen_random_uuid(), 'Entryway & Threshold Items', 'entryway-threshold-items', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 6),
(gen_random_uuid(), 'Home Fragrance', 'home-fragrance', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 7),
(gen_random_uuid(), 'Sacred Storage & Organization', 'sacred-storage-organization', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 8),
(gen_random_uuid(), 'Birth & Welcome', 'birth-welcome', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 9),
(gen_random_uuid(), 'Coming of Age', 'coming-of-age', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 10),
(gen_random_uuid(), 'Marriage & Union', 'marriage-union', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 11),
(gen_random_uuid(), 'New Home', 'new-home', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 12),
(gen_random_uuid(), 'Healing & Illness', 'healing-illness', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 13),
(gen_random_uuid(), 'Mourning & Remembrance', 'mourning-remembrance', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 14),
(gen_random_uuid(), 'Pilgrimage & Sacred Travel', 'pilgrimage-sacred-travel', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 15),
(gen_random_uuid(), 'Blessing Ceremonies', 'blessing-ceremonies', 2, (SELECT id FROM categories WHERE slug = 'sacred-living' AND layer = 1), 16)
ON CONFLICT DO NOTHING;

-- Learning & Scripture subcategories (Physical books only)
INSERT INTO categories (id, name, slug, layer, parent_id, sort_order) VALUES
(gen_random_uuid(), 'Sacred Texts', 'sacred-texts', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 1),
(gen_random_uuid(), 'Study Editions & Commentaries', 'study-editions-commentaries', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 2),
(gen_random_uuid(), 'Beginner Guides', 'beginner-guides', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 3),
(gen_random_uuid(), 'Advanced Spiritual Texts', 'advanced-spiritual-texts', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 4),
(gen_random_uuid(), 'Ethics & Moral Teachings', 'ethics-moral-teachings', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 5),
(gen_random_uuid(), 'Comparative Abrahamic Studies', 'comparative-abrahamic-studies', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 6),
(gen_random_uuid(), 'Journals & Study Notebooks', 'journals-study-notebooks', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 7),
(gen_random_uuid(), 'Language & Translation Aids', 'language-translation-aids', 2, (SELECT id FROM categories WHERE slug = 'learning-scripture' AND layer = 1), 8)
ON CONFLICT DO NOTHING;

-- Art & Expression subcategories (Art + Music + Apparel)
INSERT INTO categories (id, name, slug, layer, parent_id, sort_order) VALUES
(gen_random_uuid(), 'Calligraphy & Sacred Text Art', 'calligraphy-sacred-text-art', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 1),
(gen_random_uuid(), 'Sacred Geometry', 'sacred-geometry', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 2),
(gen_random_uuid(), 'Icon-Inspired Art', 'icon-inspired-art', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 3),
(gen_random_uuid(), 'Heritage & Manuscript Art', 'heritage-manuscript-art', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 4),
(gen_random_uuid(), 'Sculptural Objects', 'sculptural-objects', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 5),
(gen_random_uuid(), 'Desk & Study Art', 'desk-study-art', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 6),
(gen_random_uuid(), 'Limited & Collector Editions', 'limited-collector-editions', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 7),
(gen_random_uuid(), 'Children & Family Art', 'children-family-art', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 8),
(gen_random_uuid(), 'Sacred Music & Chants', 'sacred-music-chants', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 9),
(gen_random_uuid(), 'Instrumental Soundscapes', 'instrumental-soundscapes', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 10),
(gen_random_uuid(), 'Guided Listening Sessions', 'guided-listening-sessions', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 11),
(gen_random_uuid(), 'Night & Dawn Sound Sets', 'night-dawn-sound-sets', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 12),
(gen_random_uuid(), 'Silence Timers & Bells', 'silence-timers-bells', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 13),
(gen_random_uuid(), 'Live Session Recordings', 'live-session-recordings', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 14),
(gen_random_uuid(), 'Prayer Call & Adhan Collections', 'prayer-call-adhan', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 15),
(gen_random_uuid(), 'Ambient & Background Sound', 'ambient-background-sound', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 16),
(gen_random_uuid(), 'Modest Wear', 'modest-wear', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 17),
(gen_random_uuid(), 'Scarves & Shawls', 'scarves-shawls', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 18),
(gen_random_uuid(), 'Outerwear & Layers', 'outerwear-layers', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 19),
(gen_random_uuid(), 'Headwear', 'headwear', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 20),
(gen_random_uuid(), 'Bags & Totes', 'bags-totes', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 21),
(gen_random_uuid(), 'Jewelry', 'jewelry-non-ritual', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 22),
(gen_random_uuid(), 'Limited Edition Pieces', 'limited-edition-pieces', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 23),
(gen_random_uuid(), 'Accessories & Small Items', 'accessories-small-items', 2, (SELECT id FROM categories WHERE slug = 'art-expression' AND layer = 1), 24)
ON CONFLICT DO NOTHING;

-- Digital & Gifts subcategories (Digital resources + Gift collections)
INSERT INTO categories (id, name, slug, layer, parent_id, sort_order) VALUES
(gen_random_uuid(), 'eBooks & PDFs', 'ebooks-pdfs', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 1),
(gen_random_uuid(), 'Audio Programs', 'audio-programs', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 2),
(gen_random_uuid(), 'Video Teachings', 'video-teachings', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 3),
(gen_random_uuid(), 'Guided Practices', 'guided-practices', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 4),
(gen_random_uuid(), 'Downloadable Journals', 'downloadable-journals', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 5),
(gen_random_uuid(), 'Annual Subscriptions', 'annual-subscriptions', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 6),
(gen_random_uuid(), 'Digital Gift Cards', 'digital-gift-cards', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 7),
(gen_random_uuid(), 'Digital Courses & Workshops', 'digital-courses-workshops', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 8),
(gen_random_uuid(), 'Gift Sets & Bundles', 'gift-sets-bundles', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 9),
(gen_random_uuid(), 'Gifts Under $50', 'gifts-under-50', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 10),
(gen_random_uuid(), 'Gifts Under $100', 'gifts-under-100', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 11),
(gen_random_uuid(), 'Host & Guest Gifts', 'host-guest-gifts', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 12),
(gen_random_uuid(), 'Gratitude & Thank You Gifts', 'gratitude-thankyou-gifts', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 13),
(gen_random_uuid(), 'Scholar & Student Gifts', 'scholar-student-gifts', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 14),
(gen_random_uuid(), 'Spiritual Beginner Kits', 'spiritual-beginner-kits', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 15),
(gen_random_uuid(), 'Seasonal Collections', 'seasonal-collections', 2, (SELECT id FROM categories WHERE slug = 'digital-gifts' AND layer = 1), 16)
ON CONFLICT DO NOTHING;
