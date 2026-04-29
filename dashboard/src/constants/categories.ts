export const PRODUCT_CATEGORIES = [
  'Art & Wall Decor',
  'Jewelry & Accessories',
  'Home & Living',
  'Fashion & Apparel',
  'Wellness & Meditation',
  'Digital Books',
  'Audio Spectrum'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
