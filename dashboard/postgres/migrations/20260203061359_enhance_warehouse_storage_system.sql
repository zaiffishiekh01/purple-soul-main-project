/*
  # Enhanced Warehouse Storage Request System - Industry 2024-2025 Standards

  ## Purpose
  Modernize warehouse storage requests with industry-leading features:
  - Real-time inventory tracking and visibility
  - Advanced Shipping Notice (ASN) system with barcode/QR codes
  - Automated workflow and notifications
  - Capacity planning and space management
  - Performance metrics and KPIs
  - 3PL integration readiness
  - Document generation (BOL, packing slips, labels)

  ## Industry Trends Implemented
  1. Warehouse Management System (WMS) integration patterns
  2. Real-time tracking with IoT-ready structure
  3. Automated status notifications
  4. Smart capacity planning
  5. Performance analytics
  6. Flexible fulfillment workflows

  ## New Tables
  - `warehouse_inbound_shipments`: Track incoming inventory with ASN
  - `warehouse_receiving_log`: Real-time receiving updates
  - `warehouse_capacity`: Space utilization and planning
  - `warehouse_locations`: Smart location management
  - `warehouse_performance_metrics`: KPIs and analytics
  - `warehouse_documents`: BOL, labels, packing slips storage

  ## Enhanced Tables
  - Add tracking fields to `warehouse_requests`
  - Add automation fields to `warehouse_inventory`

  ## Security
  - Enable RLS on all tables
  - Vendors see only their data
  - Admins have full access
*/

-- =============================================
-- 1. INBOUND SHIPMENT TRACKING (ASN System)
-- =============================================

CREATE TABLE IF NOT EXISTS warehouse_inbound_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_request_id uuid NOT NULL REFERENCES warehouse_requests(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Advanced Shipping Notice (ASN)
  asn_number text UNIQUE NOT NULL,
  tracking_number text,
  carrier text CHECK (carrier IN ('UPS', 'FedEx', 'USPS', 'DHL', 'Other')),

  -- Shipment details
  expected_arrival_date date NOT NULL,
  actual_arrival_date date,
  total_boxes integer NOT NULL DEFAULT 1,
  total_pallets integer DEFAULT 0,
  total_weight_lbs decimal(10,2),
  total_value decimal(10,2),

  -- Contents
  sku_list jsonb NOT NULL DEFAULT '[]',
  hazmat_included boolean DEFAULT false,
  temperature_controlled boolean DEFAULT false,
  fragile_items boolean DEFAULT false,

  -- Status tracking
  status text NOT NULL DEFAULT 'in_transit'
    CHECK (status IN ('scheduled', 'in_transit', 'arrived', 'receiving', 'received', 'rejected', 'cancelled')),
  rejection_reason text,

  -- Carrier integration
  carrier_tracking_url text,
  estimated_delivery_date date,
  last_carrier_update timestamptz,
  carrier_status text,

  -- QR/Barcode for receiving
  qr_code text UNIQUE,
  barcode text UNIQUE,

  -- Vendor documents
  bill_of_lading_url text,
  packing_slip_url text,
  commercial_invoice_url text,

  -- Receiving notes
  receiving_notes text,
  quality_check_passed boolean,
  discrepancy_notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  received_at timestamptz
);

