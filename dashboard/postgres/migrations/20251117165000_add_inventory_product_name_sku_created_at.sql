/*
  Denormalized inventory labels + timestamps for dashboards and inventory seeds.
  Included in create_vendor_dashboard_schema for fresh installs; this backfills
  databases that applied the older inventory DDL before those columns existed.
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE public.inventory ADD COLUMN product_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'sku'
  ) THEN
    ALTER TABLE public.inventory ADD COLUMN sku text DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.inventory ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;
