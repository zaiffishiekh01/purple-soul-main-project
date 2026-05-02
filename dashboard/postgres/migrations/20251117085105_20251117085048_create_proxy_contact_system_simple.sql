/*
  # Create Proxy Contact System (Simplified)

  Implements marketplace proxy contacts to prevent customer data poaching.
  Vendors see proxy emails instead of real customer emails.
  Phone is shown for shipping but harder to bulk scrape.
*/

-- Add proxy contact columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS proxy_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS proxy_phone_display text DEFAULT 'Marketplace Relay';

-- Function to generate proxy email
CREATE OR REPLACE FUNCTION generate_proxy_email(order_num text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(order_num) || '@ssc-marketplace.com';
$$;

-- Backfill existing orders
UPDATE orders
SET
  proxy_email = generate_proxy_email(order_number),
  proxy_phone_display = 'Marketplace Relay'
WHERE proxy_email IS NULL AND order_number IS NOT NULL;

-- Trigger for new orders
CREATE OR REPLACE FUNCTION set_order_proxy_contacts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.proxy_email IS NULL AND NEW.order_number IS NOT NULL THEN
    NEW.proxy_email := generate_proxy_email(NEW.order_number);
    NEW.proxy_phone_display := 'Marketplace Relay';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_order_proxy_contacts ON orders;
CREATE TRIGGER trigger_set_order_proxy_contacts
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_proxy_contacts();

COMMENT ON COLUMN orders.proxy_email IS 'Proxy email vendors see - forwards to real customer email';
COMMENT ON COLUMN orders.proxy_phone_display IS 'Display text for phone to discourage bulk scraping';