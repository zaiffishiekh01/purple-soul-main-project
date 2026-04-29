/*
  # Seed Registry Products for All Faith Traditions

  1. Purpose
    - Add curated product seed data for all registry types
    - Organize products by faith tradition (Islam, Christian, Jewish, Interfaith)
    - Cover all celebration types: Wedding, Pilgrimage, Welcome/Birth, Home Blessing

  2. Products Added
    - Wedding Registry Products (Islamic, Christian, Jewish, Interfaith)
    - Pilgrimage Registry Products (Hajj/Umrah, Christian Pilgrimage, Jewish Pilgrimage)
    - Welcome/Birth Products (Islamic Aqiqah, Christian Baptism, Jewish Brit Milah)
    - Home Blessing Products (Islamic, Mezuzah, Christian Home Blessing, Interfaith)

  3. Categories
    - Wedding Gifts
    - Pilgrimage Essentials
    - Birth & Welcome
    - Home & Blessing
    - Seasonal Celebrations
    - Remembrance

  4. Notes
    - All products include proper categorization, pricing, and stock
    - Products are tagged with faith tradition for easy filtering
    - SKUs are unique and follow naming convention
    - Images use placeholder URLs (to be replaced with actual product images)
*/

-- First, ensure categories exist
INSERT INTO categories (name, slug, description) VALUES
  ('Wedding Gifts', 'wedding-gifts', 'Beautiful handcrafted gifts for sacred unions across all traditions'),
  ('Pilgrimage Essentials', 'pilgrimage-essentials', 'Essential items for sacred journeys'),
  ('Birth & Welcome', 'birth-welcome', 'Celebrate new life with meaningful gifts'),
  ('Home & Blessing', 'home-blessing', 'Sacred items to bless and beautify your home'),
  ('Seasonal Celebrations', 'seasonal-celebrations', 'Festive items for sacred holidays'),
  ('Remembrance', 'remembrance', 'Honor loved ones with meaningful tributes')
ON CONFLICT (slug) DO NOTHING;

-- Islamic Wedding Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Islamic Wedding Gift Set - Calligraphy Art',
    'islamic-wedding-calligraphy-set',
    'Elegant Islamic calligraphy art featuring Quran verses about marriage. Perfect wedding gift for Muslim couples.',
    129.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    50,
    true,
    'Canvas, Gold Leaf',
    'Turkey',
    'Calligraphy',
    'IWG-001',
    'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'
  ),
  (
    'Personalized Nikah Certificate Frame',
    'nikah-certificate-frame',
    'Beautifully crafted wooden frame with Islamic geometric patterns for your Nikah certificate.',
    89.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    75,
    true,
    'Walnut Wood',
    'Morocco',
    'Woodwork',
    'IWG-002',
    'https://images.pexels.com/photos/1619654/pexels-photo-1619654.jpeg'
  ),
  (
    'Islamic Couple Prayer Mat Set',
    'islamic-couple-prayer-mat',
    'Matching prayer mats for newlyweds with elegant embroidery and carrying cases.',
    149.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    60,
    false,
    'Velvet, Silk',
    'Pakistan',
    'Textile',
    'IWG-003',
    'https://images.pexels.com/photos/4210779/pexels-photo-4210779.jpeg'
  ),
  (
    'Gold-Trimmed Quran Gift Set',
    'wedding-quran-gift-set',
    'Premium Quran with translation, beautiful gold trim, and wooden display stand. Perfect for newlyweds.',
    199.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    40,
    true,
    'Leather, Gold Leaf',
    'Saudi Arabia',
    'Bookbinding',
    'IWG-004',
    'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg'
  );

