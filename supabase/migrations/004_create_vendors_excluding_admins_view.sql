-- Migration: 004_create_vendors_excluding_admins_view
-- Date: 2026-04-11
-- Purpose: Create view to show only vendors (excluding users who are also admins)

CREATE OR REPLACE VIEW vendors_excluding_admins AS
SELECT v.*
FROM vendors v
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users au WHERE au.user_id = v.user_id
);

COMMENT ON VIEW vendors_excluding_admins IS 'Vendors list excluding users who are also admins.';

-- Track migration
INSERT INTO _migrations (migration_id, name) 
VALUES ('004_create_vendors_excluding_admins_view', 'Create vendors excluding admins view')
ON CONFLICT (migration_id) DO NOTHING;
