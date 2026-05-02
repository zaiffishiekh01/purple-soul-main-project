/*
  # Extend Returns Table

  Add missing columns for comprehensive return management
*/

DO $$
BEGIN
  -- Add customer columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'customer_name') THEN
    ALTER TABLE returns ADD COLUMN customer_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'customer_email') THEN
    ALTER TABLE returns ADD COLUMN customer_email text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'customer_phone') THEN
    ALTER TABLE returns ADD COLUMN customer_phone text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'order_number') THEN
    ALTER TABLE returns ADD COLUMN order_number text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'items') THEN
    ALTER TABLE returns ADD COLUMN items jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'approved_at') THEN
    ALTER TABLE returns ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'received_at') THEN
    ALTER TABLE returns ADD COLUMN received_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'refunded_at') THEN
    ALTER TABLE returns ADD COLUMN refunded_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'returns' AND column_name = 'rejection_reason') THEN
    ALTER TABLE returns ADD COLUMN rejection_reason text;
  END IF;
END $$;
