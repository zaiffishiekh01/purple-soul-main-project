/*
  # Optimize RLS Policies - Part 4

  1. Tables Optimized
    - product_imports
    - support_tickets
    - ticket_messages
    - support_messages
    - payout_settings
*/

-- Drop and recreate product_imports policies
DROP POLICY IF EXISTS "Vendors can view own import history" ON product_imports;
DROP POLICY IF EXISTS "Vendors can insert own imports" ON product_imports;

CREATE POLICY "Vendors can view own import history"
  ON product_imports FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

CREATE POLICY "Vendors can insert own imports"
  ON product_imports FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = (select auth.uid())));

-- Drop and recreate support_tickets policies
DROP POLICY IF EXISTS "Vendors can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Vendors can insert own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Vendors can update own tickets" ON support_tickets;

CREATE POLICY "Vendors can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can insert own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

-- Drop and recreate ticket_messages policies
DROP POLICY IF EXISTS "Vendors can view messages for own tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Vendors can insert messages for own tickets" ON ticket_messages;

CREATE POLICY "Vendors can view messages for own tickets"
  ON ticket_messages FOR SELECT
  TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Vendors can insert messages for own tickets"
  ON ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = (select auth.uid())
      )
    )
  );

-- Drop and recreate support_messages policies if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_messages') THEN
    DROP POLICY IF EXISTS "Vendors can view own ticket messages" ON support_messages;
    DROP POLICY IF EXISTS "Vendors can insert own ticket messages" ON support_messages;

    CREATE POLICY "Vendors can view own ticket messages"
      ON support_messages FOR SELECT
      TO authenticated
      USING (
        ticket_id IN (
          SELECT id FROM support_tickets
          WHERE vendor_id IN (
            SELECT id FROM vendors WHERE user_id = (select auth.uid())
          )
        )
      );

    CREATE POLICY "Vendors can insert own ticket messages"
      ON support_messages FOR INSERT
      TO authenticated
      WITH CHECK (
        ticket_id IN (
          SELECT id FROM support_tickets
          WHERE vendor_id IN (
            SELECT id FROM vendors WHERE user_id = (select auth.uid())
          )
        )
      );
  END IF;
END $$;

-- Drop and recreate payout_settings policies
DROP POLICY IF EXISTS "Vendors can view own payout settings" ON payout_settings;
DROP POLICY IF EXISTS "Vendors can insert own payout settings" ON payout_settings;
DROP POLICY IF EXISTS "Vendors can update own payout settings" ON payout_settings;

CREATE POLICY "Vendors can view own payout settings"
  ON payout_settings FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can insert own payout settings"
  ON payout_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can update own payout settings"
  ON payout_settings FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = (select auth.uid())
    )
  );
