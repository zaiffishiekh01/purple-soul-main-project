/*
  # Fix All Missing Columns, Tables, and Policies

  ## Summary
  1. warehouse_requests - Add missing priority_level column
  2. support_tickets - Relax is_approved constraint so active vendors can create tickets
  3. ticket_messages - Create the missing table + RLS policies
  4. product_imports - Create missing table for bulk upload tracking

  ## Changes
  - Add `priority_level` column to warehouse_requests
  - Fix support_tickets INSERT policy to allow vendors with status='active'
  - Create ticket_messages table with full RLS
  - Create product_imports table with full RLS
*/

-- 1. Add priority_level column to warehouse_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'warehouse_requests' AND column_name = 'priority_level'
  ) THEN
    ALTER TABLE warehouse_requests ADD COLUMN priority_level text DEFAULT 'standard';
  END IF;
END $$;

-- 2. Fix support_tickets RLS
DROP POLICY IF EXISTS "Approved vendors can insert own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Approved vendors can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Approved vendors can update own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Active vendors can insert own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Active vendors can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Active vendors can update own tickets" ON support_tickets;

CREATE POLICY "Active vendors can insert own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors
      WHERE user_id = auth.uid()
      AND (is_approved = true OR status = 'active')
    )
  );

CREATE POLICY "Active vendors can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Active vendors can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- 3. Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'vendor',
  message text NOT NULL DEFAULT '',
  attachments text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view messages for own tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Vendors can insert messages for own tickets" ON ticket_messages;

CREATE POLICY "Vendors can view messages for own tickets"
  ON ticket_messages FOR SELECT
  TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendors can insert messages for own tickets"
  ON ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- 4. Create product_imports table
CREATE TABLE IF NOT EXISTS product_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  filename text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'processing',
  total_rows integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  errors text[] DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view own imports" ON product_imports;
DROP POLICY IF EXISTS "Vendors can create own imports" ON product_imports;
DROP POLICY IF EXISTS "Vendors can update own imports" ON product_imports;

CREATE POLICY "Vendors can view own imports"
  ON product_imports FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendors can create own imports"
  ON product_imports FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update own imports"
  ON product_imports FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );
