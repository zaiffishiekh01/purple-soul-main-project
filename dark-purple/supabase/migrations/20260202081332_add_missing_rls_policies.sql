/*
  # Add Missing RLS Policies

  1. Security Fixes
    - Add policies for tables with RLS enabled but no policies
    - Fix overly permissive policy on site_stats

  2. Tables Fixed
    - coupon_usage: Add policies for customers to view their own usage
    - vendor_order_items: Add policies for vendors to view their order items
    - vendor_orders: Add policies for vendors to view and manage their orders
    - site_stats: Fix overly permissive update policy

  3. Security Model
    - Customers can only see their own coupon usage
    - Vendors can only see their own order items and orders
    - Site stats can only be updated by authenticated admin users (not all users)
*/

-- coupon_usage policies
CREATE POLICY "Users can view own coupon usage"
  ON public.coupon_usage FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "System can insert coupon usage"
  ON public.coupon_usage FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- vendor_order_items policies
CREATE POLICY "Vendors can view own order items"
  ON public.vendor_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_orders vo
      JOIN public.vendors v ON vo.vendor_id = v.id
      WHERE vo.id = vendor_order_items.vendor_order_id
      AND v.user_id = (select auth.uid())
    )
  );

-- vendor_orders policies
CREATE POLICY "Vendors can view own orders"
  ON public.vendor_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_orders.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Vendors can update own orders"
  ON public.vendor_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_orders.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_orders.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
  );

-- Fix overly permissive site_stats policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can update site stats" ON public.site_stats;
END $$;

-- Only allow service role to update stats (for background jobs/functions)
CREATE POLICY "Service role can update site stats"
  ON public.site_stats FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
