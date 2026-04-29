-- ================================================================
-- DEMO ACCOUNTS SETUP SCRIPT
-- Run this in Supabase SQL Editor to create test accounts
-- ================================================================

-- First, let's create the demo users
DO $$
DECLARE
  customer_user_id uuid;
  vendor_user_id uuid;
  admin_user_id uuid;
  customer_role_id uuid;
  vendor_role_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO customer_role_id FROM roles WHERE name = 'customer';
  SELECT id INTO vendor_role_id FROM roles WHERE name = 'vendor';
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- ===== CUSTOMER ACCOUNT =====
  -- Check if customer exists
  SELECT id INTO customer_user_id FROM users WHERE email = 'customer@demo.com';

  IF customer_user_id IS NULL THEN
    -- Create customer user
    INSERT INTO users (email, full_name, password_hash, status, email_verified)
    VALUES (
      'customer@demo.com',
      'Demo Customer',
      crypt('Customer123!', gen_salt('bf', 10)),
      'active',
      true
    )
    RETURNING id INTO customer_user_id;

    -- Assign customer role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (customer_user_id, customer_role_id);

    RAISE NOTICE '✅ Customer account created';
  ELSE
    -- Update existing customer
    UPDATE users
    SET
      full_name = 'Demo Customer',
      password_hash = crypt('Customer123!', gen_salt('bf', 10)),
      status = 'active',
      email_verified = true
    WHERE id = customer_user_id;

    -- Ensure role is assigned
    INSERT INTO user_roles (user_id, role_id)
    VALUES (customer_user_id, customer_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE '✅ Customer account updated';
  END IF;

  -- ===== VENDOR ACCOUNT =====
  -- Check if vendor exists
  SELECT id INTO vendor_user_id FROM users WHERE email = 'vendor@demo.com';

  IF vendor_user_id IS NULL THEN
    -- Create vendor user
    INSERT INTO users (email, full_name, password_hash, status, email_verified)
    VALUES (
      'vendor@demo.com',
      'Demo Vendor',
      crypt('Vendor123!', gen_salt('bf', 10)),
      'active',
      true
    )
    RETURNING id INTO vendor_user_id;

    -- Assign vendor role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (vendor_user_id, vendor_role_id);

    -- Create vendor profile
    INSERT INTO vendors (
      user_id,
      business_name,
      business_type,
      description,
      contact_email,
      phone,
      address,
      status
    )
    VALUES (
      vendor_user_id,
      'Sacred Crafts Studio',
      'artisan',
      'Handcrafted Islamic prayer items with traditional techniques',
      'vendor@demo.com',
      '+1-555-0123',
      '123 Artisan Lane, Brooklyn, NY 11201',
      'active'
    );

    RAISE NOTICE '✅ Vendor account created with business profile';
  ELSE
    -- Update existing vendor
    UPDATE users
    SET
      full_name = 'Demo Vendor',
      password_hash = crypt('Vendor123!', gen_salt('bf', 10)),
      status = 'active',
      email_verified = true
    WHERE id = vendor_user_id;

    -- Ensure role is assigned
    INSERT INTO user_roles (user_id, role_id)
    VALUES (vendor_user_id, vendor_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- Update or create vendor profile
    INSERT INTO vendors (
      user_id,
      business_name,
      business_type,
      description,
      contact_email,
      phone,
      address,
      status
    )
    VALUES (
      vendor_user_id,
      'Sacred Crafts Studio',
      'artisan',
      'Handcrafted Islamic prayer items with traditional techniques',
      'vendor@demo.com',
      '+1-555-0123',
      '123 Artisan Lane, Brooklyn, NY 11201',
      'active'
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      business_name = EXCLUDED.business_name,
      business_type = EXCLUDED.business_type,
      description = EXCLUDED.description,
      status = 'active';

    RAISE NOTICE '✅ Vendor account updated';
  END IF;

  -- ===== ADMIN ACCOUNT =====
  -- Check if admin exists
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@demo.com';

  IF admin_user_id IS NULL THEN
    -- Create admin user
    INSERT INTO users (email, full_name, password_hash, status, email_verified)
    VALUES (
      'admin@demo.com',
      'Demo Administrator',
      crypt('Admin123!', gen_salt('bf', 10)),
      'active',
      true
    )
    RETURNING id INTO admin_user_id;

    -- Assign admin role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id);

    RAISE NOTICE '✅ Admin account created';
  ELSE
    -- Update existing admin
    UPDATE users
    SET
      full_name = 'Demo Administrator',
      password_hash = crypt('Admin123!', gen_salt('bf', 10)),
      status = 'active',
      email_verified = true
    WHERE id = admin_user_id;

    -- Ensure role is assigned
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE '✅ Admin account updated';
  END IF;

END $$;

-- ================================================================
-- Verify the accounts were created
-- ================================================================
SELECT
  u.email,
  u.full_name,
  r.name as role,
  u.status,
  u.email_verified
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email IN ('customer@demo.com', 'vendor@demo.com', 'admin@demo.com')
ORDER BY r.name;
