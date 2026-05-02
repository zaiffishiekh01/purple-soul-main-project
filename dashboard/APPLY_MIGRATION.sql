-- Quick fix: run against your Postgres (psql, GUI, or CI), not a hosted SQL editor.
-- Prefer adding a new file under postgres/migrations/ and applying with: npm run db:apply-migrations

-- 1. Add missing columns
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS can_view_customer_phone boolean DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS can_view_customer_email boolean DEFAULT false;

-- 2. Fix any vendors with NULL is_approved
UPDATE vendors SET is_approved = false WHERE is_approved IS NULL;

-- 3. Update status for pending vendors
UPDATE vendors SET status = 'pending' WHERE status = 'active' AND is_approved = false;

-- 4. Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
ORDER BY ordinal_position;

-- 5. Check current vendors
SELECT id, user_id, business_name, contact_email, status, is_approved, created_at 
FROM vendors;
