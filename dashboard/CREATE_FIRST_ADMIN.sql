-- =====================================================
-- CREATE YOUR FIRST ADMIN USER
-- Run this in Supabase SQL Editor after signing up
-- =====================================================

-- Step 1: First, sign up a user via the dashboard UI
-- Then find that user's ID here:
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 2: Copy the user_id from above and insert it below
-- Replace 'YOUR-USER-ID-HERE' with the actual UUID

-- INSERT INTO admin_users (user_id, role, permissions, is_super_admin)
-- VALUES (
--   'YOUR-USER-ID-HERE',  -- <-- Replace with actual user ID
--   'super_admin',
--   '{"vendor_management": true, "order_management": true, "product_management": true, "finance_management": true, "analytics_monitoring": true}'::jsonb,
--   true
-- );

-- =====================================================
-- ALTERNATIVE: Create admin directly via SQL function
-- This bypasses the edge function issue
-- =====================================================

-- Create a helper function to create admins without edge functions
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email text,
  admin_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Note: This function assumes the user already exists in auth.users
  -- You need to sign up first via the UI, then call this function
  
  -- Find the user
  SELECT id INTO new_user_id FROM auth.users WHERE email = admin_email;
  
  IF new_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found. Please sign up first via the dashboard UI.');
  END IF;
  
  -- Check if already admin
  IF EXISTS (SELECT 1 FROM admin_users WHERE user_id = new_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'User is already an admin.');
  END IF;
  
  -- Insert into admin_users
  INSERT INTO admin_users (user_id, role, permissions, is_super_admin)
  VALUES (
    new_user_id,
    'super_admin',
    '{"vendor_management": true, "order_management": true, "product_management": true, "finance_management": true, "analytics_monitoring": true}'::jsonb,
    true
  );
  
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Admin user created successfully!'
  );
END;
$$;

-- After signing up via the dashboard UI, run this:
-- SELECT create_admin_user('your-email@example.com');
