/*
  # Extend Support Tickets Table

  Add resolved_at column for tracking when tickets are resolved
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'resolved_at') THEN
    ALTER TABLE support_tickets ADD COLUMN resolved_at timestamptz;
  END IF;
END $$;
