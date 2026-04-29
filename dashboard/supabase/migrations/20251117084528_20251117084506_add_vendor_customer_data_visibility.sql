/*
  # Add Vendor Customer Data Visibility Controls

  1. Changes to vendors table
    - Add `can_view_customer_phone` (boolean) - Allow vendor to see customer phone in shipping labels
    - Add `can_view_customer_email` (boolean) - Allow vendor to see customer email in shipping labels
    - Both default to FALSE for security/privacy
    - Admin can enable these on a per-vendor basis based on trust level

  2. Purpose
    - Give admins fine-grained control over what customer data vendors can access
    - By default, vendors only see customer name and shipping address
    - As vendors build trust, admin can grant access to phone/email for better customer service
    - Useful for shipping logistics when carriers need contact info

  3. Security
    - Only admins can modify these permissions
    - Vendors can read their own permission status
    - Changes logged for audit trail
*/

-- Add customer data visibility columns to vendors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'can_view_customer_phone'
  ) THEN
    ALTER TABLE vendors ADD COLUMN can_view_customer_phone boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'can_view_customer_email'
  ) THEN
    ALTER TABLE vendors ADD COLUMN can_view_customer_email boolean DEFAULT false;
  END IF;
END $$;

-- Add comments explaining the fields
COMMENT ON COLUMN vendors.can_view_customer_phone IS 'Admin-controlled: Allow vendor to see customer phone numbers in orders/shipping labels';
COMMENT ON COLUMN vendors.can_view_customer_email IS 'Admin-controlled: Allow vendor to see customer email addresses in orders/shipping labels';

-- Update existing vendors to have permissions disabled by default (safe default)
UPDATE vendors
SET
  can_view_customer_phone = false,
  can_view_customer_email = false
WHERE can_view_customer_phone IS NULL OR can_view_customer_email IS NULL;