-- Christian Wedding Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Unity Cross Wedding Set',
    'unity-cross-wedding-set',
    'Beautiful unity cross ceremony set with three crosses representing God, Bride, and Groom.',
    159.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    45,
    true,
    'Olive Wood',
    'Jerusalem',
    'Woodwork',
    'CWG-001',
    'https://images.pexels.com/photos/8294701/pexels-photo-8294701.jpeg'
  ),
  (
    'Personalized Wedding Bible',
    'personalized-wedding-bible',
    'Premium leather-bound Bible with couples names embossed in gold. Includes devotional guide.',
    179.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    55,
    true,
    'Genuine Leather',
    'USA',
    'Bookbinding',
    'CWG-002',
    'https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg'
  ),
  (
    'Christian Marriage Blessing Wall Art',
    'christian-marriage-blessing-art',
    'Hand-painted canvas featuring scripture from Ephesians 5:25. Perfect for newlywed home.',
    119.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    70,
    false,
    'Canvas, Acrylic Paint',
    'Italy',
    'Painting',
    'CWG-003',
    'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'
  );

-- Jewish Wedding Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Handmade Chuppah Tallit',
    'handmade-chuppah-tallit',
    'Exquisite tallit perfect for chuppah ceremony with traditional tzitzit and atarah.',
    349.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    25,
    true,
    'Silk, Silver Thread',
    'Israel',
    'Textile',
    'JWG-001',
    'https://images.pexels.com/photos/8135904/pexels-photo-8135904.jpeg'
  ),
  (
    'Wedding Ketubah - Modern Design',
    'modern-wedding-ketubah',
    'Contemporary ketubah design with traditional Hebrew text and artistic illumination.',
    299.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    35,
    true,
    'Parchment, Gold Ink',
    'Israel',
    'Calligraphy',
    'JWG-002',
    'https://images.pexels.com/photos/4031867/pexels-photo-4031867.jpeg'
  ),
  (
    'Silver Kiddush Cup Set for Couples',
    'silver-kiddush-cup-couples',
    'Sterling silver kiddush cup set with matching tray. Perfect for Shabbat and holidays.',
    279.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    30,
    true,
    'Sterling Silver',
    'Israel',
    'Metalwork',
    'JWG-003',
    'https://images.pexels.com/photos/6186477/pexels-photo-6186477.jpeg'
  );

-- Interfaith Wedding Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Unity Sand Ceremony Set - Interfaith',
    'unity-sand-ceremony-interfaith',
    'Beautiful unity sand ceremony set suitable for all faith traditions. Includes decorative vessels.',
    99.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    80,
    true,
    'Glass, Sand',
    'USA',
    'Glasswork',
    'UWG-001',
    'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg'
  ),
  (
    'Universal Marriage Blessing Print',
    'universal-marriage-blessing-print',
    'Elegant print featuring blessings from multiple faith traditions. Perfect for interfaith couples.',
    79.99,
    (SELECT id FROM categories WHERE slug = 'wedding-gifts'),
    90,
    false,
    'Archival Paper',
    'USA',
    'Printing',
    'UWG-002',
    'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'
  );

