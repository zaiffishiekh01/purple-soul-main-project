/*
  # Import Vendor Catalog Structure

  1. Overview
    - This migration imports vendor catalog products across all major categories
    - Represents the full breadth of the Abrahamic shared catalog
    - Products are mapped to proper category slugs and include all metadata

  2. Categories Covered
    - Prayer & Remembrance (prayer-remembrance)
    - Sacred Space & Home (sacred-space-home)
    - Learning & Scripture (learning-scripture)
    - Rituals & Life Moments (rituals-life-moments)
    - Reflection & Inner Work (reflection-inner-work)
    - Apparel & Personal Expression (apparel-expression)
    - Sacred Art & Aesthetics (sacred-art-aesthetics)

  3. Product Distribution
    - Each category contains multiple subcategories
    - Products span various craft origins, materials, and handmade processes
    - All products are Abrahamic Shared and suitable across traditions

  Note: This migration includes a representative sample. The full catalog of 1,120 products
  follows the same structure and can be imported via bulk loading tools or additional migrations.
*/

-- Sample products demonstrating the structure
-- In production, these would be loaded via CSV import or additional batch migrations

INSERT INTO products (
  vendor_id, title, description, price, images,
  layer1_category_slug, layer2_category_slug,
  traditions, purposes, origin, materials, handmade_process,
  life_moments, use_contexts, practice_depth,
  time_to_make, purpose_description, artisan_info
) VALUES
-- Prayer & Remembrance Category
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Traditional Prayer Beads Set',
  'Handcrafted prayer beads supporting prayer, reflection, and sacred living.',
  30.00,
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-beads-counters',
  ARRAY['Abrahamic Shared'],
  ARRAY['Study', 'Prayer'],
  'Anatolia',
  ARRAY['Wool'],
  ARRAY['Hand-woven'],
  ARRAY['Daily Practice'],
  ARRAY['Prayer Space'],
  'Dedicated',
  '3-5 days',
  'Handcrafted prayer beads supporting prayer, reflection, and sacred living.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Embroidered Prayer Mat',
  'Beautiful hand-embroidered prayer mat for daily devotion.',
  35.00,
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared'],
  ARRAY['Prayer', 'Reflection'],
  'Levant',
  ARRAY['Cotton'],
  ARRAY['Hand-embroidered'],
  ARRAY['Daily Practice'],
  ARRAY['Prayer Space', 'Study'],
  'Occasional',
  '5-7 days',
  'Beautiful hand-embroidered prayer mat for daily devotion.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
-- Sacred Space & Home Category
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Sacred Corner Lighting',
  'Handcrafted lighting for prayer corners and sacred spaces.',
  55.00,
  ARRAY['https://images.pexels.com/photos/6186569/pexels-photo-6186569.jpeg'],
  'sacred-space-home',
  'sacred-lighting',
  ARRAY['Abrahamic Shared'],
  ARRAY['Prayer', 'Home'],
  'Anatolia',
  ARRAY['Metal'],
  ARRAY['Hand-woven'],
  ARRAY['Daily Practice'],
  ARRAY['Prayer Space'],
  'Everyday',
  '4-6 days',
  'Handcrafted lighting for prayer corners and sacred spaces.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Home Blessing Wall Art',
  'Beautiful wall art with blessings and sacred text.',
  45.00,
  ARRAY['https://images.pexels.com/photos/6186569/pexels-photo-6186569.jpeg'],
  'sacred-space-home',
  'wall-blessings-inscriptions',
  ARRAY['Abrahamic Shared'],
  ARRAY['Home', 'Gift'],
  'Levant',
  ARRAY['Mixed Natural'],
  ARRAY['Hand-embroidered'],
  ARRAY['Daily Practice'],
  ARRAY['Home', 'Study'],
  'Dedicated',
  '7-10 days',
  'Beautiful wall art with blessings and sacred text.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
-- Learning & Scripture Category
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Hand-Bound Study Journal',
  'Premium journal for scripture study and reflection.',
  40.00,
  ARRAY['https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg'],
  'learning-scripture',
  'journals-study-notebooks',
  ARRAY['Abrahamic Shared'],
  ARRAY['Study', 'Writing'],
  'Maghreb',
  ARRAY['Silk', 'Leather'],
  ARRAY['Hand-bound'],
  ARRAY['Daily Practice'],
  ARRAY['Study', 'Travel'],
  'Everyday',
  '5-7 days',
  'Premium journal for scripture study and reflection.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Scripture Study Aids Collection',
  'Comprehensive study aids for deeper understanding.',
  60.00,
  ARRAY['https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg'],
  'learning-scripture',
  'study-aids',
  ARRAY['Abrahamic Shared'],
  ARRAY['Study', 'Learning'],
  'Levant',
  ARRAY['Mixed Natural'],
  ARRAY['Hand-embroidered'],
  ARRAY['Daily Practice'],
  ARRAY['Study'],
  'Dedicated',
  '3-5 days',
  'Comprehensive study aids for deeper understanding.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
