# Supabase Migrations

This directory contains SQL migration files for your Supabase project.

## How to Use

### Option 1: Quick Apply (Recommended for now)
1. Open `scripts/APPLY_ALL_FIXES.sql`
2. Copy everything
3. Paste into Supabase Dashboard → SQL Editor
4. Run it

### Option 2: Individual Migrations
Run these files one by one in order:
1. `001_create_admin_user_bypass.sql`
2. `002_create_vendor_delete_bypass.sql`
3. `003_fix_vendor_rls_policies.sql`
4. `004_create_vendors_excluding_admins_view.sql`

## Migration Files

- **001_create_admin_user_bypass.sql** - Creates function to add admins bypassing RLS
- **002_create_vendor_delete_bypass.sql** - Creates function to delete vendors bypassing RLS
- **003_fix_vendor_rls_policies.sql** - Sets up proper RLS policies for vendors
- **004_create_vendors_excluding_admins_view.sql** - Creates view to filter admins from vendor list

## Tracking

All migrations are tracked in the `_migrations` table which is automatically created.

## Future Migrations

When creating new migrations:
1. Create a new SQL file with naming format: `NNN_description.sql`
2. Add migration tracking at the top:
   ```sql
   INSERT INTO _migrations (migration_id, name) 
   VALUES ('20260411_description', 'Description of migration')
   ON CONFLICT (migration_id) DO NOTHING;
   ```
3. Run in Supabase SQL Editor
