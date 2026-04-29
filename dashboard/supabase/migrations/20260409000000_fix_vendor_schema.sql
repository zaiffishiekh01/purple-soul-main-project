/*
  # Fix Vendor Schema Issues
  
  1. Add missing columns to vendors table
  2. Ensure proper defaults for approval status
  3. Fix potential loading hangs
*/

-- Add missing columns that are referenced in the TypeScript types
DO $$
BEGIN
  -- Add can_view_customer_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'can_view_customer_phone'
  ) THEN
    ALTER TABLE vendors ADD COLUMN can_view_customer_phone boolean DEFAULT false;
  END IF;

  -- Add can_view_customer_email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'can_view_customer_email'
  ) THEN
    ALTER TABLE vendors ADD COLUMN can_view_customer_email boolean DEFAULT false;
  END IF;
END $$;

-- Add comment to clarify the approval flow
COMMENT ON COLUMN vendors.is_approved IS 'Whether the vendor has been approved by an admin to access the dashboard';
COMMENT ON COLUMN vendors.status IS 'Vendor status: pending (awaiting approval), active (approved and operational), suspended';

-- Update any vendors with NULL is_approved to false
UPDATE vendors SET is_approved = false WHERE is_approved IS NULL;

-- Ensure the status column has proper defaults
UPDATE vendors SET status = 'pending' WHERE status = 'active' AND is_approved = false;