-- Rituals & Life Moments Category
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'New Home Blessing Kit',
  'Complete kit for blessing a new home.',
  70.00,
  ARRAY['https://images.pexels.com/photos/8675246/pexels-photo-8675246.jpeg'],
  'rituals-life-moments',
  'new-home',
  ARRAY['Abrahamic Shared'],
  ARRAY['Home', 'Gift'],
  'Andalusia',
  ARRAY['Wool', 'Cotton'],
  ARRAY['Small-batch'],
  ARRAY['Daily Practice', 'New Home'],
  ARRAY['Home', 'Gift'],
  'Everyday',
  '5-7 days',
  'Complete kit for blessing a new home.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Wedding Blessing Set',
  'Beautiful set for marriage ceremonies and blessings.',
  45.00,
  ARRAY['https://images.pexels.com/photos/8675246/pexels-photo-8675246.jpeg'],
  'rituals-life-moments',
  'marriage-union',
  ARRAY['Abrahamic Shared'],
  ARRAY['Gift', 'Celebration'],
  'Kashmir',
  ARRAY['Stone', 'Metal'],
  ARRAY['Hand-carved'],
  ARRAY['Marriage', 'Daily Practice'],
  ARRAY['Home', 'Gift'],
  'Occasional',
  '7-10 days',
  'Beautiful set for marriage ceremonies and blessings.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
-- Reflection & Inner Work Category
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Contemplation Journal',
  'Guided journal for deep spiritual reflection.',
  30.00,
  ARRAY['https://images.pexels.com/photos/6216589/pexels-photo-6216589.jpeg'],
  'reflection-inner-work',
  'spiritual-journals',
  ARRAY['Abrahamic Shared'],
  ARRAY['Reflection', 'Writing'],
  'Anatolia',
  ARRAY['Wool', 'Leather'],
  ARRAY['Hand-woven'],
  ARRAY['Daily Practice'],
  ARRAY['Prayer Space', 'Study'],
  'Dedicated',
  '4-6 days',
  'Guided journal for deep spiritual reflection.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Meditation Cushion Set',
  'Comfortable cushions for extended contemplation.',
  65.00,
  ARRAY['https://images.pexels.com/photos/6216589/pexels-photo-6216589.jpeg'],
  'reflection-inner-work',
  'meditation-contemplation-tools',
  ARRAY['Abrahamic Shared'],
  ARRAY['Reflection', 'Prayer'],
  'Levant',
  ARRAY['Cotton', 'Wool'],
  ARRAY['Hand-embroidered'],
  ARRAY['Daily Practice'],
  ARRAY['Prayer Space'],
  'Occasional',
  '5-7 days',
  'Comfortable cushions for extended contemplation.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
-- Apparel & Personal Expression Category
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Modest Prayer Shawl',
  'Elegant shawl for prayer and modest covering.',
  40.00,
  ARRAY['https://images.pexels.com/photos/5728117/pexels-photo-5728117.jpeg'],
  'apparel-expression',
  'scarves-shawls',
  ARRAY['Abrahamic Shared'],
  ARRAY['Prayer', 'Modesty'],
  'Maghreb',
  ARRAY['Silk', 'Cotton'],
  ARRAY['Hand-bound'],
  ARRAY['Daily Practice'],
  ARRAY['Prayer Space', 'Travel'],
  'Everyday',
  '5-7 days',
  'Elegant shawl for prayer and modest covering.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Prayer Cap Collection',
  'Traditional headwear for prayer and daily wear.',
  25.00,
  ARRAY['https://images.pexels.com/photos/5728117/pexels-photo-5728117.jpeg'],
  'apparel-expression',
  'headwear',
  ARRAY['Abrahamic Shared'],
  ARRAY['Prayer', 'Daily Use'],
  'Andalusia',
  ARRAY['Leather', 'Cotton'],
  ARRAY['Small-batch'],
  ARRAY['Daily Practice'],
  ARRAY['Prayer Space', 'Home'],
  'Dedicated',
  '3-5 days',
  'Traditional headwear for prayer and daily wear.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
-- Sacred Art & Aesthetics Category
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Calligraphy Art Piece',
  'Beautiful sacred text calligraphy for wall display.',
  70.00,
  ARRAY['https://images.pexels.com/photos/5699821/pexels-photo-5699821.jpeg'],
  'sacred-art-aesthetics',
  'calligraphy-sacred-text-art',
  ARRAY['Abrahamic Shared'],
  ARRAY['Home', 'Beauty'],
  'Kashmir',
  ARRAY['Cotton', 'Natural Pigments'],
  ARRAY['Hand-carved'],
  ARRAY['Daily Practice'],
  ARRAY['Home', 'Prayer Space'],
  'Everyday',
  '10-14 days',
  'Beautiful sacred text calligraphy for wall display.',
  'Handcrafted by skilled artisans using traditional techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Sacred Geometry Wall Art',
  'Intricate geometric patterns inspired by sacred traditions.',
  50.00,
  ARRAY['https://images.pexels.com/photos/5699821/pexels-photo-5699821.jpeg'],
  'sacred-art-aesthetics',
  'sacred-geometry',
  ARRAY['Abrahamic Shared'],
  ARRAY['Home', 'Beauty'],
  'Anatolia',
  ARRAY['Wood', 'Metal'],
  ARRAY['Hand-woven'],
  ARRAY['Daily Practice'],
  ARRAY['Home', 'Prayer Space'],
  'Dedicated',
  '7-10 days',
  'Intricate geometric patterns inspired by sacred traditions.',
  'Handcrafted by skilled artisans using traditional techniques.'
)
ON CONFLICT DO NOTHING;
