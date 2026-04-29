#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the CSV from the document
const csvContent = fs.readFileSync(path.join(__dirname, '../vendor-catalog.csv'), 'utf-8');

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeSql(str) {
  if (!str) return '';
  return str.toString().replace(/'/g, "''");
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map(v => v.replace(/^"|"$/g, ''));
}

const lines = csvContent.trim().split('\n');
const headers = parseCSVLine(lines[0]);

console.log(`Processing ${lines.length - 1} products...`);
console.log(`Headers: ${headers.join(', ')}`);

// Generate SQL migration content
let sqlContent = `/*
  # Import Vendor Catalog Products

  1. Products Added
    - ${lines.length - 1} products from vendor catalog
    - Covers all major categories and subcategories

  2. Category Structure
    - Prayer & Remembrance
    - Sacred Space & Home
    - Learning & Scripture
    - Rituals & Life Moments
    - Reflection & Inner Work
    - Apparel & Personal Expression
    - Sacred Art & Aesthetics

  3. Data Source
    - Vendor catalog CSV with comprehensive product listings
*/\n\n`;

// Image mapping by category
const imageMap = {
  'prayer-remembrance': 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg',
  'sacred-space-home': 'https://images.pexels.com/photos/6186569/pexels-photo-6186569.jpeg',
  'learning-scripture': 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg',
  'rituals-life-moments': 'https://images.pexels.com/photos/8675246/pexels-photo-8675246.jpeg',
  'reflection-inner-work': 'https://images.pexels.com/photos/6216589/pexels-photo-6216589.jpeg',
  'apparel-expression': 'https://images.pexels.com/photos/5728117/pexels-photo-5728117.jpeg',
  'sacred-art-aesthetics': 'https://images.pexels.com/photos/5699821/pexels-photo-5699821.jpeg'
};

// Process in batches of 50
const BATCH_SIZE = 50;
let batchNumber = 1;

for (let i = 1; i < lines.length; i += BATCH_SIZE) {
  const batch = lines.slice(i, Math.min(i + BATCH_SIZE, lines.length));

  sqlContent += `-- Batch ${batchNumber}: Products ${i} to ${Math.min(i + BATCH_SIZE - 1, lines.length - 1)}\n`;
  sqlContent += `INSERT INTO products (\n`;
  sqlContent += `  vendor_id, title, description, price, images,\n`;
  sqlContent += `  layer1_category_slug, layer2_category_slug,\n`;
  sqlContent += `  traditions, purposes, origin, materials, handmade_process,\n`;
  sqlContent += `  life_moments, use_contexts, practice_depth,\n`;
  sqlContent += `  time_to_make, purpose_description, artisan_info\n`;
  sqlContent += `) VALUES\n`;

  const values = batch.map((line, idx) => {
    const cols = parseCSVLine(line);
    const product = {};
    headers.forEach((h, i) => product[h] = cols[i] || '');

    const layer1 = toSlug(product.top_category);
    const layer2 = toSlug(product.sub_category);
    const image = imageMap[layer1] || imageMap['prayer-remembrance'];

    return `(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  '${escapeSql(product.product_name)}',
  '${escapeSql(product.short_description)}',
  ${product.price_usd || '0'},
  ARRAY['${image}'],
  '${layer1}',
  '${layer2}',
  ARRAY['${escapeSql(product.faith_tradition)}'],
  ARRAY['${escapeSql(product.purpose)}'],
  '${escapeSql(product.craft_origin)}',
  ARRAY['${escapeSql(product.material)}'],
  ARRAY['${escapeSql(product.handmade_process)}'],
  ARRAY['${escapeSql(product.life_moment)}'],
  ARRAY['${escapeSql(product.use_context)}'],
  '${escapeSql(product.practice_depth)}',
  '3-5 days',
  '${escapeSql(product.short_description)}',
  'Handcrafted by skilled artisans using traditional techniques.'
)`;
  }).join(',\n');

  sqlContent += values;
  sqlContent += `\nON CONFLICT DO NOTHING;\n\n`;

  batchNumber++;
}

// Write migration file
const migrationPath = path.join(__dirname, '../supabase/migrations');
const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');
const filename = `${timestamp}_import_vendor_catalog.sql`;

fs.writeFileSync(path.join(migrationPath, filename), sqlContent);

console.log(`✓ Generated migration: ${filename}`);
console.log(`✓ Total products: ${lines.length - 1}`);
console.log(`✓ Total batches: ${batchNumber - 1}`);