-- =============================================
-- 2. WAREHOUSE CAPACITY MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS warehouse_capacity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_name text NOT NULL,
  warehouse_code text UNIQUE NOT NULL,

  -- Capacity metrics
  total_square_feet decimal(10,2) NOT NULL,
  available_square_feet decimal(10,2) NOT NULL,
  total_pallet_positions integer NOT NULL,
  available_pallet_positions integer NOT NULL,

  -- Utilization (calculated)
  utilization_percentage decimal(5,2),

  -- Capacity planning
  reserved_space_sqft decimal(10,2) DEFAULT 0,
  seasonal_capacity_increase_percentage decimal(5,2) DEFAULT 0,

  -- Zone breakdown
  ambient_storage_sqft decimal(10,2),
  climate_controlled_sqft decimal(10,2),
  hazmat_storage_sqft decimal(10,2),

  -- Alerts
  capacity_threshold_warning decimal(5,2) DEFAULT 85.00,
  at_capacity_threshold boolean DEFAULT false,

  -- Active tracking
  is_active boolean DEFAULT true,
  last_audit_date date,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- 3. SMART LOCATION MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS warehouse_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_code text NOT NULL,

  -- Location identifiers
  zone_code text NOT NULL,
  aisle_number text NOT NULL,
  rack_number text NOT NULL,
  shelf_level text NOT NULL,
  bin_number text,

  -- Full location code (e.g., "A-12-05-C-03")
  location_code text UNIQUE NOT NULL,

  -- Location properties
  location_type text CHECK (location_type IN ('pallet', 'shelf', 'floor', 'hanging', 'bin')),
  max_weight_lbs decimal(10,2),
  is_climate_controlled boolean DEFAULT false,
  is_hazmat_approved boolean DEFAULT false,

  -- Occupancy
  is_occupied boolean DEFAULT false,
  current_vendor_id uuid REFERENCES vendors(id),
  current_sku text,

  -- Picking optimization
  pick_frequency_score integer DEFAULT 0,
  is_fast_pick_zone boolean DEFAULT false,

  -- Status
  is_active boolean DEFAULT true,
  blocked_reason text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(warehouse_code, location_code)
);

-- =============================================
-- 4. RECEIVING LOG (Real-time tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS warehouse_receiving_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbound_shipment_id uuid NOT NULL REFERENCES warehouse_inbound_shipments(id) ON DELETE CASCADE,
  warehouse_request_id uuid NOT NULL REFERENCES warehouse_requests(id) ON DELETE CASCADE,

  -- Receiving details
  sku text NOT NULL,
  expected_quantity integer NOT NULL,
  received_quantity integer NOT NULL DEFAULT 0,
  damaged_quantity integer DEFAULT 0,
  missing_quantity integer DEFAULT 0,

  -- Quality control
  condition_rating integer CHECK (condition_rating BETWEEN 1 AND 5),
  passed_inspection boolean DEFAULT true,
  inspection_notes text,

  -- Location assignment
  warehouse_location_id uuid REFERENCES warehouse_locations(id),
  bin_location text,

  -- Timestamps
  received_at timestamptz DEFAULT now(),
  inspected_at timestamptz,
  stocked_at timestamptz
);

-- =============================================
-- 5. PERFORMANCE METRICS & KPIs
-- =============================================

CREATE TABLE IF NOT EXISTS warehouse_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  warehouse_request_id uuid REFERENCES warehouse_requests(id) ON DELETE CASCADE,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,

  -- Inventory metrics
  total_skus_stored integer DEFAULT 0,
  total_units_stored integer DEFAULT 0,
  total_value_stored decimal(10,2) DEFAULT 0,
  space_utilized_sqft decimal(10,2) DEFAULT 0,

  -- Velocity metrics
  units_received_today integer DEFAULT 0,
  units_shipped_today integer DEFAULT 0,
  inventory_turnover_ratio decimal(10,4),
  days_inventory_on_hand integer,

  -- Accuracy metrics
  receiving_accuracy_percentage decimal(5,2),
  order_accuracy_percentage decimal(5,2),
  damage_rate_percentage decimal(5,2),

  -- Timing metrics
  avg_receiving_time_hours decimal(10,2),
  avg_order_processing_time_hours decimal(10,2),
  on_time_shipment_percentage decimal(5,2),

  -- Cost tracking
  storage_cost decimal(10,2) DEFAULT 0,
  handling_cost decimal(10,2) DEFAULT 0,
  shipping_cost_to_warehouse decimal(10,2) DEFAULT 0,
  return_shipping_cost decimal(10,2) DEFAULT 0,

  -- Health score (1-100)
  overall_health_score integer CHECK (overall_health_score BETWEEN 1 AND 100),

  created_at timestamptz DEFAULT now(),

  UNIQUE(vendor_id, metric_date)
);

