/*
  # Extend Existing E-commerce System for Complete Checkout Flow

  ## Changes
  - Add missing fields to orders table
  - Create carts table for persistent shopping carts  
  - Update cart_items to support both user-based and cart-based
  - Create customer_addresses table for saved addresses
  - Create vendor_orders table for order splitting by vendor
  - Add shipping_methods table
  - Add coupons table
  - Extend existing tables with additional fields needed for checkout flow

  ## Security
  - RLS policies for new tables
  - Maintain existing security model
*/

-- Add address_type enum if not exists
DO $$ BEGIN
  CREATE TYPE address_type AS ENUM ('shipping', 'billing', 'both');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add vendor_order_status if not exists
DO $$ BEGIN
  CREATE TYPE vendor_order_status AS ENUM (
    'pending','accepted','processing','packed','labeled',
    'shipped','delivered','cancelled','returned'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PERSISTENT CARTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text,
  coupon_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(session_token)
);

-- ============================================================================
-- CUSTOMER ADDRESSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_type address_type DEFAULT 'both',
  is_default boolean DEFAULT false,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state_province text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- SHIPPING METHODS
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  carrier text,
  service_code text,
  base_price decimal(10,2) NOT NULL,
  estimated_days_min integer,
  estimated_days_max integer,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- COUPONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value decimal(10,2) NOT NULL,
  min_purchase_amount decimal(10,2) DEFAULT 0,
  max_discount_amount decimal(10,2),
  usage_limit integer,
  times_used integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  discount_amount decimal(10,2) NOT NULL,
  used_at timestamptz DEFAULT now()
);

-- ============================================================================
-- VENDOR ORDERS (for order splitting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  vendor_order_number text UNIQUE NOT NULL,
  status vendor_order_status DEFAULT 'pending',
  subtotal decimal(10,2) NOT NULL,
  shipping_cost decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  accepted_at timestamptz,
  packed_at timestamptz,
  labeled_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_order_id uuid REFERENCES vendor_orders(id) ON DELETE CASCADE NOT NULL,
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add cart_id to cart_items if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'cart_id'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN cart_id uuid REFERENCES carts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add price_at_addition to cart_items if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'price_at_addition'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN price_at_addition decimal(10,2);
  END IF;
END $$;

-- Add order_number to orders if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text UNIQUE;
  END IF;
END $$;

-- Add email to orders if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'email'
  ) THEN
    ALTER TABLE orders ADD COLUMN email text;
  END IF;
END $$;

-- Add billing address fields to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_address jsonb;
  END IF;
END $$;

-- Add discount_amount to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add coupon_code to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code text;
  END IF;
END $$;

-- Add shipping_method_id to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_method_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_method_id uuid REFERENCES shipping_methods(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add confirmed_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN confirmed_at timestamptz;
  END IF;
END $$;

-- Add payment_intent_id to payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'payment_intent_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN payment_intent_id text UNIQUE;
  END IF;
END $$;

-- Add card info to payments (last 4 only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'card_last4'
  ) THEN
    ALTER TABLE payments ADD COLUMN card_last4 text;
    ALTER TABLE payments ADD COLUMN card_brand text;
  END IF;
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_token ON carts(session_token);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_order_id ON vendor_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_vendor_id ON vendor_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_order_items_vendor_order_id ON vendor_order_items(vendor_order_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_order_items ENABLE ROW LEVEL SECURITY;

-- Public policies
CREATE POLICY "Public read shipping methods" 
  ON shipping_methods FOR SELECT TO public 
  USING (is_active = true);

CREATE POLICY "Public read coupons" 
  ON coupons FOR SELECT TO public 
  USING (is_active = true);

-- User policies for addresses
CREATE POLICY "Users view own addresses"
  ON customer_addresses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own addresses"
  ON customer_addresses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own addresses"
  ON customer_addresses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own addresses"
  ON customer_addresses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Cart policies
CREATE POLICY "Users view own cart"
  ON carts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cart"
  ON carts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);