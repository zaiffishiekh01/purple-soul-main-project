/*
  # Create Storage Buckets

  Creates storage buckets for:
  - product-images: vendor product images
  - test-products: test product offer sample images
  - digital-products: digital product files (private)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('test-products', 'test-products', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('digital-products', 'digital-products', false, 104857600, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- product-images: authenticated users can upload, public can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Vendors can upload product images'
  ) THEN
    CREATE POLICY "Vendors can upload product images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read product images'
  ) THEN
    CREATE POLICY "Public can read product images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete own product images'
  ) THEN
    CREATE POLICY "Authenticated users can delete own product images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- test-products: authenticated users can upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload test product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload test product images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'test-products');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read test product images'
  ) THEN
    CREATE POLICY "Public can read test product images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'test-products');
  END IF;
END $$;

-- digital-products: only authenticated users can access their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Vendors can upload digital products'
  ) THEN
    CREATE POLICY "Vendors can upload digital products"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'digital-products');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can read digital products'
  ) THEN
    CREATE POLICY "Authenticated users can read digital products"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'digital-products');
  END IF;
END $$;