-- =============================================
-- 6. DOCUMENT MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS warehouse_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_request_id uuid REFERENCES warehouse_requests(id) ON DELETE CASCADE,
  inbound_shipment_id uuid REFERENCES warehouse_inbound_shipments(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Document details
  document_type text NOT NULL
    CHECK (document_type IN ('BOL', 'PACKING_SLIP', 'LABEL', 'INVOICE', 'ASN', 'RECEIVING_REPORT', 'RETURN_LABEL', 'OTHER')),
  document_name text NOT NULL,
  file_url text NOT NULL,
  file_size_bytes bigint,
  mime_type text,

  -- Metadata
  document_number text,
  reference_number text,
  is_signed boolean DEFAULT false,
  signed_at timestamptz,
  signer_name text,

  -- Status
  is_active boolean DEFAULT true,
  archived_at timestamptz,

  -- Version control
  version integer DEFAULT 1,
  supersedes_document_id uuid REFERENCES warehouse_documents(id),

  created_at timestamptz DEFAULT now(),
  created_by_user_id uuid
);

-- =============================================
-- 7. ENHANCE EXISTING TABLES
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_requests' AND column_name = 'auto_approve_eligible') THEN
    ALTER TABLE warehouse_requests ADD COLUMN auto_approve_eligible boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_requests' AND column_name = 'approval_score') THEN
    ALTER TABLE warehouse_requests ADD COLUMN approval_score integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_requests' AND column_name = 'assigned_warehouse_code') THEN
    ALTER TABLE warehouse_requests ADD COLUMN assigned_warehouse_code text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_requests' AND column_name = 'estimated_space_required_sqft') THEN
    ALTER TABLE warehouse_requests ADD COLUMN estimated_space_required_sqft decimal(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_requests' AND column_name = 'priority_level') THEN
    ALTER TABLE warehouse_requests ADD COLUMN priority_level text DEFAULT 'standard' CHECK (priority_level IN ('low', 'standard', 'high', 'urgent'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_requests' AND column_name = 'sla_deadline') THEN
    ALTER TABLE warehouse_requests ADD COLUMN sla_deadline timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_inventory' AND column_name = 'warehouse_location_id') THEN
    ALTER TABLE warehouse_inventory ADD COLUMN warehouse_location_id uuid REFERENCES warehouse_locations(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_inventory' AND column_name = 'last_movement_date') THEN
    ALTER TABLE warehouse_inventory ADD COLUMN last_movement_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_inventory' AND column_name = 'velocity_score') THEN
    ALTER TABLE warehouse_inventory ADD COLUMN velocity_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_inventory' AND column_name = 'reorder_point') THEN
    ALTER TABLE warehouse_inventory ADD COLUMN reorder_point integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_inventory' AND column_name = 'expiration_date') THEN
    ALTER TABLE warehouse_inventory ADD COLUMN expiration_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_inventory' AND column_name = 'batch_lot_number') THEN
    ALTER TABLE warehouse_inventory ADD COLUMN batch_lot_number text;
  END IF;
END $$;

-- =============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_inbound_shipments_vendor ON warehouse_inbound_shipments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inbound_shipments_request ON warehouse_inbound_shipments(warehouse_request_id);
CREATE INDEX IF NOT EXISTS idx_inbound_shipments_status ON warehouse_inbound_shipments(status);
CREATE INDEX IF NOT EXISTS idx_inbound_shipments_arrival ON warehouse_inbound_shipments(expected_arrival_date);
CREATE INDEX IF NOT EXISTS idx_inbound_shipments_asn ON warehouse_inbound_shipments(asn_number);
CREATE INDEX IF NOT EXISTS idx_inbound_shipments_tracking ON warehouse_inbound_shipments(tracking_number);

CREATE INDEX IF NOT EXISTS idx_receiving_log_shipment ON warehouse_receiving_log(inbound_shipment_id);
CREATE INDEX IF NOT EXISTS idx_receiving_log_request ON warehouse_receiving_log(warehouse_request_id);
CREATE INDEX IF NOT EXISTS idx_receiving_log_sku ON warehouse_receiving_log(sku);

CREATE INDEX IF NOT EXISTS idx_warehouse_locations_code ON warehouse_locations(location_code);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_zone ON warehouse_locations(zone_code);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_occupied ON warehouse_locations(is_occupied);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_vendor ON warehouse_locations(current_vendor_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_vendor ON warehouse_performance_metrics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON warehouse_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_request ON warehouse_performance_metrics(warehouse_request_id);

CREATE INDEX IF NOT EXISTS idx_warehouse_documents_vendor ON warehouse_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_documents_type ON warehouse_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_warehouse_documents_request ON warehouse_documents(warehouse_request_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_documents_shipment ON warehouse_documents(inbound_shipment_id);

-- =============================================
-- 9. ENABLE RLS
-- =============================================

ALTER TABLE warehouse_inbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_receiving_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_documents ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 10. RLS POLICIES - warehouse_inbound_shipments
-- =============================================

CREATE POLICY "Vendors view own inbound shipments"
  ON warehouse_inbound_shipments FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors create inbound shipments"
  ON warehouse_inbound_shipments FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors update own pending shipments"
  ON warehouse_inbound_shipments FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) AND status IN ('scheduled', 'in_transit'))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all inbound shipments"
  ON warehouse_inbound_shipments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- =============================================
-- 11. RLS POLICIES - warehouse_receiving_log
-- =============================================

CREATE POLICY "Vendors view own receiving logs"
  ON warehouse_receiving_log FOR SELECT
  TO authenticated
  USING (
    warehouse_request_id IN (
      SELECT id FROM warehouse_requests WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins manage all receiving logs"
  ON warehouse_receiving_log FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- =============================================
-- 12. RLS POLICIES - warehouse_capacity
-- =============================================

CREATE POLICY "Anyone can view warehouse capacity"
  ON warehouse_capacity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage warehouse capacity"
  ON warehouse_capacity FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- =============================================
-- 13. RLS POLICIES - warehouse_locations
-- =============================================

CREATE POLICY "Vendors view own warehouse locations"
  ON warehouse_locations FOR SELECT
  TO authenticated
  USING (
    current_vendor_id IS NULL OR
    current_vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins manage all warehouse locations"
  ON warehouse_locations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- =============================================
-- 14. RLS POLICIES - warehouse_performance_metrics
-- =============================================

CREATE POLICY "Vendors view own performance metrics"
  ON warehouse_performance_metrics FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins view all performance metrics"
  ON warehouse_performance_metrics FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins insert performance metrics"
  ON warehouse_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins update performance metrics"
  ON warehouse_performance_metrics FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- =============================================
-- 15. RLS POLICIES - warehouse_documents
-- =============================================

CREATE POLICY "Vendors view own warehouse documents"
  ON warehouse_documents FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors upload warehouse documents"
  ON warehouse_documents FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all warehouse documents"
  ON warehouse_documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- =============================================
-- 16. HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION generate_asn_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_asn text;
BEGIN
  new_asn := 'ASN-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  RETURN new_asn;
END;
$$;

CREATE OR REPLACE FUNCTION generate_qr_code_content(shipment_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'WAREHOUSE_INBOUND:' || shipment_id::text;
END;
$$;

-- =============================================
-- 17. ADD SAMPLE DATA
-- =============================================

INSERT INTO warehouse_capacity (
  warehouse_name,
  warehouse_code,
  total_square_feet,
  available_square_feet,
  total_pallet_positions,
  available_pallet_positions,
  utilization_percentage,
  ambient_storage_sqft,
  climate_controlled_sqft,
  hazmat_storage_sqft,
  is_active,
  last_audit_date
) VALUES
  ('Purple Soul Collective Main Warehouse', 'PSC-MAIN-01', 50000.00, 42000.00, 2500, 2100, 16.00, 35000.00, 10000.00, 5000.00, true, CURRENT_DATE),
  ('Purple Soul Collective West Coast', 'PSC-WEST-01', 35000.00, 30000.00, 1500, 1350, 14.29, 30000.00, 5000.00, 0.00, true, CURRENT_DATE)
ON CONFLICT (warehouse_code) DO NOTHING;

COMMENT ON TABLE warehouse_inbound_shipments IS 'Advanced Shipping Notice (ASN) system for tracking incoming vendor inventory';
COMMENT ON TABLE warehouse_receiving_log IS 'Real-time receiving updates with quality control';
COMMENT ON TABLE warehouse_capacity IS 'Warehouse space utilization and capacity planning';
COMMENT ON TABLE warehouse_locations IS 'Smart location management with bin-level tracking';
COMMENT ON TABLE warehouse_performance_metrics IS 'KPIs and performance analytics for vendors and warehouse ops';
COMMENT ON TABLE warehouse_documents IS 'Document management for BOL, labels, packing slips, etc';
