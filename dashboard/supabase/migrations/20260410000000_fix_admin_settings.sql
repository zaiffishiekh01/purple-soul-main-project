-- =============================================
-- Admin Settings - Database Fixes
-- Run this ONCE in Supabase SQL Editor
-- =============================================

-- 1. Add full_name column to admin_users if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN full_name text;
  END IF;
END $$;

-- 2. Create admin_preferences table for notification settings
CREATE TABLE IF NOT EXISTS admin_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
  preference_key text NOT NULL,
  preference_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(admin_id, preference_key)
);

ALTER TABLE admin_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view own preferences" ON admin_preferences;
DROP POLICY IF EXISTS "Admins can update own preferences" ON admin_preferences;
DROP POLICY IF EXISTS "Admins can insert own preferences" ON admin_preferences;

-- RLS Policies for admin_preferences
CREATE POLICY "Admins can view own preferences"
  ON admin_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = admin_preferences.admin_id 
      AND au.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update own preferences"
  ON admin_preferences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = admin_preferences.admin_id 
      AND au.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = admin_preferences.admin_id 
      AND au.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert own preferences"
  ON admin_preferences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid()
    )
  );

-- 3. Create platform_settings table if missing
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view platform_settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can update platform_settings" ON platform_settings;

-- RLS Policies for platform_settings
CREATE POLICY "Admins can view platform_settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update platform_settings"
  ON platform_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert platform_settings"
  ON platform_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- 4. Insert default platform settings if they don't exist
INSERT INTO platform_settings (setting_key, setting_value)
VALUES 
  ('platform_commission_rate', '15'),
  ('minimum_payout_amount', '50'),
  ('auto_approve_vendors', 'false'),
  ('require_email_verification', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- 5. Create function to get admin full name
CREATE OR REPLACE FUNCTION get_admin_profile(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', au.id,
    'user_id', au.user_id,
    'full_name', COALESCE(au.full_name, ''),
    'email', u.email,
    'role', au.role,
    'is_super_admin', COALESCE(au.is_super_admin, false),
    'created_at', au.created_at
  ) INTO v_result
  FROM admin_users au
  LEFT JOIN auth.users u ON u.id = au.user_id
  WHERE au.user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_profile(uuid) TO authenticated;

-- Done!
SELECT '✅ Admin settings database setup complete!' AS status;
