/*
  # Create Customers Table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Customer email address
      - `first_name` (text) - First name
      - `last_name` (text) - Last name
      - `phone` (text) - Phone number
      - `shipping_address` (jsonb) - Default shipping address
      - `billing_address` (jsonb) - Default billing address
      - `total_orders` (integer) - Total number of orders placed
      - `total_spent` (numeric) - Total amount spent
      - `last_order_date` (timestamptz) - Date of last order
      - `created_at` (timestamptz) - Account creation date
      - `updated_at` (timestamptz) - Last update

  2. Security
    - Enable RLS on customers table
    - Only admins can view all customers
    - Customers cannot access this table directly (e-commerce frontend uses different auth)

  3. Purpose
    - Track all buyers from the e-commerce platform
    - Link to orders for customer history
    - Admin can view customer analytics and order patterns
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text DEFAULT '',
  shipping_address jsonb DEFAULT '{}',
  billing_address jsonb DEFAULT '{}',
  total_orders integer DEFAULT 0,
  total_spent numeric(10,2) DEFAULT 0,
  last_order_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Only admins can view all customers
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can manage customers
CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent DESC);

-- Create function to update customer stats when orders are placed
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update or create customer record
  INSERT INTO customers (email, first_name, last_name, phone, shipping_address, total_orders, total_spent, last_order_date)
  VALUES (
    NEW.customer_email,
    NEW.customer_first_name,
    COALESCE(NEW.customer_last_initial || '.', ''),
    COALESCE(NEW.customer_phone, ''),
    NEW.shipping_address,
    1,
    NEW.total_amount,
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE SET
    total_orders = customers.total_orders + 1,
    total_spent = customers.total_spent + NEW.total_amount,
    last_order_date = NEW.created_at,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Create trigger to auto-update customer stats
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON orders;
CREATE TRIGGER trigger_update_customer_stats
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- Insert dummy customer data based on existing orders
INSERT INTO customers (email, first_name, last_name, phone, shipping_address, total_orders, total_spent, last_order_date, created_at)
SELECT
  customer_email,
  customer_first_name,
  COALESCE(customer_last_initial || '.', 'User'),
  COALESCE(customer_phone, ''),
  shipping_address,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_spent,
  MAX(created_at) as last_order_date,
  MIN(created_at) as created_at
FROM orders
WHERE customer_email IS NOT NULL
GROUP BY customer_email, customer_first_name, customer_last_initial, customer_phone, shipping_address
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE customers IS 'E-commerce customers/buyers who purchase from the marketplace';