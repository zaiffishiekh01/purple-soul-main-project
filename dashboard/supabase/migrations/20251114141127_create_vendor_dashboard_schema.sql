/*
  # Sufi Science Center Vendor Dashboard Schema

  ## Overview
  Complete database schema for vendor dashboard system with comprehensive
  order, inventory, shipping, finance, and analytics management.

  ## New Tables

  ### 1. `vendors`
  - `id` (uuid, primary key) - Unique vendor identifier
  - `user_id` (uuid, foreign key to auth.users) - Associated auth user
  - `business_name` (text) - Vendor business name
  - `business_type` (text) - Type of business
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone
  - `address` (jsonb) - Full address details
  - `tax_id` (text) - Tax identification number
  - `status` (text) - Active, suspended, pending
  - `logo_url` (text) - Vendor logo
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `vendor_id` (uuid, foreign key) - Owning vendor
  - `name` (text) - Product name
  - `description` (text) - Detailed description
  - `category` (text) - Product category
  - `sku` (text) - Stock keeping unit
  - `price` (numeric) - Product price
  - `cost` (numeric) - Cost to vendor
  - `images` (jsonb) - Array of image URLs
  - `status` (text) - Active, draft, archived
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `inventory`
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key) - Associated product
  - `vendor_id` (uuid, foreign key) - Owning vendor
  - `quantity` (integer) - Current stock quantity
  - `reserved_quantity` (integer) - Reserved for orders
  - `low_stock_threshold` (integer) - Alert threshold
  - `warehouse_location` (text) - Storage location
  - `last_restocked_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `orders`
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, foreign key)
  - `order_number` (text) - Human-readable order number
  - `customer_name` (text)
  - `customer_email` (text)
  - `customer_phone` (text)
  - `shipping_address` (jsonb)
  - `billing_address` (jsonb)
  - `status` (text) - Pending, processing, shipped, delivered, cancelled
  - `total_amount` (numeric)
  - `subtotal` (numeric)
  - `tax_amount` (numeric)
  - `shipping_cost` (numeric)
  - `payment_status` (text) - Pending, paid, refunded
  - `payment_method` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `order_items`
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer)
  - `unit_price` (numeric)
  - `subtotal` (numeric)
  - `created_at` (timestamptz)

  ### 6. `shipments`
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `vendor_id` (uuid, foreign key)
  - `tracking_number` (text)
  - `carrier` (text) - USPS, FedEx, UPS, DHL
  - `shipping_method` (text) - Standard, express, overnight
  - `status` (text) - Pending, in_transit, delivered, failed
  - `shipped_at` (timestamptz)
  - `estimated_delivery` (timestamptz)
  - `delivered_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `returns`
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `vendor_id` (uuid, foreign key)
  - `return_number` (text)
  - `reason` (text)
  - `status` (text) - Requested, approved, rejected, received, refunded
  - `return_amount` (numeric)
  - `restocking_fee` (numeric)
  - `refund_method` (text)
  - `notes` (text)
  - `requested_at` (timestamptz)
  - `processed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 8. `return_items`
  - `id` (uuid, primary key)
  - `return_id` (uuid, foreign key)
  - `order_item_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer)
  - `reason` (text)
  - `condition` (text)
  - `created_at` (timestamptz)

  ### 9. `labels`
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, foreign key)
  - `name` (text) - Label name
  - `color` (text) - Hex color code
  - `description` (text)
  - `created_at` (timestamptz)

  ### 10. `order_labels`
  - Junction table for orders and labels (many-to-many)

  ### 11. `transactions`
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, foreign key)
  - `order_id` (uuid, foreign key, nullable)
  - `type` (text) - Sale, refund, payout, fee, adjustment
  - `amount` (numeric)
  - `status` (text) - Pending, completed, failed
  - `description` (text)
  - `created_at` (timestamptz)

  ### 12. `payouts`
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, foreign key)
  - `amount` (numeric)
  - `status` (text) - Pending, processing, completed, failed
  - `method` (text) - Bank transfer, PayPal, etc.
  - `reference_number` (text)
  - `scheduled_date` (date)
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 13. `notifications`
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, foreign key)
  - `type` (text) - Order, inventory, payment, system
  - `title` (text)
  - `message` (text)
  - `is_read` (boolean)
  - `action_url` (text)
  - `created_at` (timestamptz)

  ### 14. `support_tickets`
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, foreign key)
  - `ticket_number` (text)
  - `subject` (text)
  - `category` (text) - Technical, billing, general
  - `priority` (text) - Low, medium, high, urgent
  - `status` (text) - Open, in_progress, resolved, closed
  - `description` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 15. `support_messages`
  - `id` (uuid, primary key)
  - `ticket_id` (uuid, foreign key)
  - `sender_type` (text) - Vendor or support
  - `message` (text)
  - `attachments` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  
  All tables have Row Level Security (RLS) enabled with policies ensuring:
  - Vendors can only access their own data
  - Authentication is required for all operations
  - Data isolation between vendors
*/

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  business_name text NOT NULL,
  business_type text DEFAULT '',
  contact_email text NOT NULL,
  contact_phone text DEFAULT '',
  address jsonb DEFAULT '{}',
  tax_id text DEFAULT '',
  status text DEFAULT 'active',
  logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can insert own profile"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  sku text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  images jsonb DEFAULT '[]',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  quantity integer DEFAULT 0,
  reserved_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  warehouse_location text DEFAULT '',
  last_restocked_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text DEFAULT '',
  shipping_address jsonb DEFAULT '{}',
  billing_address jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  total_amount numeric(10,2) DEFAULT 0,
  subtotal numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  shipping_cost numeric(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending',
  payment_method text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (order_id IN (
    SELECT id FROM orders WHERE vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  ));

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  tracking_number text DEFAULT '',
  carrier text DEFAULT '',
  shipping_method text DEFAULT 'standard',
  status text DEFAULT 'pending',
  shipped_at timestamptz,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create returns table
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  return_number text NOT NULL,
  reason text DEFAULT '',
  status text DEFAULT 'requested',
  return_amount numeric(10,2) DEFAULT 0,
  restocking_fee numeric(10,2) DEFAULT 0,
  refund_method text DEFAULT '',
  notes text DEFAULT '',
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own returns"
  ON returns FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own returns"
  ON returns FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create return_items table
CREATE TABLE IF NOT EXISTS return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid REFERENCES returns(id) NOT NULL,
  order_item_id uuid REFERENCES order_items(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL,
  reason text DEFAULT '',
  condition text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own return items"
  ON return_items FOR SELECT
  TO authenticated
  USING (return_id IN (
    SELECT id FROM returns WHERE vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  ));

-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own labels"
  ON labels FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own labels"
  ON labels FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own labels"
  ON labels FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own labels"
  ON labels FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create order_labels junction table
CREATE TABLE IF NOT EXISTS order_labels (
  order_id uuid REFERENCES orders(id) NOT NULL,
  label_id uuid REFERENCES labels(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (order_id, label_id)
);

ALTER TABLE order_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own order labels"
  ON order_labels FOR SELECT
  TO authenticated
  USING (order_id IN (
    SELECT id FROM orders WHERE vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Vendors can manage own order labels"
  ON order_labels FOR ALL
  TO authenticated
  USING (order_id IN (
    SELECT id FROM orders WHERE vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (order_id IN (
    SELECT id FROM orders WHERE vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  ));

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  order_id uuid REFERENCES orders(id),
  type text NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text DEFAULT 'completed',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  method text DEFAULT '',
  reference_number text DEFAULT '',
  scheduled_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  ticket_number text NOT NULL,
  subject text NOT NULL,
  category text DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) NOT NULL,
  sender_type text NOT NULL,
  message text NOT NULL,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own ticket messages"
  ON support_messages FOR SELECT
  TO authenticated
  USING (ticket_id IN (
    SELECT id FROM support_tickets WHERE vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Vendors can insert own ticket messages"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (ticket_id IN (
    SELECT id FROM support_tickets WHERE vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_id ON inventory(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_vendor_id ON shipments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_returns_vendor_id ON returns(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_vendor_id ON notifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_vendor_id ON support_tickets(vendor_id);