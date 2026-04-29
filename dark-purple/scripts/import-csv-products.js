const fs = require('fs');
const path = require('path');

// CSV data (first few rows for testing - full data would be too large)
const csvData = `sku,product_name,top_category,sub_category,faith_tradition,purpose,craft_origin,material,handmade_process,life_moment,use_context,practice_depth,is_digital,is_electronic,price_usd,short_description
SKU-00001,Prayer Beads & Counters Item 1,Prayer & Remembrance,Prayer Beads & Counters,Abrahamic Shared,Study,Anatolia,Wool,Hand-woven,Daily Practice,Prayer Space,Dedicated,false,false,30,"Handcrafted prayer beads & counters supporting prayer, reflection, and sacred living."`;

// Helper function to convert category names to slugs
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Parse CSV
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');

  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const product = {};
    headers.forEach((header, index) => {
      product[header.trim()] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
    });

    products.push(product);
  }

  return products;
}

// Generate SQL for a product
function generateProductSQL(product) {
  const layer1 = toSlug(product.top_category);
  const layer2 = toSlug(product.sub_category);

  const traditions = [`'${product.faith_tradition}'`];
  const purposes = [`'${product.purpose}'`];
  const materials = [`'${product.material}'`];
  const handmadeProcess = [`'${product.handmade_process}'`];
  const lifeMoments = [`'${product.life_moment}'`];
  const useContexts = [`'${product.use_context}'`];

  const description = product.short_description.replace(/'/g, "''");
  const title = product.product_name.replace(/'/g, "''");

  return `(
  '6780a658-1c13-4462-8411-3e09c5f6b0da',
  '${title}',
  '${description}',
  ${product.price_usd},
  ARRAY['https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'],
  '${layer1}',
  '${layer2}',
  ARRAY[${traditions.join(', ')}],
  ARRAY[${purposes.join(', ')}],
  '${product.craft_origin}',
  ARRAY[${materials.join(', ')}],
  ARRAY[${handmadeProcess.join(', ')}],
  ARRAY[${lifeMoments.join(', ')}],
  ARRAY[${useContexts.join(', ')}],
  '${product.practice_depth}',
  '3-5 days',
  '${description}',
  'Handcrafted by skilled artisans.'
)`;
}

console.log('CSV import script ready');
console.log('Slug test:', toSlug('Prayer & Remembrance'));
