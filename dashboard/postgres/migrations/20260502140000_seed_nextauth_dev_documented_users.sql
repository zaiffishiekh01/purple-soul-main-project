/*
  # Seed NextAuth-compatible passwords for documented local dev accounts

  Credentials login (`src/auth.ts`) uses `verifyPassword()` which expects
  `encrypted_password` in the form `salt:hex` (scrypt, 64-byte digest) from
  `hashPassword()` in `src/lib/server/auth.ts`.

  Older migrations inserted placeholder values like `seeded-migration-password`,
  which never verify — NextAuth returns `CredentialsSignin`.

  This migration upserts the admin and vendor emails described in
  `FULL_ACCESS_CREDENTIALS.md` with known dev-only passwords:

  - fk.envcal@gmail.com / Admin123!
  - test.vendor@purple-soul.com / VendorTest123!

  Precomputed hashes (Node crypto scryptSync, default options):
  - Admin:    3c40ac328b676028eb7f0c70e1f9210f:9373c300acf32166decca479026515653b5233d92760358082766c85f53c4dd2b08c5ea1471409ca9ab8fa84873e4a10b70475507ede4200dc6b59c970d67cf8
  - Vendor:   5e24ecfd9ed0363f995d3c74a7b1164b:f050e2748b083eea0571fbba851cdbfb23d82ec12d6ca9a9b69103bc3fbe0607ad134e022a60da72f41abf96b5688c1897c616359c2d66a8a74c801c1f8dcef8
*/

INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'fk.envcal@gmail.com',
  '3c40ac328b676028eb7f0c70e1f9210f:9373c300acf32166decca479026515653b5233d92760358082766c85f53c4dd2b08c5ea1471409ca9ab8fa84873e4a10b70475507ede4200dc6b59c970d67cf8',
  now(),
  '{}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at),
  updated_at = now();

INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'test.vendor@purple-soul.com',
  '5e24ecfd9ed0363f995d3c74a7b1164b:f050e2748b083eea0571fbba851cdbfb23d82ec12d6ca9a9b69103bc3fbe0607ad134e022a60da72f41abf96b5688c1897c616359c2d66a8a74c801c1f8dcef8',
  now(),
  '{"role":"vendor"}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at),
  updated_at = now();

INSERT INTO admin_users (user_id, role, permissions, full_name)
SELECT
  u.id,
  'super_admin',
  '{"manage_vendors": true, "manage_orders": true, "manage_products": true, "manage_users": true, "view_analytics": true, "manage_finance": true}'::jsonb,
  'Local Dev Super Admin'
FROM auth.users u
WHERE u.email = 'fk.envcal@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  full_name = COALESCE(NULLIF(admin_users.full_name, ''), EXCLUDED.full_name),
  updated_at = now();

INSERT INTO vendors (
  user_id,
  business_name,
  business_type,
  contact_email,
  contact_phone,
  phone,
  status,
  is_approved
)
SELECT
  u.id,
  'Purple Soul Crafts',
  'Islamic Art & Crafts',
  'test.vendor@purple-soul.com',
  '+1-555-2001',
  '+1-555-2001',
  'active',
  true
FROM auth.users u
WHERE u.email = 'test.vendor@purple-soul.com'
  AND NOT EXISTS (SELECT 1 FROM vendors v WHERE v.user_id = u.id);
