/*
  # Create Warehouse Pricing Plans System
  
  1. New Tables
    - `warehouse_storage_plans`
      - Defines available storage packages with pricing
      - Different tiers based on volume/space
    
  2. Pricing Structure (Industry Standard)
    - Storage fee per cubic foot per month
    - Receiving fee per pallet or per unit
    - Pick and pack fee per item
    - Outbound shipping handling fee
    
  3. Changes
    - Add `storage_plan_id` to warehouse_requests
    - Add `estimated_monthly_cost` to warehouse_requests
*/

CREATE TABLE IF NOT EXISTS warehouse_storage_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  plan_code text UNIQUE NOT NULL,
  description text,
  
  min_cubic_feet numeric,
  max_cubic_feet numeric,
  min_pallet_spaces integer,
  max_pallet_spaces integer,
  
  storage_fee_per_cubic_foot_monthly numeric NOT NULL DEFAULT 0.50,
  storage_fee_per_pallet_monthly numeric NOT NULL DEFAULT 15.00,
  
  receiving_fee_per_pallet numeric NOT NULL DEFAULT 25.00,
  receiving_fee_per_unit numeric NOT NULL DEFAULT 0.50,
  
  pick_pack_fee_per_item numeric NOT NULL DEFAULT 2.00,
  
  handling_fee_percentage numeric NOT NULL DEFAULT 3.00,
  
  minimum_monthly_fee numeric NOT NULL DEFAULT 0,
  
  includes_insurance boolean DEFAULT true,
  includes_inventory_management boolean DEFAULT true,
  includes_reporting boolean DEFAULT true,
  priority_processing boolean DEFAULT false,
  dedicated_account_manager boolean DEFAULT false,
  
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE warehouse_requests ADD COLUMN IF NOT EXISTS storage_plan_id uuid REFERENCES warehouse_storage_plans(id);
ALTER TABLE warehouse_requests ADD COLUMN IF NOT EXISTS estimated_monthly_storage_cost numeric;
ALTER TABLE warehouse_requests ADD COLUMN IF NOT EXISTS estimated_space_cubic_feet numeric;
ALTER TABLE warehouse_requests ADD COLUMN IF NOT EXISTS estimated_pallet_count integer;

CREATE INDEX IF NOT EXISTS idx_warehouse_requests_storage_plan ON warehouse_requests(storage_plan_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_storage_plans_active ON warehouse_storage_plans(is_active, display_order);

ALTER TABLE warehouse_storage_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active storage plans"
  ON warehouse_storage_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage storage plans"
  ON warehouse_storage_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
