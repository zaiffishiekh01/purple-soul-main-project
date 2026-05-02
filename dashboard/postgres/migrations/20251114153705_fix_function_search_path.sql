/*
  # Fix Function Search Path Security

  1. Purpose
    - Set SECURITY DEFINER functions to use a stable search_path
    - Prevents search_path hijacking attacks

  2. Changes
    - Update all trigger functions with proper search_path
*/

-- Fix update_payout_settings_updated_at function
DROP FUNCTION IF EXISTS update_payout_settings_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_payout_settings_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER payout_settings_updated_at
  BEFORE UPDATE ON payout_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_settings_updated_at();

-- Fix support_tickets updated_at function if exists
DROP FUNCTION IF EXISTS update_support_tickets_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Fix any other update trigger functions that might exist
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name LIKE '%updated_at%'
    AND routine_type = 'FUNCTION'
  LOOP
    EXECUTE format('
      ALTER FUNCTION %I() SET search_path = public
    ', func_record.routine_name);
  END LOOP;
END $$;
