/*
  # Consolidate Duplicate Permissive Policies

  1. Security Improvement
    - Remove duplicate policies by consolidating logic
    - Maintain same access control, cleaner implementation
    - Some duplicates are intentional (admin + vendor) - add comments

  2. Changes
    - Remove exact duplicates for shipping_labels
    - Remove exact duplicates for support_tickets
    - Add documentation comments for intentional multiple policies
*/

-- =====================================================
-- SHIPPING LABELS - Remove Duplicate Policies
-- =====================================================

-- These are exact duplicates, keep the "Approved vendors" versions
DROP POLICY IF EXISTS "Vendors can insert own labels" ON shipping_labels;
DROP POLICY IF EXISTS "Vendors can view own labels" ON shipping_labels;
DROP POLICY IF EXISTS "Vendors can update own labels" ON shipping_labels;

-- =====================================================
-- SUPPORT TICKETS - Remove Duplicate Policies
-- =====================================================

-- These are exact duplicates, keep the "Approved vendors" versions
DROP POLICY IF EXISTS "Vendors can insert own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Vendors can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Vendors can update own tickets" ON support_tickets;

-- =====================================================
-- DOCUMENTATION FOR INTENTIONAL MULTIPLE POLICIES
-- =====================================================

/*
  NOTE: The following tables have intentional multiple permissive policies:

  - admin_users: Separate policies for own data vs super admin viewing all
  - orders: Separate policies for admin access vs vendor access
  - products: Separate policies for admin access vs vendor access
  - returns: Separate policies for admin access vs vendor access
  - shipments: Separate policies for admin access vs vendor access
  - transactions: Separate policies for admin access vs vendor access
  - vendors: Separate policies for admin access vs vendor access
  - platform_fees: Separate policies for admin access vs vendor read-only
  - payout_requests: Separate policies for admin access vs vendor access
  - product_guidelines: Separate policies for admin access vs vendor read-only

  These are NOT duplicates - they serve different user roles and are necessary
  for proper role-based access control (RBAC).
*/

-- Add helpful comment to database
COMMENT ON TABLE products IS 'Products table - Multiple RLS policies for admin and vendor roles are intentional';
COMMENT ON TABLE orders IS 'Orders table - Multiple RLS policies for admin and vendor roles are intentional';
COMMENT ON TABLE vendors IS 'Vendors table - Multiple RLS policies for admin and vendor roles are intentional';
