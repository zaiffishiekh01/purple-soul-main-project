/*
  # Fix Admin Access to Products and Create Product Guidelines Table

  ## Summary
  1. Add admin SELECT/UPDATE/DELETE policies on products table (admins had no visibility)
  2. Create product_guidelines table with full RLS (table was completely missing)
  3. Add seed data for default guidelines sections

  ## Changes
  - Add "Admins can view all products" SELECT policy on products
  - Add "Admins can update all products" UPDATE policy on products
  - Add "Admins can delete all products" DELETE policy on products
  - Create product_guidelines table
  - Seed default guideline sections
*/

-- 1. Admin policies on products
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Admins can update all products" ON products;
DROP POLICY IF EXISTS "Admins can delete all products" ON products;

CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update all products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete all products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- 2. Create product_guidelines table
CREATE TABLE IF NOT EXISTS product_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  section_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  category text DEFAULT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_guidelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can insert guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can update guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Admins can delete guidelines" ON product_guidelines;
DROP POLICY IF EXISTS "Vendors can view active guidelines" ON product_guidelines;

CREATE POLICY "Admins can view all guidelines"
  ON product_guidelines FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert guidelines"
  ON product_guidelines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update guidelines"
  ON product_guidelines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete guidelines"
  ON product_guidelines FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendors can view active guidelines"
  ON product_guidelines FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (SELECT 1 FROM vendors WHERE user_id = auth.uid())
  );

-- 3. Seed default guideline sections
INSERT INTO product_guidelines (title, content, section_order, is_active)
VALUES
  (
    'Product Image Requirements',
    'All product listings must include a minimum of 4 high-quality images. Images must be at least 800x800 pixels, shot against a white or neutral background. Lifestyle images are encouraged but must not be the primary image. No watermarks, logos, or text overlays allowed on primary images.',
    1,
    true
  ),
  (
    'Product Description Standards',
    'Product descriptions must be accurate, complete, and written in English. Minimum 100 characters. Include key features, materials, dimensions, and care instructions where applicable. Avoid keyword stuffing, misleading claims, or copy from competitor listings. HTML formatting is not permitted.',
    2,
    true
  ),
  (
    'Pricing & Commission Policy',
    'All prices must be listed in USD. The platform charges a commission of 10-15% on each sale depending on your vendor tier. Pricing must remain competitive and consistent with your own website or other platforms. Price gouging or artificial inflation is prohibited.',
    3,
    true
  ),
  (
    'Prohibited Items & Restricted Categories',
    'The following items are strictly prohibited: counterfeit goods, hazardous materials, weapons, illegal substances, and items infringing on intellectual property rights. Certain categories require prior approval. Contact support before listing items in Restricted categories.',
    4,
    true
  ),
  (
    'Shipping & Fulfillment Requirements',
    'All orders must be shipped within 2 business days of confirmation unless a longer processing time is stated in the listing. Tracking information must be uploaded within 24 hours of shipment. Vendors are responsible for proper packaging to prevent damage during transit.',
    5,
    true
  ),
  (
    'Return & Refund Policy',
    'Vendors must honor the platform return policy of 30 days for physical products. Digital products are non-refundable unless defective. Return shipping costs are the responsibility of the vendor unless the item was damaged or incorrectly described. Refunds must be processed within 5 business days of return receipt.',
    6,
    true
  )
ON CONFLICT DO NOTHING;