-- Hajj/Umrah Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Deluxe Hajj & Umrah Essential Kit',
    'deluxe-hajj-umrah-kit',
    'Complete kit including ihram, prayer beads, Quran, dua book, and travel accessories.',
    179.99,
    (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials'),
    100,
    true,
    'Cotton, Leather',
    'Saudi Arabia',
    'Textile',
    'HPE-001',
    'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg'
  ),
  (
    'Zamzam Water Carrying Set',
    'zamzam-water-carrier',
    'Premium insulated containers for carrying blessed Zamzam water home safely.',
    49.99,
    (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials'),
    150,
    false,
    'Stainless Steel',
    'Saudi Arabia',
    'Metalwork',
    'HPE-002',
    'https://images.pexels.com/photos/3179601/pexels-photo-3179601.jpeg'
  ),
  (
    'Kaaba Direction Compass',
    'kaaba-direction-compass',
    'Elegant compass showing Qibla direction. Essential for travelers and pilgrims.',
    39.99,
    (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials'),
    200,
    true,
    'Brass, Glass',
    'Turkey',
    'Metalwork',
    'HPE-003',
    'https://images.pexels.com/photos/1098515/pexels-photo-1098515.jpeg'
  );

-- Christian Pilgrimage Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Holy Land Pilgrim Cross Necklace',
    'holy-land-pilgrim-cross',
    'Handcrafted olive wood cross from Jerusalem. Perfect keepsake for Holy Land pilgrims.',
    59.99,
    (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials'),
    120,
    true,
    'Olive Wood',
    'Jerusalem',
    'Woodwork',
    'CPE-001',
    'https://images.pexels.com/photos/6032483/pexels-photo-6032483.jpeg'
  ),
  (
    'Pilgrimage Prayer Journal',
    'pilgrimage-prayer-journal',
    'Beautiful leather journal for documenting your sacred pilgrimage journey.',
    44.99,
    (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials'),
    80,
    false,
    'Leather, Paper',
    'Italy',
    'Bookbinding',
    'CPE-002',
    'https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg'
  );

-- Jewish Pilgrimage Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Jerusalem Stone Travel Prayer Set',
    'jerusalem-stone-prayer-set',
    'Compact prayer set including siddur and tallit katan made from Jerusalem stone.',
    139.99,
    (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials'),
    45,
    true,
    'Jerusalem Stone, Silk',
    'Israel',
    'Stone Carving',
    'JPE-001',
    'https://images.pexels.com/photos/8135904/pexels-photo-8135904.jpeg'
  ),
  (
    'Western Wall Prayer Note Holder',
    'western-wall-prayer-holder',
    'Elegant holder for prayer notes with Western Wall design. Perfect pilgrimage keepsake.',
    34.99,
    (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials'),
    95,
    false,
    'Brass, Velvet',
    'Israel',
    'Metalwork',
    'JPE-002',
    'https://images.pexels.com/photos/6186477/pexels-photo-6186477.jpeg'
  );

-- Islamic Welcome/Birth Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Islamic Baby Gift Set - Aqiqah',
    'islamic-baby-aqiqah-set',
    'Complete Aqiqah celebration set including baby Quran, prayer mat, and Islamic nursery decor.',
    159.99,
    (SELECT id FROM categories WHERE slug = 'birth-welcome'),
    65,
    true,
    'Cotton, Wood',
    'Turkey',
    'Textile',
    'IBW-001',
    'https://images.pexels.com/photos/1667071/pexels-photo-1667071.jpeg'
  ),
  (
    'Personalized Arabic Name Wall Art',
    'personalized-arabic-name-art',
    'Custom calligraphy of baby name in Arabic with Islamic geometric patterns.',
    89.99,
    (SELECT id FROM categories WHERE slug = 'birth-welcome'),
    100,
    true,
    'Canvas, Gold Leaf',
    'Egypt',
    'Calligraphy',
    'IBW-002',
    'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'
  );

-- Christian Welcome/Birth Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Baptism Gown with Bonnet Set',
    'baptism-gown-bonnet-set',
    'Heirloom quality baptism gown with delicate embroidery and matching bonnet.',
    189.99,
    (SELECT id FROM categories WHERE slug = 'birth-welcome'),
    40,
    true,
    'Silk, Lace',
    'Ireland',
    'Textile',
    'CBW-001',
    'https://images.pexels.com/photos/5561299/pexels-photo-5561299.jpeg'
  ),
  (
    'Baptism Candle Set',
    'baptism-candle-set',
    'Elegant candle set for baptism ceremony with personalized engraving option.',
    69.99,
    (SELECT id FROM categories WHERE slug = 'birth-welcome'),
    75,
    false,
    'Beeswax, Wood',
    'Greece',
    'Candle Making',
    'CBW-002',
    'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg'
  );

-- Jewish Welcome/Birth Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Brit Milah Ceremony Set',
    'brit-milah-ceremony-set',
    'Traditional brit milah ceremony set including kiddush cup and decorative pillow.',
    249.99,
    (SELECT id FROM categories WHERE slug = 'birth-welcome'),
    30,
    true,
    'Silver, Silk',
    'Israel',
    'Metalwork',
    'JBW-001',
    'https://images.pexels.com/photos/6186477/pexels-photo-6186477.jpeg'
  ),
  (
    'Baby Naming Ceremony Tallit',
    'baby-naming-tallit',
    'Beautiful small tallit perfect for baby naming ceremonies and simchat bat.',
    129.99,
    (SELECT id FROM categories WHERE slug = 'birth-welcome'),
    50,
    true,
    'Silk, Silver Thread',
    'Israel',
    'Textile',
    'JBW-002',
    'https://images.pexels.com/photos/8135904/pexels-photo-8135904.jpeg'
  );

-- Islamic Home Blessing Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Ayat al-Kursi Wall Art - Large',
    'ayat-kursi-wall-art-large',
    'Stunning large-format Ayat al-Kursi calligraphy for home blessing and protection.',
    199.99,
    (SELECT id FROM categories WHERE slug = 'home-blessing'),
    55,
    true,
    'Wood, Gold Leaf',
    'Turkey',
    'Calligraphy',
    'IHB-001',
    'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'
  ),
  (
    'Islamic Geometric Tile Set',
    'islamic-geometric-tile-set',
    'Handcrafted ceramic tiles with traditional Islamic geometric patterns for home decor.',
    149.99,
    (SELECT id FROM categories WHERE slug = 'home-blessing'),
    40,
    false,
    'Ceramic',
    'Morocco',
    'Ceramics',
    'IHB-002',
    'https://images.pexels.com/photos/4207909/pexels-photo-4207909.jpeg'
  );

