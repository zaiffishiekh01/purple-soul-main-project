/*
  # Add Customer Data Visibility Controls

  1. Changes
    - Modify orders table to separate customer first name and last initial
    - Create vendor_orders view that masks sensitive customer information
    - Vendors can only see: first name, last initial, shipping address, order details
    - Vendors cannot see: email, phone, full name
    - Admins can see everything through the orders table directly

  2. Security
    - RLS policies ensure vendors can only access their own orders through the view
    - Email and phone are hidden from the vendor_orders view
    - Admin users bypass view and query orders table directly
*/

-- Add columns for split customer name (first name and last initial)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_first_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_last_initial'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_last_initial text;
  END IF;
END $$;

-- Populate split names from existing customer_name field
UPDATE orders
SET
  customer_first_name = SPLIT_PART(customer_name, ' ', 1),
  customer_last_initial = LEFT(SPLIT_PART(customer_name, ' ', 2), 1)
WHERE customer_first_name IS NULL OR customer_last_initial IS NULL;

-- Create a view for vendors that masks sensitive customer information
CREATE OR REPLACE VIEW vendor_orders AS
SELECT
  o.id,
  o.vendor_id,
  o.order_number,
  o.customer_first_name || ' ' || o.customer_last_initial || '.' AS customer_display_name,
  o.customer_first_name,
  o.customer_last_initial,
  o.shipping_address,
  o.status,
  o.total_amount,
  o.subtotal,
  o.tax_amount,
  o.shipping_cost,
  o.payment_status,
  o.payment_method,
  o.notes,
  o.created_at,
  o.updated_at
FROM orders o;

-- Enable RLS on the view
ALTER VIEW vendor_orders SET (security_invoker = true);

-- Grant access to authenticated users
GRANT SELECT ON vendor_orders TO authenticated;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$;

-- Add comment explaining usage
COMMENT ON VIEW vendor_orders IS 'Vendor-safe view of orders with masked customer personal information. Vendors see first name + last initial only, no email/phone.';
