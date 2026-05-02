/*
  Backfill returns.rejection_reason for databases that ran create/extend migrations
  before that column existed. Fresh installs get it from create_vendor_dashboard_schema
  and 20251114151256_extend_returns_table.sql.
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'returns' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.returns ADD COLUMN rejection_reason text;
  END IF;
END $$;