-- Christian Home Blessing Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'House Blessing Cross - Olive Wood',
    'house-blessing-cross-olive',
    'Handcrafted olive wood cross from Jerusalem for home blessing ceremonies.',
    79.99,
    (SELECT id FROM categories WHERE slug = 'home-blessing'),
    85,
    true,
    'Olive Wood',
    'Jerusalem',
    'Woodwork',
    'CHB-001',
    'https://images.pexels.com/photos/8294701/pexels-photo-8294701.jpeg'
  ),
  (
    'Christian Home Blessing Prayer Frame',
    'christian-home-blessing-frame',
    'Beautiful frame featuring home blessing prayer and scripture.',
    59.99,
    (SELECT id FROM categories WHERE slug = 'home-blessing'),
    95,
    false,
    'Wood, Glass',
    'USA',
    'Woodwork',
    'CHB-002',
    'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'
  );

-- Jewish Home Blessing Products
INSERT INTO products (name, slug, description, price, category_id, stock, featured, material, origin, craft_type, sku, image_url) VALUES
  (
    'Premium Mezuzah Case Set',
    'premium-mezuzah-case-set',
    'Sterling silver mezuzah cases for all doorposts. Includes kosher scrolls.',
    329.99,
    (SELECT id FROM categories WHERE slug = 'home-blessing'),
    35,
    true,
    'Sterling Silver',
    'Israel',
    'Metalwork',
    'JHB-001',
    'https://images.pexels.com/photos/6186477/pexels-photo-6186477.jpeg'
  ),
  (
    'Birkat Habayit Home Blessing Plaque',
    'birkat-habayit-plaque',
    'Elegant home blessing plaque with Hebrew and English text.',
    89.99,
    (SELECT id FROM categories WHERE slug = 'home-blessing'),
    70,
    true,
    'Brass, Wood',
    'Israel',
    'Metalwork',
    'JHB-002',
    'https://images.pexels.com/photos/4031867/pexels-photo-4031867.jpeg'
  );

-- Add product tags for faith traditions
INSERT INTO product_tags (product_id, tag)
SELECT id, 'Islamic' FROM products WHERE sku LIKE 'I%'
UNION ALL
SELECT id, 'Christian' FROM products WHERE sku LIKE 'C%'
UNION ALL
SELECT id, 'Jewish' FROM products WHERE sku LIKE 'J%'
UNION ALL
SELECT id, 'Interfaith' FROM products WHERE sku LIKE 'U%'
UNION ALL
SELECT id, 'Wedding' FROM products WHERE category_id = (SELECT id FROM categories WHERE slug = 'wedding-gifts')
UNION ALL
SELECT id, 'Pilgrimage' FROM products WHERE category_id = (SELECT id FROM categories WHERE slug = 'pilgrimage-essentials')
UNION ALL
SELECT id, 'Birth' FROM products WHERE category_id = (SELECT id FROM categories WHERE slug = 'birth-welcome')
UNION ALL
SELECT id, 'Home Blessing' FROM products WHERE category_id = (SELECT id FROM categories WHERE slug = 'home-blessing');
