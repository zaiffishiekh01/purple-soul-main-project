/*
  # Optimize RLS Policies - Vendors & Products Tables

  1. Performance Optimization
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies
    - Prevents re-evaluation of auth functions for each row
    - Critical for performance at scale

  2. Changes
    - Drop and recreate policies for vendors table
    - Drop and recreate policies for products table
    - Use subquery pattern for all auth function calls
*/

-- =====================================================
-- VENDORS TABLE RLS OPTIMIZATION
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can delete vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can update vendor approval" ON vendors;
DROP POLICY IF EXISTS "Admins can view all vendors" ON vendors;

-- Recreate with optimized auth calls
CREATE POLICY "Admins can delete vendors"
ON vendors FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can update vendor approval"
ON vendors FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can view all vendors"
ON vendors FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- PRODUCTS TABLE RLS OPTIMIZATION
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can update all products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Approved vendors can delete own products" ON products;
DROP POLICY IF EXISTS "Approved vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Approved vendors can update own products" ON products;
DROP POLICY IF EXISTS "Approved vendors can view own products" ON products;

-- Recreate with optimized auth calls
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can update all products"
ON products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins can view all products"
ON products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Approved vendors can delete own products"
ON products FOR DELETE
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can insert own products"
ON products FOR INSERT
TO authenticated
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can update own products"
ON products FOR UPDATE
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
)
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);

CREATE POLICY "Approved vendors can view own products"
ON products FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM vendors
    WHERE user_id = (SELECT auth.uid())
    AND is_approved = true
  )
);
