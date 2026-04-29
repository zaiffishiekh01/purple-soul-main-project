# 🚀 How to Create Demo Accounts

Since the platform uses JWT authentication (not Supabase Auth), you have a few options to create test accounts.

---

## ✅ RECOMMENDED: Use the Registration API

This is the easiest and safest method.

### 1. Start Your Development Server

```bash
npm run dev
```

### 2. Use the Registration Form

Navigate to your site and click **"Sign In"** → **"Sign Up"** tab, then register each account:

#### Register Customer Account
- Email: `customer@demo.com`
- Password: `Customer123!`
- Full Name: `Demo Customer`

#### Register Vendor Account
- Email: `vendor@demo.com`
- Password: `Vendor123!`
- Full Name: `Demo Vendor`

#### Register Admin Account
- Email: `admin@demo.com`
- Password: `Admin123!`
- Full Name: `Demo Administrator`

### 3. Assign Roles in Supabase

After registering, you need to manually assign roles in the database:

1. Go to https://supabase.com/dashboard/project/qvzeptnrikucdpabizev/editor
2. Run this SQL to assign roles:

```sql
-- Get the user IDs
DO $$
DECLARE
  customer_id uuid;
  vendor_id uuid;
  admin_id uuid;
  customer_role_id uuid;
  vendor_role_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO customer_role_id FROM roles WHERE name = 'customer';
  SELECT id INTO vendor_role_id FROM roles WHERE name = 'vendor';
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Get user IDs
  SELECT id INTO customer_id FROM public.users WHERE email = 'customer@demo.com';
  SELECT id INTO vendor_id FROM public.users WHERE email = 'vendor@demo.com';
  SELECT id INTO admin_id FROM public.users WHERE email = 'admin@demo.com';

  -- Assign customer role
  IF customer_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (customer_id, customer_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    RAISE NOTICE 'Customer role assigned';
  END IF;

  -- Assign vendor role
  IF vendor_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (vendor_id, vendor_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

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
      vendor_id,
      'Sacred Crafts Studio',
      'artisan',
      'Handcrafted Islamic prayer items with traditional techniques',
      'vendor@demo.com',
      '+1-555-0123',
      '123 Artisan Lane, Brooklyn, NY 11201',
      'active'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Vendor role and profile created';
  END IF;

  -- Assign admin role
  IF admin_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    RAISE NOTICE 'Admin role assigned';
  END IF;
END $$;

-- Verify the assignments
SELECT
  u.email,
  u.full_name,
  r.name as role,
  u.status
FROM public.users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email IN ('customer@demo.com', 'vendor@demo.com', 'admin@demo.com')
ORDER BY r.name;
```

---

## 🔧 ALTERNATIVE: Use API Directly

You can also create accounts using the API with curl or Postman.

### Register Customer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.com",
    "password": "Customer123!",
    "fullName": "Demo Customer"
  }'
```

### Register Vendor

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@demo.com",
    "password": "Vendor123!",
    "fullName": "Demo Vendor"
  }'
```

### Register Admin

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Admin123!",
    "fullName": "Demo Administrator"
  }'
```

Then run the SQL script above to assign roles.

---

## 📋 Login Credentials

Once created, use these credentials to test:

### 👤 Customer Account
```
Email: customer@demo.com
Password: Customer123!
Dashboard: /account
```

### 🏪 Vendor Account
```
Email: vendor@demo.com
Password: Vendor123!
Dashboard: /vendor
```

### 👑 Admin Account
```
Email: admin@demo.com
Password: Admin123!
Dashboard: /admin
```

---

## ✅ Verify Setup

Run this SQL to verify all accounts are created with correct roles:

```sql
SELECT
  u.id,
  u.email,
  u.full_name,
  u.status,
  u.email_verified,
  r.name as role,
  CASE
    WHEN r.name = 'vendor' THEN (SELECT business_name FROM vendors WHERE user_id = u.id)
    ELSE NULL
  END as vendor_business
FROM public.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email IN ('customer@demo.com', 'vendor@demo.com', 'admin@demo.com')
ORDER BY u.email, r.name;
```

Expected output:
- customer@demo.com → customer role
- vendor@demo.com → vendor role, business_name: "Sacred Crafts Studio"
- admin@demo.com → admin role

---

## 🧪 Test the Accounts

### 1. Test Customer Login
1. Navigate to your site
2. Click "Sign In"
3. Enter: `customer@demo.com` / `Customer123!`
4. Should redirect to `/account`
5. Try adding items to cart, creating wishlist, etc.

### 2. Test Vendor Login
1. Sign out
2. Sign in with: `vendor@demo.com` / `Vendor123!`
3. Should redirect to `/vendor`
4. View dashboard, manage products, see orders

### 3. Test Admin Login
1. Sign out
2. Sign in with: `admin@demo.com` / `Admin123!`
3. Should redirect to `/admin`
4. Access all admin features

---

## 🐛 Troubleshooting

### "User already exists" Error
- The account is already registered
- Try logging in instead
- Or use a different email

### "Invalid credentials" Error
- Check the email/password (case-sensitive)
- Ensure password meets requirements:
  - At least 8 characters
  - Contains uppercase, lowercase, numbers, special characters

### Can't Access Dashboard
- Verify role was assigned (run the verification SQL above)
- Check `user_roles` table
- Try logging out and back in

### Vendor Dashboard Shows No Business
- Run the vendor profile creation SQL
- Check `vendors` table for user_id

---

## 📚 Next Steps

After creating accounts, refer to:
- **DEMO_CREDENTIALS.md** - Complete testing guide
- **VENDOR_DASHBOARD_INTEGRATION_COMPLETE.md** - Integration details
- **lib/integrations/vendor-dashboard/README.md** - Technical documentation

---

**Happy Testing! 🎉**
