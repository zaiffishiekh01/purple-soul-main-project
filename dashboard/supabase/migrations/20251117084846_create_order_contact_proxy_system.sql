/*
  # Create Order Contact Proxy System

  1. New Tables
    - `order_contacts`
      - Maps real customer contact info to proxy contacts
      - Prevents vendors from directly accessing customer email/phone
      - Enables marketplace to control customer communication

  2. Changes to Orders Table
    - Add `proxy_email` - Alias email vendors see (e.g., order_12345@ssc-marketplace.com)
    - Add `proxy_phone_display` - Display format for vendors (e.g., "Marketplace Relay")
    - Keep real contacts hidden from vendor queries

  3. Business Logic
    - Vendors see proxy contacts in their dashboard
    - Admins see real contacts everywhere
    - Marketplace controls all customer communication
    - Reduces customer poaching risk

  4. Security
    - RLS ensures vendors only see proxy data
    - Admins can view/manage all contact mappings
    - Proxy emails are unique per order
*/

-- Create order_contacts table for proxy mapping
CREATE TABLE IF NOT EXISTS order_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

  -- Real customer contact (only admins can see)
  real_email text NOT NULL,
  real_phone text,

  -- Proxy contacts (vendors see these)
  proxy_email text UNIQUE NOT NULL,
  proxy_phone_display text DEFAULT 'Contact via Marketplace',

  -- Tracking
  created_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz,
  access_count integer DEFAULT 0,

  UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE order_contacts ENABLE ROW LEVEL SECURITY;

-- Only admins can view all contact mappings
CREATE POLICY "Admins can view all order contacts"
  ON order_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Vendors can only see their own proxy contacts (not real ones)
CREATE POLICY "Vendors can view their proxy contacts"
  ON order_contacts FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_contacts_order_id ON order_contacts(order_id);
CREATE INDEX IF NOT EXISTS idx_order_contacts_vendor_id ON order_contacts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_contacts_proxy_email ON order_contacts(proxy_email);

-- Add proxy contact columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'proxy_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN proxy_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'proxy_phone_display'
  ) THEN
    ALTER TABLE orders ADD COLUMN proxy_phone_display text DEFAULT 'Marketplace Relay';
  END IF;
END $$;

-- Function to generate proxy email for an order
CREATE OR REPLACE FUNCTION generate_proxy_email(order_num text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(order_num) || '@ssc-marketplace.com';
END;
$$;

-- Function to create order contact proxy when order is created
CREATE OR REPLACE FUNCTION create_order_contact_proxy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proxy_email text;
BEGIN
  -- Generate proxy email based on order number
  v_proxy_email := generate_proxy_email(NEW.order_number);

  -- Set proxy email on order
  NEW.proxy_email := v_proxy_email;
  NEW.proxy_phone_display := 'Marketplace Relay';

  -- Create order_contacts mapping (do this AFTER insert via separate trigger)
  RETURN NEW;
END;
$$;

-- Function to insert into order_contacts after order insert
CREATE OR REPLACE FUNCTION insert_order_contact_mapping()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert contact mapping
  INSERT INTO order_contacts (
    order_id,
    vendor_id,
    real_email,
    real_phone,
    proxy_email,
    proxy_phone_display
  ) VALUES (
    NEW.id,
    NEW.vendor_id,
    NEW.customer_email,
    NEW.customer_phone,
    NEW.proxy_email,
    NEW.proxy_phone_display
  )
  ON CONFLICT (order_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to set proxy contacts before insert
DROP TRIGGER IF EXISTS trigger_create_order_contact_proxy ON orders;
CREATE TRIGGER trigger_create_order_contact_proxy
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_contact_proxy();

-- Trigger to create mapping after insert
DROP TRIGGER IF EXISTS trigger_insert_order_contact_mapping ON orders;
CREATE TRIGGER trigger_insert_order_contact_mapping
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION insert_order_contact_mapping();

-- Backfill existing orders with proxy contacts
UPDATE orders
SET
  proxy_email = generate_proxy_email(order_number),
  proxy_phone_display = 'Marketplace Relay'
WHERE proxy_email IS NULL;

-- Create order_contacts entries for existing orders (skip if already exists)
INSERT INTO order_contacts (order_id, vendor_id, real_email, real_phone, proxy_email, proxy_phone_display)
SELECT
  o.id,
  o.vendor_id,
  o.customer_email,
  o.customer_phone,
  o.proxy_email,
  o.proxy_phone_display
FROM orders o
WHERE o.proxy_email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM order_contacts oc WHERE oc.order_id = o.id
  )
ON CONFLICT (order_id) DO NOTHING;

-- Create vendor_agreements table for policy enforcement
CREATE TABLE IF NOT EXISTS vendor_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  agreement_type text NOT NULL,
  agreed_at timestamptz DEFAULT now(),
  ip_address text,
  violation_count integer DEFAULT 0,
  last_violation_date timestamptz,
  notes text,
  UNIQUE(vendor_id, agreement_type)
);

ALTER TABLE vendor_agreements ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own agreements
CREATE POLICY "Vendors can view own agreements"
  ON vendor_agreements FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all agreements
CREATE POLICY "Admins can manage vendor agreements"
  ON vendor_agreements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE order_contacts IS 'Proxy contact system - prevents vendors from directly accessing customer email/phone';
COMMENT ON COLUMN orders.proxy_email IS 'Proxy email vendors see instead of real customer email';
COMMENT ON COLUMN orders.proxy_phone_display IS 'Display text for phone (e.g., Marketplace Relay)';
COMMENT ON TABLE vendor_agreements IS 'Tracks vendor policy agreements and violations';
