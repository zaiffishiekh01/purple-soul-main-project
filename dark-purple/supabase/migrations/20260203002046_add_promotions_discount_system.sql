/*
  # Promotions & Discount System

  ## Overview
  Flexible promotion and discount system supporting coupon codes, percentage discounts,
  fixed-amount discounts, category-wide sales, product-specific promotions, and
  automatic discounts with rules and constraints.

  ## New Tables
  
  ### `coupons`
  Coupon code management with usage tracking and constraints
  
  ### `promotions`
  Automatic promotions and sales campaigns
  
  ### `coupon_usage`
  Track coupon usage per customer
  
  ### `promotion_usage`
  Track automatic promotion applications

  ## Changes to Existing Tables
  
  ### `orders`
  - Add discount tracking columns
  
  ## Functions
  - `validate_coupon()` - Check if coupon is valid and applicable
  - `get_applicable_promotions()` - Find promotions for products
  
  ## Security
  - Enable RLS on all tables
  - Customers can view active coupons/promotions
  - Only admins can create/manage promotions
*/

-- Add discount columns to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_discount'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_discount decimal(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'promotion_discount'
  ) THEN
    ALTER TABLE orders ADD COLUMN promotion_discount decimal(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_discount'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_discount decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value decimal(10,2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount decimal(10,2) DEFAULT 0,
  max_discount_amount decimal(10,2),
  usage_limit integer,
  usage_count integer DEFAULT 0 NOT NULL,
  per_user_limit integer DEFAULT 1,
  start_date timestamptz DEFAULT now() NOT NULL,
  end_date timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  promotion_type text NOT NULL CHECK (promotion_type IN ('product_sale', 'category_sale', 'bundle', 'buy_x_get_y')),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value decimal(10,2) NOT NULL CHECK (discount_value > 0),
  target_products uuid[] DEFAULT ARRAY[]::uuid[],
  target_categories text[] DEFAULT ARRAY[]::text[],
  min_quantity integer DEFAULT 1,
  bundle_products jsonb DEFAULT '{}'::jsonb,
  priority integer DEFAULT 0,
  start_date timestamptz DEFAULT now() NOT NULL,
  end_date timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create promotion_usage table
CREATE TABLE IF NOT EXISTS promotion_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  discount_amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code text,
  p_user_id uuid,
  p_cart_total decimal
)
RETURNS jsonb AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_user_usage_count integer;
  v_discount decimal(10,2);
BEGIN
  SELECT * INTO v_coupon FROM coupons WHERE code = p_code AND is_active = true;
  
  IF v_coupon.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid coupon code');
  END IF;
  
  IF now() < v_coupon.start_date THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Coupon not yet valid');
  END IF;
  
  IF v_coupon.end_date IS NOT NULL AND now() > v_coupon.end_date THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Coupon has expired');
  END IF;
  
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Coupon usage limit reached');
  END IF;
  
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
    
    IF v_user_usage_count >= v_coupon.per_user_limit THEN
      RETURN jsonb_build_object('valid', false, 'error', 'You have already used this coupon');
    END IF;
  END IF;
  
  IF p_cart_total < v_coupon.min_purchase_amount THEN
    RETURN jsonb_build_object('valid', false, 'error', 
      format('Minimum purchase of $%s required', v_coupon.min_purchase_amount));
  END IF;
  
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := (p_cart_total * v_coupon.discount_value / 100);
    IF v_coupon.max_discount_amount IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_coupon.max_discount_amount);
    END IF;
  ELSIF v_coupon.discount_type = 'fixed_amount' THEN
    v_discount := LEAST(v_coupon.discount_value, p_cart_total);
  ELSE
    v_discount := 0;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true, 'coupon_id', v_coupon.id, 'discount_amount', v_discount,
    'discount_type', v_coupon.discount_type, 'description', v_coupon.description
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get applicable promotions
CREATE OR REPLACE FUNCTION get_applicable_promotions(
  p_product_ids uuid[], p_category_slugs text[]
)
RETURNS TABLE (promotion_id uuid, name text, discount_type text, discount_value decimal, priority integer) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.discount_type, p.discount_value, p.priority
  FROM promotions p
  WHERE p.is_active = true AND now() >= p.start_date AND (p.end_date IS NULL OR now() <= p.end_date)
    AND (p.target_products && p_product_ids OR p.target_categories && p_category_slugs OR 
         (array_length(p.target_products, 1) IS NULL AND array_length(p.target_categories, 1) IS NULL))
  ORDER BY p.priority DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON promotions(priority DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_target_products ON promotions USING GIN(target_products);
CREATE INDEX IF NOT EXISTS idx_promotions_target_categories ON promotions USING GIN(target_categories);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion_id ON promotion_usage(promotion_id);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view active promotions" ON promotions FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "Admins can manage promotions" ON promotions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own coupon usage" ON coupon_usage FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create coupon usage" ON coupon_usage FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view own promotion usage" ON promotion_usage FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create promotion usage" ON promotion_usage FOR INSERT TO authenticated WITH CHECK (true);
