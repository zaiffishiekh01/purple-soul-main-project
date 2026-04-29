/*
  # Add Platform Commission System

  1. New Tables
    - `platform_settings`
      - Global platform commission rate setting
      - Applied to all vendor products automatically

  2. Changes to Products Table
    - Add `commission_percentage` column to store applied commission rate
    - Add `commission_amount` column to store calculated commission
    - Add `final_marketplace_price` column to store vendor price + commission
    - Add database trigger to auto-calculate commission on product insert/update

  3. Security
    - RLS policies for platform_settings (admin only)
    - Vendors cannot see or modify commission calculations
    - Commission is automatically applied to vendor's quoted price

  4. Business Logic
    - Vendor uploads product with their price (e.g., $100)
    - Platform commission (e.g., 15%) is added automatically
    - Final marketplace price = vendor price + commission = $115
    - Commission shown in admin dashboard
*/

-- Create platform_settings table for global settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage platform settings
CREATE POLICY "Admins can manage platform settings"
  ON platform_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Insert default platform commission rate (15%)
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES (
  'platform_commission_rate',
  '15',
  'Platform commission percentage added to vendor prices'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Add commission columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'commission_percentage'
  ) THEN
    ALTER TABLE products ADD COLUMN commission_percentage numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'commission_amount'
  ) THEN
    ALTER TABLE products ADD COLUMN commission_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'final_marketplace_price'
  ) THEN
    ALTER TABLE products ADD COLUMN final_marketplace_price numeric DEFAULT 0;
  END IF;
END $$;

-- Create function to calculate commission on products
CREATE OR REPLACE FUNCTION calculate_product_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commission_rate numeric;
  vendor_price numeric;
BEGIN
  -- Get the current platform commission rate
  SELECT CAST(setting_value AS numeric) INTO commission_rate
  FROM platform_settings
  WHERE setting_key = 'platform_commission_rate';

  -- Default to 15% if not set
  IF commission_rate IS NULL THEN
    commission_rate := 15;
  END IF;

  -- Use the vendor's quoted price (could be final_price if discounts applied, or base price)
  vendor_price := COALESCE(NEW.final_price, NEW.price);

  -- Calculate commission
  NEW.commission_percentage := commission_rate;
  NEW.commission_amount := ROUND((vendor_price * commission_rate / 100), 2);
  NEW.final_marketplace_price := ROUND(vendor_price + NEW.commission_amount, 2);

  RETURN NEW;
END;
$$;

-- Create trigger to auto-calculate commission on product insert/update
DROP TRIGGER IF EXISTS trigger_calculate_product_commission ON products;
CREATE TRIGGER trigger_calculate_product_commission
  BEFORE INSERT OR UPDATE OF price, final_price
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_product_commission();

-- Update existing products with commission
UPDATE products
SET
  commission_percentage = (
    SELECT CAST(setting_value AS numeric)
    FROM platform_settings
    WHERE setting_key = 'platform_commission_rate'
  ),
  commission_amount = ROUND((COALESCE(final_price, price) * (
    SELECT CAST(setting_value AS numeric)
    FROM platform_settings
    WHERE setting_key = 'platform_commission_rate'
  ) / 100), 2),
  final_marketplace_price = ROUND(COALESCE(final_price, price) +
    ROUND((COALESCE(final_price, price) * (
      SELECT CAST(setting_value AS numeric)
      FROM platform_settings
      WHERE setting_key = 'platform_commission_rate'
    ) / 100), 2), 2)
WHERE commission_percentage IS NULL OR commission_amount IS NULL OR final_marketplace_price IS NULL;

-- Add helpful comments
COMMENT ON COLUMN products.commission_percentage IS 'Platform commission rate applied to this product (%)';
COMMENT ON COLUMN products.commission_amount IS 'Calculated commission amount added to vendor price ($)';
COMMENT ON COLUMN products.final_marketplace_price IS 'Final customer-facing price = vendor price + commission ($)';
COMMENT ON TABLE platform_settings IS 'Global platform configuration settings including commission rate';