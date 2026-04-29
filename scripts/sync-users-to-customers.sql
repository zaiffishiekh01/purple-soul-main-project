-- =====================================================
-- SYNC USERS TO CUSTOMERS TABLE
-- =====================================================
-- This ensures users who signup on main app appear 
-- in the dashboard's customers page
-- =====================================================

-- Create customers table if not exists
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers are viewable by admins" ON customers;
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;

-- RLS Policies
CREATE POLICY "Customers are viewable by admins" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = customers.user_id AND users.id = auth.uid())
  );

CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-create customer record when user signs up
-- =====================================================
CREATE OR REPLACE FUNCTION create_customer_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create customer for users with role 'customer'
  IF NEW.role = 'customer' THEN
    INSERT INTO customers (user_id, email, first_name, last_name, phone, status, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(SPLIT_PART(NEW.full_name, ' ', 1), ''),
      COALESCE(SUBSTRING(NEW.full_name FROM POSITION(' ' IN NEW.full_name) + 1), ''),
      NEW.phone,
      'active',
      NEW.created_at
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(SPLIT_PART(EXCLUDED.full_name, ' ', 1), customers.first_name),
      last_name = COALESCE(SUBSTRING(EXCLUDED.full_name FROM POSITION(' ' IN EXCLUDED.full_name) + 1), customers.last_name),
      phone = COALESCE(EXCLUDED.phone, customers.phone),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_customer_from_user();

-- =====================================================
-- Backfill: Create customers for existing users
-- =====================================================
INSERT INTO customers (user_id, email, first_name, last_name, phone, status, created_at)
SELECT 
  id,
  email,
  COALESCE(SPLIT_PART(full_name, ' ', 1), ''),
  COALESCE(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1), ''),
  phone,
  'active',
  created_at
FROM users
WHERE role = 'customer'
AND id NOT IN (SELECT user_id FROM customers WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Update trigger for updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Migration tracking
-- =====================================================
INSERT INTO _migrations (migration_id, name) VALUES
  ('20260412_sync_users_to_customers', 'Sync Users to Customers Table with Trigger')
ON CONFLICT (migration_id) DO NOTHING;
