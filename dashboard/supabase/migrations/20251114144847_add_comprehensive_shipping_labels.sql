/*
  # Add Comprehensive Shipping Labels Table

  1. New Tables
    - `shipping_labels`
      - Order & Product Information (order_id, product details, weight, dimensions, category)
      - Vendor/Shipper Information (pickup details, address, contact)
      - Customer/Receiver Information (shipping address, contact)
      - Shipping Information (courier partner, method, tracking preference, pickup slot)
      - Packaging Details (weight, dimensions, package type, box count)
      - Customs Information (HSN/HTS code, origin, value, invoice)
      - Label Metadata (AWB, tracking, barcode, routing code)
      - Status tracking and timestamps

  2. Security
    - Enable RLS on `shipping_labels` table
    - Add policies for vendors to manage their own labels
*/

CREATE TABLE IF NOT EXISTS shipping_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  order_id uuid REFERENCES orders(id) NOT NULL,
  
  -- Order & Product Information
  order_date timestamptz DEFAULT now(),
  product_names text DEFAULT '',
  sku text DEFAULT '',
  quantity integer DEFAULT 1,
  product_weight numeric(10,2) DEFAULT 0,
  product_length numeric(10,2) DEFAULT 0,
  product_width numeric(10,2) DEFAULT 0,
  product_height numeric(10,2) DEFAULT 0,
  product_category text DEFAULT '',
  
  -- Vendor (Shipper) Information
  vendor_name text DEFAULT '',
  pickup_name text DEFAULT '',
  pickup_address text DEFAULT '',
  pickup_phone text DEFAULT '',
  pickup_email text DEFAULT '',
  pickup_city text DEFAULT '',
  pickup_state text DEFAULT '',
  pickup_pincode text DEFAULT '',
  pickup_country text DEFAULT '',
  
  -- Customer (Receiver) Information
  customer_name text DEFAULT '',
  shipping_address text DEFAULT '',
  shipping_landmark text DEFAULT '',
  shipping_city text DEFAULT '',
  shipping_state text DEFAULT '',
  shipping_pincode text DEFAULT '',
  shipping_country text DEFAULT '',
  customer_phone text DEFAULT '',
  customer_email text DEFAULT '',
  
  -- Shipping Information
  courier_partner text DEFAULT '',
  shipping_method text DEFAULT 'standard',
  tracking_preference text DEFAULT 'auto_generated',
  pickup_date date,
  pickup_slot text DEFAULT '',
  
  -- Packaging Details
  package_weight numeric(10,2) DEFAULT 0,
  package_length numeric(10,2) DEFAULT 0,
  package_width numeric(10,2) DEFAULT 0,
  package_height numeric(10,2) DEFAULT 0,
  number_of_packages integer DEFAULT 1,
  package_type text DEFAULT 'box',
  
  -- Customs Information (International)
  hsn_code text DEFAULT '',
  hts_code text DEFAULT '',
  country_of_origin text DEFAULT '',
  item_description text DEFAULT '',
  customs_value numeric(10,2) DEFAULT 0,
  customs_category text DEFAULT 'commercial',
  invoice_number text DEFAULT '',
  export_reason text DEFAULT '',
  
  -- Label Metadata (System-Generated)
  awb_number text DEFAULT '',
  tracking_number text DEFAULT '',
  barcode text DEFAULT '',
  qr_code text DEFAULT '',
  routing_code text DEFAULT '',
  order_barcode text DEFAULT '',
  
  -- Status
  status text DEFAULT 'draft',
  label_url text DEFAULT '',
  printed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own labels"
  ON shipping_labels FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own labels"
  ON shipping_labels FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own labels"
  ON shipping_labels FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own labels"
  ON shipping_labels FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_shipping_labels_vendor_id ON shipping_labels(vendor_id);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_order_id ON shipping_labels(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_status ON shipping_labels(status);
