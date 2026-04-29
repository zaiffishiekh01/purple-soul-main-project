/*
  # Abrahamic Faith Ecommerce Platform - Initial Schema

  ## Overview
  Complete multi-vendor ecommerce platform with full order lifecycle management.
  Supports browsing, cart, checkout, payment, vendor fulfillment, shipping, returns, and refunds.

  ## New Tables
  
  ### Core Entity Tables
  1. `vendors`
     - Vendor business profiles with fulfillment capabilities
     - Fields: id, business_name, email, description, logo_url, status, settings
  
  2. `products`
     - Product catalog with multi-category classification
     - Fields: id, vendor_id, title, description, price, images, layer1_category, layer2_category, traditions, purposes, occasions
  
  3. `categories`
     - Three-layer category system (Layer 1 primary, Layer 2 subcategories, Layer 3 filters)
     - Fields: id, slug, name, layer, parent_id, description
  
  4. `collections`
     - Curated product collections for occasions and themes
     - Fields: id, slug, name, description, image_url, product_ids
  
  ### Shopping & Order Tables
  5. `cart_items`
     - Shopping cart persistence per user
     - Fields: id, user_id, product_id, vendor_id, quantity
  
  6. `orders`
     - Customer orders with multi-vendor support
     - Fields: id, customer_id, status, shipping_address, contact_info, subtotal, tax, shipping_cost, total
  
  7. `order_items`
     - Line items for each order with vendor tracking
     - Fields: id, order_id, product_id, vendor_id, quantity, unit_price, total
  
  8. `shipments`
     - Shipping tracking per vendor in multi-vendor orders
     - Fields: id, order_id, vendor_id, carrier, tracking_number, label_url, status
  
  ### Returns & Refunds Tables
  9. `returns`
     - Customer return requests with approval workflow
     - Fields: id, order_id, customer_id, status, items, reason, notes, images
  
  10. `refunds`
      - Refund processing and tracking
      - Fields: id, order_id, return_id, amount, status, method, processed_at
  
  ### Payment & Users Tables
  11. `payments`
      - Payment transaction records
      - Fields: id, order_id, provider, amount, currency, status, transaction_id
  
  12. `users`
      - Extended user profiles with addresses
      - Fields: id (references auth.users), email, full_name, role, shipping_addresses
  
  ## Security
  - Enable RLS on all tables
  - Customers can only access their own data
  - Vendors can access their products and orders
  - Admins have full access
  
  ## Important Notes
  - Uses UUID primary keys for cross-system compatibility
  - Status enums support complete order lifecycle
  - Multi-vendor architecture with separate shipment tracking
  - Designed for integration with existing vendor dashboard system
*/

-- Create custom types for status enums
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE vendor_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE order_status AS ENUM (
  'created', 'payment_pending', 'paid', 'vendor_confirmed', 
  'picking', 'packed', 'label_created', 'shipped', 'in_transit', 
  'delivered', 'cancelled', 'return_requested', 'return_approved', 
  'return_rejected', 'return_in_transit', 'return_received', 
  'refund_pending', 'refunded'
);
CREATE TYPE shipment_status AS ENUM ('pending', 'label_created', 'shipped', 'in_transit', 'delivered', 'failed');
CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'in_transit', 'received', 'refunded');
CREATE TYPE refund_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  role user_role DEFAULT 'customer',
  shipping_addresses jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  email text NOT NULL UNIQUE,
  description text,
  logo_url text,
  status vendor_status DEFAULT 'pending',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table (3-layer system)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  layer integer NOT NULL CHECK (layer IN (1, 2, 3)),
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  description text,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  product_ids uuid[] DEFAULT ARRAY[]::uuid[],
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  compare_at_price decimal(10,2),
  images text[] DEFAULT ARRAY[]::text[],
  layer1_category_slug text,
  layer2_category_slug text,
  traditions text[] DEFAULT ARRAY[]::text[],
  purposes text[] DEFAULT ARRAY[]::text[],
  occasions text[] DEFAULT ARRAY[]::text[],
  format text,
  sensitivity text,
  materials text,
  care_instructions text,
  shipping_notes text,
  dimensions jsonb,
  weight decimal(8,2),
  stock_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status order_status DEFAULT 'created',
  shipping_address jsonb NOT NULL,
  contact_info jsonb NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  tax decimal(10,2) DEFAULT 0,
  shipping_cost decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  carrier text,
  service_type text,
  tracking_number text,
  label_url text,
  status shipment_status DEFAULT 'pending',
  package_weight decimal(8,2),
  package_dimensions jsonb,
  shipped_at timestamptz,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status return_status DEFAULT 'requested',
  items jsonb NOT NULL,
  reason text NOT NULL,
  notes text,
  images text[] DEFAULT ARRAY[]::text[],
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  return_id uuid REFERENCES returns(id),
  amount decimal(10,2) NOT NULL,
  status refund_status DEFAULT 'pending',
  method text,
  transaction_id text,
  processed_by uuid REFERENCES users(id),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  transaction_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_layer1 ON products(layer1_category_slug);
CREATE INDEX IF NOT EXISTS idx_products_layer2 ON products(layer2_category_slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor ON order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_vendor ON shipments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for vendors table
CREATE POLICY "Anyone can view active vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Vendors can view own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for collections (public read)
CREATE POLICY "Anyone can view active collections"
  ON collections FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for products (public read, vendor write)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- RLS Policies for cart_items
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view orders with their products"
  ON orders FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT DISTINCT order_id FROM order_items 
      WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for order_items
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

CREATE POLICY "Vendors can view their order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

-- RLS Policies for shipments
CREATE POLICY "Customers can view shipments for own orders"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

CREATE POLICY "Vendors can view and manage own shipments"
  ON shipments FOR ALL
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

-- RLS Policies for returns
CREATE POLICY "Customers can view and create own returns"
  ON returns FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can request returns"
  ON returns FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Vendors can view returns for their orders"
  ON returns FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT DISTINCT order_id FROM order_items 
      WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for refunds
CREATE POLICY "Customers can view own refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

-- RLS Policies for payments
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );
