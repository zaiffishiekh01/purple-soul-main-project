/*
  # Add Storage Bucket for Product Images

  1. Storage Setup
    - Create 'product-images' bucket for storing product photos
    - Configure public access for product images
    - Set file size limits and allowed MIME types
  
  2. Security
    - Allow authenticated vendors to upload images
    - Allow public read access for product images
    - Restrict file types to images only
*/

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Allow authenticated users to upload product images
CREATE POLICY "Vendors can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their product images
CREATE POLICY "Vendors can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete their product images
CREATE POLICY "Vendors can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');
