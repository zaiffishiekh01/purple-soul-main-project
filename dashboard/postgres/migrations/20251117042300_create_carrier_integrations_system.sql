/*
  # Carrier Integration System

  1. New Tables
    - `carrier_integrations`
      - `id` (uuid, primary key)
      - `carrier_name` (text) - DHL Express, FedEx International, UPS, USPS
      - `carrier_code` (text) - dhl, fedex, ups, usps
      - `api_endpoint` (text) - Base API URL
      - `is_active` (boolean) - Whether carrier is enabled
      - `supports_rates` (boolean) - Can calculate rates
      - `supports_labels` (boolean) - Can generate labels
      - `supports_tracking` (boolean) - Can track shipments
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `carrier_credentials`
      - `id` (uuid, primary key)
      - `carrier_code` (text) - References carrier
      - `credential_type` (text) - api_key, account_number, etc.
      - `credential_value` (text) - Encrypted credential value
      - `environment` (text) - production or sandbox
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shipping_rates`
      - `id` (uuid, primary key)
      - `carrier_code` (text)
      - `service_type` (text) - Standard, Express, etc.
      - `origin_country` (text)
      - `origin_postal_code` (text)
      - `destination_country` (text)
      - `destination_postal_code` (text)
      - `weight_kg` (numeric)
      - `rate_amount` (numeric)
      - `currency` (text)
      - `estimated_days` (integer)
      - `quoted_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admin-only access for carrier configuration
    - Vendors can view rates but not credentials

  3. Initial Data
    - Insert carrier integration records for DHL, FedEx, UPS, USPS
*/

-- Create carrier_integrations table
CREATE TABLE IF NOT EXISTS carrier_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_name text NOT NULL,
  carrier_code text NOT NULL UNIQUE,
  api_endpoint text NOT NULL,
  is_active boolean DEFAULT true,
  supports_rates boolean DEFAULT true,
  supports_labels boolean DEFAULT true,
  supports_tracking boolean DEFAULT true,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create carrier_credentials table (encrypted storage)
CREATE TABLE IF NOT EXISTS carrier_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_code text NOT NULL REFERENCES carrier_integrations(carrier_code) ON DELETE CASCADE,
  credential_type text NOT NULL,
  credential_value text NOT NULL,
  environment text DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shipping_rates table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_code text NOT NULL,
  service_type text NOT NULL,
  origin_country text NOT NULL,
  origin_postal_code text,
  destination_country text NOT NULL,
  destination_postal_code text,
  weight_kg numeric NOT NULL,
  dimensions_cm jsonb,
  rate_amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  estimated_days integer,
  service_level text,
  quoted_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carrier_integrations_code ON carrier_integrations(carrier_code);
CREATE INDEX IF NOT EXISTS idx_carrier_integrations_active ON carrier_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_carrier_credentials_carrier ON carrier_credentials(carrier_code);
CREATE INDEX IF NOT EXISTS idx_carrier_credentials_env ON carrier_credentials(environment);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_carrier ON shipping_rates(carrier_code);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_route ON shipping_rates(origin_country, destination_country);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_expires ON shipping_rates(expires_at);

-- Enable RLS
ALTER TABLE carrier_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carrier_integrations
CREATE POLICY "Anyone can view active carrier integrations"
  ON carrier_integrations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage carrier integrations"
  ON carrier_integrations FOR ALL
  USING (is_admin());

-- RLS Policies for carrier_credentials (admin only)
CREATE POLICY "Only admins can view carrier credentials"
  ON carrier_credentials FOR SELECT
  USING (is_admin());

CREATE POLICY "Only admins can manage carrier credentials"
  ON carrier_credentials FOR ALL
  USING (is_admin());

-- RLS Policies for shipping_rates
CREATE POLICY "Authenticated users can view shipping rates"
  ON shipping_rates FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "System can insert shipping rates"
  ON shipping_rates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all shipping rates"
  ON shipping_rates FOR ALL
  USING (is_admin());

-- Insert initial carrier integrations
INSERT INTO carrier_integrations (carrier_name, carrier_code, api_endpoint, configuration) VALUES
  ('DHL Express', 'dhl', 'https://api.dhl.com', '{"version": "v2", "service_codes": {"express": "P", "economy": "Y"}}'::jsonb),
  ('FedEx International', 'fedex', 'https://apis.fedex.com', '{"version": "v1", "service_codes": {"priority": "INTERNATIONAL_PRIORITY", "economy": "INTERNATIONAL_ECONOMY"}}'::jsonb),
  ('UPS', 'ups', 'https://onlinetools.ups.com', '{"version": "v1", "service_codes": {"express": "07", "worldwide": "08", "standard": "11"}}'::jsonb),
  ('USPS', 'usps', 'https://secure.shippingapis.com', '{"version": "v1", "service_codes": {"priority": "Priority Mail International", "express": "Priority Mail Express International"}}'::jsonb)
ON CONFLICT (carrier_code) DO NOTHING;

-- Create function to cleanup expired rates
CREATE OR REPLACE FUNCTION cleanup_expired_rates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM shipping_rates
  WHERE expires_at < now() - interval '7 days';
END;
$$;

-- Create update trigger for carrier_integrations
CREATE OR REPLACE FUNCTION update_carrier_integrations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_carrier_integrations_timestamp
  BEFORE UPDATE ON carrier_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_carrier_integrations_timestamp();

CREATE TRIGGER update_carrier_credentials_timestamp
  BEFORE UPDATE ON carrier_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_carrier_integrations_timestamp();
