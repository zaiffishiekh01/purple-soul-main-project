/*
  # Optimize Critical RLS Policies for Performance

  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) in critical RLS policies
    - Prevents re-evaluation of auth function for each row

  2. Policies Updated
    - cart_items (4 policies) - most frequently accessed
    - orders (2 policies)
    - customer_addresses (4 policies)
    - user_profiles (3 policies)

  3. Notes
    - orders table uses customer_id, not user_id
    - user_profiles uses id as the user reference
*/

-- cart_items table policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
  DROP POLICY IF EXISTS "Users can insert to own cart" ON public.cart_items;
  DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
  DROP POLICY IF EXISTS "Users can delete from own cart" ON public.cart_items;
END $$;

CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert to own cart"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- orders table policies (uses customer_id not user_id)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
  DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
END $$;

CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = customer_id);

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = customer_id);

-- customer_addresses table policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users view own addresses" ON public.customer_addresses;
  DROP POLICY IF EXISTS "Users insert own addresses" ON public.customer_addresses;
  DROP POLICY IF EXISTS "Users update own addresses" ON public.customer_addresses;
  DROP POLICY IF EXISTS "Users delete own addresses" ON public.customer_addresses;
END $$;

CREATE POLICY "Users view own addresses"
  ON public.customer_addresses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert own addresses"
  ON public.customer_addresses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own addresses"
  ON public.customer_addresses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own addresses"
  ON public.customer_addresses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- user_profiles table policies (id IS the user_id)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
END $$;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);
