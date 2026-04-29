/*
  # Create Warehouse Management Tables

  ## New Tables:
  1. **warehouse_storage_plans** - Storage pricing plans
  2. **warehouse_requests** - Vendor warehouse requests with plan assignments
  3. **warehouse_inbound_shipments** - Tracking inbound shipments to warehouse
  4. **warehouse_inventory** - Items stored in warehouse per vendor

  ## Security: RLS enabled, admins manage all, vendors see their own
*/

-- ============================================================
-- WAREHOUSE STORAGE PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS warehouse_storage_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  plan_code text NOT NULL UNIQUE,
  description text DEFAULT '',
  min_cubic_feet numeric,
  max_cubic_feet numeric,
  min_pallet_spaces integer,
  max_pallet_spaces integer,
  storage_fee_per_cubic_foot_monthly numeric DEFAULT 0,
  storage_fee_per_pallet_monthly numeric DEFAULT 0,
  receiving_fee_per_pallet numeric DEFAULT 0,
  receiving_fee_per_unit numeric DEFAULT 0,
  pick_pack_fee_per_item numeric DEFAULT 0,
  handling_fee_percentage numeric DEFAULT 0,
  minimum_monthly_fee numeric DEFAULT 0,
  includes_insurance boolean DEFAULT false,
  includes_inventory_management boolean DEFAULT false,
  includes_reporting boolean DEFAULT false,
  priority_processing boolean DEFAULT false,
  dedicated_account_manager boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE warehouse_storage_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage warehouse plans"
  ON warehouse_storage_plans FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Anyone can view active warehouse plans"
  ON warehouse_storage_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Seed default plans
INSERT INTO warehouse_storage_plans (plan_name, plan_code, description, storage_fee_per_cubic_foot_monthly, storage_fee_per_pallet_monthly, receiving_fee_per_pallet, receiving_fee_per_unit, pick_pack_fee_per_item, handling_fee_percentage, minimum_monthly_fee, includes_insurance, includes_inventory_management, includes_reporting, is_active, display_order) VALUES
  ('Starter', 'STARTER', 'For small vendors getting started with fulfillment', 0.50, 25.00, 15.00, 0.50, 1.25, 0, 50.00, false, true, true, true, 1),
  ('Growth', 'GROWTH', 'For growing vendors with moderate inventory volume', 0.40, 20.00, 12.00, 0.40, 1.00, 0, 150.00, true, true, true, true, 2),
  ('Professional', 'PRO', 'For established vendors with high inventory turnover', 0.30, 15.00, 10.00, 0.30, 0.75, 0, 300.00, true, true, true, true, 3),
  ('Enterprise', 'ENTERPRISE', 'Full-service solution for high-volume vendors', 0.20, 12.00, 8.00, 0.20, 0.50, 2, 500.00, true, true, true, true, 4)
ON CONFLICT (plan_code) DO NOTHING;

-- ============================================================
-- WAREHOUSE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS warehouse_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  request_type text DEFAULT 'SEASONAL' CHECK (request_type IN ('SEASONAL', 'YEAR_ROUND', 'TRIAL')),
  expected_inventory_value numeric DEFAULT 0,
  expected_sku_count integer DEFAULT 0,
  product_categories text[] DEFAULT '{}',
  estimated_arrival_date date,
  campaign_duration_months integer DEFAULT 3,
  shipping_acknowledgment boolean DEFAULT false,
  shipping_to_warehouse_paid boolean DEFAULT false,
  return_shipping_option text DEFAULT 'RETURN_TO_ME' CHECK (return_shipping_option IN ('RETURN_TO_ME', 'LIQUIDATE', 'DONATE')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled')),
  storage_plan_id uuid REFERENCES warehouse_storage_plans(id),
  estimated_monthly_storage_cost numeric DEFAULT 0,
  estimated_space_cubic_feet numeric DEFAULT 0,
  estimated_pallet_count integer DEFAULT 0,
  warehouse_address text DEFAULT '',
  warehouse_contact_email text DEFAULT '',
  warehouse_contact_phone text DEFAULT '',
  arrival_deadline date,
  program_end_date date,
  vendor_notes text DEFAULT '',
  special_requirements text DEFAULT '',
  admin_notes text DEFAULT '',
  rejection_reason text DEFAULT '',
  reviewed_by_admin_id uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE warehouse_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own warehouse requests"
  ON warehouse_requests FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can create warehouse requests"
  ON warehouse_requests FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own pending requests"
  ON warehouse_requests FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) AND status = 'pending')
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can select all warehouse requests"
  ON warehouse_requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update warehouse requests"
  ON warehouse_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert warehouse requests"
  ON warehouse_requests FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- ============================================================
-- WAREHOUSE INBOUND SHIPMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS warehouse_inbound_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_request_id uuid REFERENCES warehouse_requests(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  tracking_number text DEFAULT '',
  carrier text DEFAULT '',
  expected_arrival_date date,
  actual_arrival_date date,
  sku_count integer DEFAULT 0,
  unit_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'arrived', 'processed', 'issue')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE warehouse_inbound_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own inbound shipments"
  ON warehouse_inbound_shipments FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all inbound shipments"
  ON warehouse_inbound_shipments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- ============================================================
-- WAREHOUSE INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_request_id uuid REFERENCES warehouse_requests(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  sku text DEFAULT '',
  product_name text DEFAULT '',
  quantity_received integer DEFAULT 0,
  quantity_available integer DEFAULT 0,
  quantity_reserved integer DEFAULT 0,
  quantity_shipped integer DEFAULT 0,
  bin_location text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own warehouse inventory"
  ON warehouse_inventory FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all warehouse inventory"
  ON warehouse_inventory FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_requests_vendor ON warehouse_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_requests_status ON warehouse_requests(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_vendor ON warehouse_inventory(vendor_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inbound_vendor ON warehouse_inbound_shipments(vendor_id);
