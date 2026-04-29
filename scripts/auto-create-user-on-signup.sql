-- =====================================================
-- AUTO-CREATE USER AND CUSTOMER ON AUTH SIGNUP
-- =====================================================
-- This trigger automatically creates records in the 
-- public.users and public.customers tables whenever
-- a new user signs up via Supabase Authentication.
-- =====================================================

-- 1. Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile in public.users
  INSERT INTO public.users (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User'),
    'customer',
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create customer record in public.customers
  INSERT INTO public.customers (user_id, email, first_name, last_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), split_part(NEW.email, '@', 1)),
    COALESCE(substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1), ''),
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill: Create users and customers for existing auth users
INSERT INTO public.users (id, email, full_name, role, status)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'User'),
  'customer',
  'pending'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customers (user_id, email, first_name, last_name, status)
SELECT 
  u.id,
  u.email,
  COALESCE(split_part(u.full_name, ' ', 1), split_part(u.email, '@', 1)),
  COALESCE(substring(u.full_name from position(' ' in u.full_name) + 1), ''),
  'active'
FROM public.users u
WHERE u.id NOT IN (SELECT user_id FROM public.customers WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verify setup
DO $$
DECLARE
  trigger_exists BOOLEAN;
  user_count INTEGER;
  customer_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) INTO trigger_exists;

  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO customer_count FROM public.customers;

  RAISE NOTICE '✅ Trigger created: %', trigger_exists;
  RAISE NOTICE '📊 Users in public.users: %', user_count;
  RAISE NOTICE '📊 Customers in public.customers: %', customer_count;
END $$;
