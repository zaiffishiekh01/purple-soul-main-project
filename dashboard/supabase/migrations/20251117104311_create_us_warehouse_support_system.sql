/*
  # Create US Warehouse Support System
  
  1. Purpose
    - Allow vendors to request free storage at US warehouse
    - Track inventory shipments to warehouse
    - Manage end-of-period returns and liquidation
    - Clear cost allocation: vendor pays shipping both ways
  
  2. New Tables
    - `warehouse_requests`
      - Vendor requests for warehouse storage program
      - Includes shipping cost acknowledgment
      - Status tracking and admin approval
    
    - `warehouse_inventory`
      - Track inventory stored at US warehouse
      - Manage stock levels and end-of-period handling
  
  3. Security
    - Enable RLS on all tables
    - Vendors can only see their own data
    - Admins can see and manage all data
  
  4. Cost Model
    - Storage: FREE
    - Shipping TO warehouse: Vendor pays
    - Return shipping FROM warehouse: Vendor pays
    - Liquidation/donation: Optional, vendor choice
*/

-- Create warehouse_requests table
CREATE TABLE IF NOT EXISTS warehouse_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Request details
  request_type text NOT NULL CHECK (request_type IN ('SEASONAL', 'YEAR_ROUND', 'TRIAL')),
  expected_inventory_value decimal(10,2) NOT NULL,
  expected_sku_count integer NOT NULL,
  product_categories text[] NOT NULL DEFAULT '{}',
  estimated_arrival_date date,
  campaign_duration_months integer DEFAULT 6,
  
  -- Shipping cost acknowledgment
  shipping_acknowledgment boolean NOT NULL DEFAULT false,
  shipping_to_warehouse_paid boolean DEFAULT false,
  return_shipping_option text CHECK (return_shipping_option IN ('RETURN_TO_ME', 'LIQUIDATE', 'DONATE')),
  
  -- Status and approval
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled')),
  
  -- Admin review
  reviewed_by_admin_id uuid REFERENCES admin_users(id),
  reviewed_at timestamptz,
  admin_notes text,
  rejection_reason text,
  
  -- Warehouse details (filled on approval)
  warehouse_address text,
  warehouse_contact_email text,
  warehouse_contact_phone text,
  arrival_deadline date,
  program_end_date date,
  
  -- Vendor notes
  vendor_notes text,
  special_requirements text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create warehouse_inventory table
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_request_id uuid NOT NULL REFERENCES warehouse_requests(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  
  -- Inventory details
  sku text NOT NULL,
  product_name text NOT NULL,
  quantity_received integer NOT NULL DEFAULT 0,
  quantity_sold integer NOT NULL DEFAULT 0,
  quantity_remaining integer NOT NULL DEFAULT 0,
  
  -- Tracking
  received_at timestamptz,
  location_in_warehouse text,
  
  -- End-of-period handling
  end_action text CHECK (end_action IN ('RETURN', 'LIQUIDATE', 'DONATE', 'PENDING')),
  end_action_date timestamptz,
  return_shipping_cost decimal(10,2),
  return_tracking_number text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_requests_vendor ON warehouse_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_requests_status ON warehouse_requests(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_requests_created ON warehouse_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_request ON warehouse_inventory(warehouse_request_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_vendor ON warehouse_inventory(vendor_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_product ON warehouse_inventory(product_id);

-- Enable RLS
ALTER TABLE warehouse_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for warehouse_requests

-- Vendors can view their own requests
CREATE POLICY "Vendors can view own warehouse requests"
  ON warehouse_requests
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Vendors can create their own requests
CREATE POLICY "Vendors can create warehouse requests"
  ON warehouse_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Vendors can update their own pending requests
CREATE POLICY "Vendors can update own pending requests"
  ON warehouse_requests
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
    AND status = 'pending'
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all warehouse requests"
  ON warehouse_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admins can update all requests
CREATE POLICY "Admins can update warehouse requests"
  ON warehouse_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies for warehouse_inventory

-- Vendors can view their own inventory
CREATE POLICY "Vendors can view own warehouse inventory"
  ON warehouse_inventory
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Admins can view all inventory
CREATE POLICY "Admins can view all warehouse inventory"
  ON warehouse_inventory
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admins can insert inventory records
CREATE POLICY "Admins can insert warehouse inventory"
  ON warehouse_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admins can update inventory records
CREATE POLICY "Admins can update warehouse inventory"
  ON warehouse_inventory
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Add comments for documentation
COMMENT ON TABLE warehouse_requests IS 'Vendor requests for free US warehouse storage. Vendor pays shipping TO and FROM warehouse.';
COMMENT ON TABLE warehouse_inventory IS 'Track inventory stored at US warehouse and end-of-period handling.';
COMMENT ON COLUMN warehouse_requests.shipping_acknowledgment IS 'Vendor acknowledges they pay for shipping to warehouse and return shipping';
COMMENT ON COLUMN warehouse_requests.return_shipping_option IS 'Vendor choice at end: RETURN_TO_ME, LIQUIDATE, or DONATE';
