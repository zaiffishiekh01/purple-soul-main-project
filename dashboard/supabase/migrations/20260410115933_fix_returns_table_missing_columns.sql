/*
  # Fix returns table - add missing columns
  
  AdminReturns component expects: customer_name, customer_email, approved_at, items
  These are missing from the returns table schema.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'customer_name') THEN
    ALTER TABLE returns ADD COLUMN customer_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'customer_email') THEN
    ALTER TABLE returns ADD COLUMN customer_email text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'approved_at') THEN
    ALTER TABLE returns ADD COLUMN approved_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'items') THEN
    ALTER TABLE returns ADD COLUMN items jsonb DEFAULT '[]';
  END IF;
END $$;
