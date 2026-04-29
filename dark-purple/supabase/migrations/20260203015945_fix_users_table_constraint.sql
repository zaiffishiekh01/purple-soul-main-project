/*
  # Fix Users Table for JWT Authentication
  
  The platform uses JWT authentication, not Supabase Auth.
  Remove the foreign key constraint that requires auth.users.
  
  ## Changes
  1. Drop the foreign key constraint on public.users.id
  2. Add default UUID generation for new users
  3. Update existing data is preserved
*/

-- Drop the foreign key constraint
ALTER TABLE IF EXISTS public.users 
  DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Ensure id has a default value for new inserts
ALTER TABLE public.users 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add comment to clarify this table is independent
COMMENT ON TABLE public.users IS 'User profiles for JWT authentication system. Independent of Supabase Auth.';
