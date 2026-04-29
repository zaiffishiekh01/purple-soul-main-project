/*
  # Create Storage Bucket for Test Product Offers
  
  Creates a storage bucket for:
  - Design reference images (uploaded by admins)
  - Sample images (uploaded by vendors in applications)
  - Message attachments (from both sides)
  
  ## Security
  
  - Authenticated users can upload files
  - Public read access for easy viewing
*/

-- Create storage bucket for test product offers
INSERT INTO storage.buckets (id, name, public)
VALUES ('test-product-offers', 'test-product-offers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload test product files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'test-product-offers');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own test product files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'test-product-offers')
  WITH CHECK (bucket_id = 'test-product-offers');

-- Allow public read access
CREATE POLICY "Public read access to test product files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'test-product-offers');