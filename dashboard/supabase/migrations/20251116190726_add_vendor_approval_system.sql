/*
  # Add Vendor Approval System

  1. Changes
    - Add `is_approved` column to vendors table (default: false)
    - Add `approved_at` column to track approval timestamp
    - Add `approved_by` column to track which admin approved
    - Update RLS policies to only allow approved vendors to access dashboard

  2. Security
    - Vendors can only access dashboard data if approved
    - Admins can view and approve pending vendors
*/

-- Add approval columns to vendors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE vendors ADD COLUMN is_approved boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE vendors ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE vendors ADD COLUMN approved_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index for faster approval queries
CREATE INDEX IF NOT EXISTS idx_vendors_is_approved ON vendors(is_approved);
CREATE INDEX IF NOT EXISTS idx_vendors_approved_at ON vendors(approved_at);

-- Drop existing RLS policies for products, inventory, orders, etc. and recreate with approval check
DROP POLICY IF EXISTS "Vendors can view own products" ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;

CREATE POLICY "Approved vendors can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update orders policies
DROP POLICY IF EXISTS "Vendors can view own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can update own orders" ON orders;

CREATE POLICY "Approved vendors can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update inventory policies
DROP POLICY IF EXISTS "Vendors can view own inventory" ON inventory;
DROP POLICY IF EXISTS "Vendors can insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Vendors can update own inventory" ON inventory;

CREATE POLICY "Approved vendors can view own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can insert own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update shipments policies
DROP POLICY IF EXISTS "Vendors can view own shipments" ON shipments;
DROP POLICY IF EXISTS "Vendors can insert own shipments" ON shipments;
DROP POLICY IF EXISTS "Vendors can update own shipments" ON shipments;

CREATE POLICY "Approved vendors can view own shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can insert own shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update returns policies
DROP POLICY IF EXISTS "Vendors can view own returns" ON returns;
DROP POLICY IF EXISTS "Vendors can update own returns" ON returns;

CREATE POLICY "Approved vendors can view own returns"
  ON returns FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own returns"
  ON returns FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update transactions policies
DROP POLICY IF EXISTS "Vendors can view own transactions" ON transactions;

CREATE POLICY "Approved vendors can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update notifications policies
DROP POLICY IF EXISTS "Vendors can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Vendors can update own notifications" ON notifications;

CREATE POLICY "Approved vendors can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update shipping_labels policies
DROP POLICY IF EXISTS "Vendors can view own shipping labels" ON shipping_labels;
DROP POLICY IF EXISTS "Vendors can insert own shipping labels" ON shipping_labels;
DROP POLICY IF EXISTS "Vendors can update own shipping labels" ON shipping_labels;

CREATE POLICY "Approved vendors can view own shipping labels"
  ON shipping_labels FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can insert own shipping labels"
  ON shipping_labels FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own shipping labels"
  ON shipping_labels FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update support_tickets policies
DROP POLICY IF EXISTS "Vendors can view own support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Vendors can insert own support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Vendors can update own support tickets" ON support_tickets;

CREATE POLICY "Approved vendors can view own support tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can insert own support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own support tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Update payout_settings policies
DROP POLICY IF EXISTS "Vendors can view own payout settings" ON payout_settings;
DROP POLICY IF EXISTS "Vendors can insert own payout settings" ON payout_settings;
DROP POLICY IF EXISTS "Vendors can update own payout settings" ON payout_settings;

CREATE POLICY "Approved vendors can view own payout settings"
  ON payout_settings FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can insert own payout settings"
  ON payout_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

CREATE POLICY "Approved vendors can update own payout settings"
  ON payout_settings FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = auth.uid() 
      AND is_approved = true
    )
  );

-- Admins can approve vendors
CREATE POLICY "Admins can update vendor approval"
  ON vendors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Admins can view all vendors
CREATE POLICY "Admins can view all vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
