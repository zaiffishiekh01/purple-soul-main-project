/*
  # Add Carrier Integration Test Data

  This migration populates the carrier_integrations table with realistic test data
  for admin management testing.

  ## Carriers Added
  1. DHL Express - Active, Full Features
  2. FedEx International - Active, Full Features
  3. UPS - Active, Full Features
  4. USPS - Active, Full Features
  5. Canada Post - Inactive (for testing activation)
  6. Australia Post - Active, Limited Features (no labels)

  ## Admin Actions to Test
  - View all carriers in Carrier Services tab
  - Add new carrier
  - Edit existing carrier
  - Activate/Deactivate carriers
  - Delete carriers
  - Search and filter carriers
*/

-- Clear existing carrier data
DELETE FROM carrier_integrations;

-- Insert comprehensive carrier test data
INSERT INTO carrier_integrations (
  carrier_name,
  carrier_code,
  api_endpoint,
  is_active,
  supports_rates,
  supports_labels,
  supports_tracking,
  configuration,
  created_at,
  updated_at
) VALUES
-- Active carriers with full features
(
  'DHL Express',
  'dhl',
  'https://api.dhl.com/v1',
  true,
  true,
  true,
  true,
  '{
    "api_key": "demo_dhl_key",
    "account_number": "DHL-123456",
    "service_levels": ["express_worldwide", "express_12:00", "express_9:00"],
    "max_weight_kg": 70,
    "tracking_url": "https://www.dhl.com/express/tracking.html"
  }'::jsonb,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '30 days'
),

(
  'FedEx International',
  'fedex',
  'https://apis.fedex.com/ship/v1',
  true,
  true,
  true,
  true,
  '{
    "api_key": "demo_fedex_key",
    "account_number": "FEDEX-789012",
    "service_levels": ["priority_overnight", "standard_overnight", "international_priority"],
    "max_weight_kg": 68,
    "tracking_url": "https://www.fedex.com/fedextrack/"
  }'::jsonb,
  NOW() - INTERVAL '85 days',
  NOW() - INTERVAL '25 days'
),

(
  'UPS',
  'ups',
  'https://onlinetools.ups.com/api',
  true,
  true,
  true,
  true,
  '{
    "api_key": "demo_ups_key",
    "account_number": "UPS-345678",
    "service_levels": ["next_day_air", "2nd_day_air", "ground", "worldwide_express"],
    "max_weight_kg": 70,
    "tracking_url": "https://www.ups.com/track"
  }'::jsonb,
  NOW() - INTERVAL '80 days',
  NOW() - INTERVAL '20 days'
),

(
  'USPS',
  'usps',
  'https://secure.shippingapis.com/ShippingAPI.dll',
  true,
  true,
  true,
  true,
  '{
    "api_key": "demo_usps_key",
    "account_number": "USPS-901234",
    "service_levels": ["priority_mail", "priority_mail_express", "first_class", "parcel_select"],
    "max_weight_kg": 31.75,
    "tracking_url": "https://tools.usps.com/go/TrackConfirmAction"
  }'::jsonb,
  NOW() - INTERVAL '75 days',
  NOW() - INTERVAL '15 days'
),

-- Inactive carrier (for testing activation)
(
  'Canada Post',
  'canada_post',
  'https://api.canadapost.ca/rs/ship',
  false,
  true,
  true,
  true,
  '{
    "api_key": "demo_canadapost_key",
    "account_number": "CP-567890",
    "service_levels": ["xpresspost", "expedited_parcel", "regular_parcel"],
    "max_weight_kg": 30,
    "tracking_url": "https://www.canadapost.ca/track"
  }'::jsonb,
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '60 days'
),

-- Active carrier with limited features (no label generation)
(
  'Australia Post',
  'australia_post',
  'https://digitalapi.auspost.com.au',
  true,
  true,
  false,
  true,
  '{
    "api_key": "demo_auspost_key",
    "account_number": "AP-123789",
    "service_levels": ["express_post", "parcel_post", "international_standard"],
    "max_weight_kg": 22,
    "tracking_url": "https://auspost.com.au/track"
  }'::jsonb,
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '10 days'
),

-- Recently added carrier
(
  'Royal Mail',
  'royal_mail',
  'https://api.royalmail.net/v1',
  true,
  true,
  true,
  true,
  '{
    "api_key": "demo_royalmail_key",
    "account_number": "RM-456123",
    "service_levels": ["tracked_24", "tracked_48", "special_delivery"],
    "max_weight_kg": 20,
    "tracking_url": "https://www.royalmail.com/track"
  }'::jsonb,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '2 days'
),

-- Carrier with only tracking (no rates or labels)
(
  'Aramex',
  'aramex',
  'https://ws.aramex.net',
  true,
  false,
  false,
  true,
  '{
    "api_key": "demo_aramex_key",
    "account_number": "ARMX-789456",
    "service_levels": ["express_document", "express_parcel"],
    "max_weight_kg": 50,
    "tracking_url": "https://www.aramex.com/track"
  }'::jsonb,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '5 days'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carrier_integrations_active
  ON carrier_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_carrier_integrations_code
  ON carrier_integrations(carrier_code);

-- Add helpful comments
COMMENT ON TABLE carrier_integrations IS 'Shipping carrier integrations available to vendors';
COMMENT ON COLUMN carrier_integrations.is_active IS 'Whether carrier is available for vendor use';
COMMENT ON COLUMN carrier_integrations.supports_rates IS 'Can fetch live shipping rates';
COMMENT ON COLUMN carrier_integrations.supports_labels IS 'Can generate shipping labels';
COMMENT ON COLUMN carrier_integrations.supports_tracking IS 'Provides tracking information';
COMMENT ON COLUMN carrier_integrations.configuration IS 'Carrier-specific settings (API keys, service levels, etc.)';
