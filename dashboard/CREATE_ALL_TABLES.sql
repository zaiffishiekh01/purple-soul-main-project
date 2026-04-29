-- =====================================================
-- COMPLETE DASHBOARD DATABASE SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================
-- This will create:
-- ✅ 15+ tables (vendors, products, orders, etc.)
-- ✅ Row Level Security (RLS) policies
-- ✅ Indexes for performance
-- ✅ Admin approval system
-- =====================================================

-- =====================================================
-- 1. VENDORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  business_name text NOT NULL,
  business_type text DEFAULT '',
  contact_email text NOT NULL,
  contact_phone text DEFAULT '',
  address jsonb DEFAULT '{}',
  tax_id text DEFAULT '',
  status text DEFAULT 'pending',
  logo_url text DEFAULT '',
  is_approved boolean DEFAULT false,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  can_view_customer_phone boolean DEFAULT false,
  can_view_customer_email boolean DEFAULT false,
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

CREATE POLICY "Admins can update vendor approval"
  ON vendors FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_is_approved ON vendors(is_approved);

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  sku text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  base_price numeric(10,2) DEFAULT 0,
  pricing_model text DEFAULT 'FIXED',
  markup_amount numeric(10,2) DEFAULT 0,
  markup_type text DEFAULT 'PERCENT',
  discount_amount numeric(10,2) DEFAULT 0,
  discount_type text DEFAULT 'NONE',
  final_price numeric(10,2) DEFAULT 0,
  commission_percentage numeric(5,2) DEFAULT 0,
  commission_amount numeric(10,2) DEFAULT 0,
  final_marketplace_price numeric(10,2) DEFAULT 0,
  images jsonb DEFAULT '[]',
  color text DEFAULT '',
  size_dimensions text DEFAULT '',
  care_instructions text DEFAULT '',
  material text DEFAULT '',
  shipping_timeline text DEFAULT '',
  stock_quantity integer DEFAULT 0,
  tags jsonb DEFAULT '[]',
  is_digital boolean DEFAULT false,
  download_limit integer DEFAULT 5,
  license_duration_days integer DEFAULT 365,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved vendors can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- =====================================================
-- 3. INVENTORY TABLE
-- =====================================================
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

CREATE POLICY "Approved vendors can view own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can insert own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_inventory_vendor_id ON inventory(vendor_id);

-- =====================================================
-- 4. ORDERS TABLE
-- =====================================================
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
  discount_amount numeric(10,2) DEFAULT 0,
  discount_type text DEFAULT 'NONE',
  discount_note text DEFAULT '',
  payment_status text DEFAULT 'pending',
  payment_method text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved vendors can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- =====================================================
-- 5. ORDER ITEMS TABLE
-- =====================================================
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
  USING (order_id IN (SELECT id FROM orders WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- 6. SHIPMENTS TABLE
-- =====================================================
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

CREATE POLICY "Approved vendors can view own shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can insert own shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_shipments_vendor_id ON shipments(vendor_id);

-- =====================================================
-- 7. RETURNS TABLE
-- =====================================================
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

CREATE POLICY "Approved vendors can view own returns"
  ON returns FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own returns"
  ON returns FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_returns_vendor_id ON returns(vendor_id);

-- =====================================================
-- 8. LABELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved vendors can view own labels"
  ON labels FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can insert own labels"
  ON labels FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own labels"
  ON labels FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can delete own labels"
  ON labels FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

-- =====================================================
-- 9. ORDER LABELS TABLE
-- =====================================================
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
  USING (order_id IN (SELECT id FROM orders WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));

CREATE POLICY "Vendors can manage own order labels"
  ON order_labels FOR ALL
  TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())))
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));

-- =====================================================
-- 10. TRANSACTIONS TABLE
-- =====================================================
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

CREATE POLICY "Approved vendors can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON transactions(vendor_id);

-- =====================================================
-- 11. PAYOUTS TABLE
-- =====================================================
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

CREATE POLICY "Approved vendors can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

-- =====================================================
-- 12. NOTIFICATIONS TABLE
-- =====================================================
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

CREATE POLICY "Approved vendors can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_notifications_vendor_id ON notifications(vendor_id);

-- =====================================================
-- 13. SUPPORT TICKETS TABLE
-- =====================================================
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

CREATE POLICY "Approved vendors can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can insert own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE INDEX IF NOT EXISTS idx_support_tickets_vendor_id ON support_tickets(vendor_id);

-- =====================================================
-- 14. SUPPORT MESSAGES TABLE
-- =====================================================
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
  USING (ticket_id IN (SELECT id FROM support_tickets WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));

CREATE POLICY "Vendors can insert own ticket messages"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (ticket_id IN (SELECT id FROM support_tickets WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));

-- =====================================================
-- 15. ADMIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  role text DEFAULT 'admin',
  permissions jsonb DEFAULT '{"manage_vendors": true, "manage_orders": true, "manage_products": true, "view_analytics": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update admin_users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- =====================================================
-- ADDITIONAL TABLES (Brief versions for full functionality)
-- =====================================================

-- Shipping Labels
CREATE TABLE IF NOT EXISTS shipping_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  order_id uuid REFERENCES orders(id),
  carrier text DEFAULT '',
  service_level text DEFAULT 'standard',
  tracking_number text DEFAULT '',
  label_url text DEFAULT '',
  status text DEFAULT 'draft',
  cost numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved vendors can view own shipping labels"
  ON shipping_labels FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can insert own shipping labels"
  ON shipping_labels FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own shipping labels"
  ON shipping_labels FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

-- Payout Settings
CREATE TABLE IF NOT EXISTS payout_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL UNIQUE,
  bank_name text DEFAULT '',
  account_holder_name text DEFAULT '',
  account_number text DEFAULT '',
  routing_number text DEFAULT '',
  swift_code text DEFAULT '',
  payout_method text DEFAULT 'bank_transfer',
  payout_schedule text DEFAULT 'weekly',
  minimum_payout numeric(10,2) DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payout_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved vendors can view own payout settings"
  ON payout_settings FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can insert own payout settings"
  ON payout_settings FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

CREATE POLICY "Approved vendors can update own payout settings"
  ON payout_settings FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid() AND is_approved = true));

-- Product Import History
CREATE TABLE IF NOT EXISTS product_import_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  total_rows integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  status text DEFAULT 'processing',
  error_log jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE product_import_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own import history"
  ON product_import_history FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own import history"
  ON product_import_history FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Return Items
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
  USING (return_id IN (SELECT id FROM returns WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show all created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show vendor count
SELECT COUNT(*) as vendor_count FROM vendors;

-- Show admin count
SELECT COUNT(*) as admin_count FROM admin_users;
