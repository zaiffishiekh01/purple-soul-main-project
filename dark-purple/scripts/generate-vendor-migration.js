#!/usr/bin/env node

/**
 * Script to generate SQL migration from CSV data
 * Parses the vendor CSV and creates INSERT statements
 */

// Helper to convert text to slug
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Escape SQL strings
function escapeSql(str) {
  return str.replace(/'/g, "''");
}

// Generate SQL VALUES for a single product
function generateProductValues(product) {
  const layer1 = toSlug(product.top_category);
  const layer2 = toSlug(product.sub_category);
  const title = escapeSql(product.product_name);
  const description = escapeSql(product.short_description);
  const origin = escapeSql(product.craft_origin);

  // Default images based on category
  const imageMap = {
    'prayer-remembrance': 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg',
    'sacred-space-home': 'https://images.pexels.com/photos/6186569/pexels-photo-6186569.jpeg',
    'learning-scripture': 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg',
    'rituals-life-moments': 'https://images.pexels.com/photos/8675246/pexels-photo-8675246.jpeg',
    'reflection-inner-work': 'https://images.pexels.com/photos/6216589/pexels-photo-6216589.jpeg',
    'apparel-expression': 'https://images.pexels.com/photos/5728117/pexels-photo-5728117.jpeg',
    'sacred-art-aesthetics': 'https://images.pexels.com/photos/5699821/pexels-photo-5699821.jpeg'
  };

  const image = imageMap[layer1] || imageMap['prayer-remembrance'];

  return `  (
    '6780a658-1c13-4462-8411-3e09c5f6b0da',
    '${title}',
    '${description}',
    ${product.price_usd},
    ARRAY['${image}'],
    '${layer1}',
    '${layer2}',
    ARRAY['${escapeSql(product.faith_tradition)}'],
    ARRAY['${escapeSql(product.purpose)}'],
    '${origin}',
    ARRAY['${escapeSql(product.material)}'],
    ARRAY['${escapeSql(product.handmade_process)}'],
    ARRAY['${escapeSql(product.life_moment)}'],
    ARRAY['${escapeSql(product.use_context)}'],
    '${escapeSql(product.practice_depth)}',
    '3-5 days',
    '${description}',
    'Handcrafted by skilled artisans using traditional techniques.'
  )`;
}

// Test the slug function
console.log('Testing slug generation:');
console.log('Prayer & Remembrance =>', toSlug('Prayer & Remembrance'));
console.log('Sacred Space & Home =>', toSlug('Sacred Space & Home'));
console.log('Apparel & Personal Expression =>', toSlug('Apparel & Personal Expression'));

module.exports = { toSlug, escapeSql, generateProductValues };
