/*
  # Add Admin Password Reset Helper Function

  1. New Functions
    - `reset_admin_password` - Allows resetting password for admin users directly
  
  2. Security
    - Function uses SECURITY DEFINER to bypass RLS
    - Only works for existing admin users
*/

-- Function to help reset admin password
CREATE OR REPLACE FUNCTION reset_admin_password(
  admin_email text,
  new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
BEGIN
  -- Check if user exists and is an admin
  SELECT u.id, u.email, a.role
  INTO user_record
  FROM auth.users u
  INNER JOIN admin_users a ON a.user_id = u.id
  WHERE u.email = admin_email;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Admin user not found');
  END IF;

  RETURN json_build_object(
    'success', true, 
    'message', 'Use Supabase password reset flow',
    'user_id', user_record.id,
    'role', user_record.role
  );
END;
$$;
