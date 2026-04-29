/*
  # Add Travel Prayer Mats & Surfaces for Pilgrimage

  1. Products Added
    - 7 travel prayer mats and surfaces
    - All lightweight, portable, designed for travel
    - Faith-neutral, suitable for all Abrahamic traditions

  2. Category Placement
    - Layer 1: prayer-remembrance
    - Layer 2: prayer-mats-rugs

  3. Design Principles
    - Portable and compact for pilgrimage
    - Durable for travel conditions
    - Respectful surface for prayer across all faiths
*/

INSERT INTO products (
  vendor_id,
  title,
  description,
  price,
  images,
  layer1_category_slug,
  layer2_category_slug,
  traditions,
  purposes,
  origin,
  materials,
  handmade_process,
  life_moments,
  use_contexts,
  practice_depth,
  time_to_make,
  purpose_description,
  artisan_info
) VALUES
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Foldable Travel Prayer Mat',
  'Lightweight, foldable prayer mat designed for pilgrimage. Fits in luggage, sets up in seconds. Water-resistant backing, comfortable surface. Used across all Abrahamic traditions for kneeling, standing, or sitting prayer.',
  '49.99',
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared', 'Islam', 'Christianity', 'Judaism'],
  ARRAY['Prayer', 'Devotion', 'Travel', 'Pilgrimage'],
  'Anatolia',
  ARRAY['Cotton', 'Polyester'],
  ARRAY['Hand-woven', 'Handcrafted'],
  ARRAY['Pilgrimage', 'Daily Practice'],
  ARRAY['Travel', 'Prayer Space'],
  'Everyday Use',
  '3-5 days',
  'Created for maintaining prayer practice during sacred journeys.',
  'Hand-woven by artisans specializing in portable prayer textiles.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Lightweight Wool Travel Mat',
  'Pure wool travel prayer mat. Naturally antimicrobial, rolls tightly. Perfect for extended pilgrimages. Provides clean, respectful surface for all traditions.',
  '64.99',
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared', 'Islam', 'Christianity', 'Judaism'],
  ARRAY['Prayer', 'Devotion', 'Travel', 'Pilgrimage'],
  'Anatolia',
  ARRAY['Wool'],
  ARRAY['Hand-woven'],
  ARRAY['Pilgrimage'],
  ARRAY['Travel', 'Prayer Space'],
  'Dedicated Practice',
  '5-7 days',
  'Made for pilgrims who need durable, natural-fiber prayer surfaces.',
  'Hand-woven from locally sourced wool by traditional weavers.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Compact Felt Prayer Mat',
  'Dense felt mat that compresses to pocket size. Cushioned yet portable. Provides comfort during long prayer sessions while traveling. Universal across Abrahamic faiths.',
  '39.99',
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared', 'Islam', 'Christianity', 'Judaism'],
  ARRAY['Prayer', 'Devotion', 'Travel'],
  'Central Asia',
  ARRAY['Wool Felt'],
  ARRAY['Hand-felted'],
  ARRAY['Pilgrimage', 'Daily Practice'],
  ARRAY['Travel', 'Prayer Space'],
  'Everyday Use',
  '4-6 days',
  'Designed to offer comfort without bulk during sacred journeys.',
  'Hand-felted by artisans using traditional compression techniques.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Travel Prayer Cloth',
  'Simple, elegant prayer cloth. Marks sacred space anywhere. Folds to handkerchief size. Cotton-linen blend, gentle on knees. Suitable for all Abrahamic prayer practices.',
  '29.99',
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared', 'Islam', 'Christianity', 'Judaism'],
  ARRAY['Prayer', 'Devotion', 'Travel', 'Pilgrimage'],
  'Levant',
  ARRAY['Cotton', 'Linen'],
  ARRAY['Hand-woven'],
  ARRAY['Pilgrimage', 'Daily Practice'],
  ARRAY['Travel'],
  'Everyday Use',
  '2-4 days',
  'Created for minimalist travelers who carry light but pray faithfully.',
  'Hand-woven from natural fibers with simple borders.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Pocket Prayer Rug',
  'Ultra-compact prayer rug fits in large pocket. Unfolds to full size. Waterproof backing for outdoor use. Essential for pilgrims of all Abrahamic traditions.',
  '34.99',
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared', 'Islam', 'Christianity', 'Judaism'],
  ARRAY['Prayer', 'Devotion', 'Travel', 'Pilgrimage'],
  'Global',
  ARRAY['Cotton', 'Waterproof Backing'],
  ARRAY['Small Batch'],
  ARRAY['Pilgrimage', 'Daily Practice'],
  ARRAY['Travel'],
  'Everyday Use',
  '2-3 days',
  'Made for travelers who need prayer readiness at all times.',
  'Produced with durable materials and compact folding design.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Roll-up Prayer Mat with Strap',
  'Classic roll-up design with carrying strap. Shoulder or backpack attachment. Cushioned for comfort, durable for long journeys. Cross-tradition design.',
  '44.99',
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared', 'Islam', 'Christianity', 'Judaism'],
  ARRAY['Prayer', 'Devotion', 'Travel', 'Pilgrimage'],
  'Anatolia',
  ARRAY['Cotton', 'Foam Padding', 'Cotton Strap'],
  ARRAY['Handcrafted'],
  ARRAY['Pilgrimage'],
  ARRAY['Travel', 'Prayer Space'],
  'Everyday Use',
  '4-6 days',
  'Designed for easy carrying during extended sacred journeys.',
  'Handcrafted with attention to portability and comfort.'
),
(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  'Emergency Prayer Sheet',
  'Disposable or reusable prayer sheet. Provides clean surface in any condition. Packed flat, weighs almost nothing. For urgent travel or unexpected prayer needs.',
  '12.99',
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  'prayer-remembrance',
  'prayer-mats-rugs',
  ARRAY['Abrahamic Shared', 'Islam', 'Christianity', 'Judaism'],
  ARRAY['Prayer', 'Devotion', 'Travel'],
  'Global',
  ARRAY['Recycled Paper', 'Cotton Paper'],
  ARRAY['Small Batch'],
  ARRAY['Pilgrimage', 'Daily Practice'],
  ARRAY['Travel'],
  'Everyday Use',
  '1 day',
  'Created for emergency prayer situations or minimalist travel.',
  'Produced from sustainable materials for temporary or light-duty use.'
);
