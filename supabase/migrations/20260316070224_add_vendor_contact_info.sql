/*
  # Add Vendor Contact Information to Service Bookings

  1. Changes
    - Add vendor contact fields to `user_vendor_bookings` table
      - `vendor_email` (text) - Vendor contact email
      - `vendor_phone` (text) - Vendor phone number
      - `vendor_website` (text) - Vendor website URL
      - `vendor_address` (text) - Vendor business address
      - `service_package` (text) - Package or service name booked
      - `booking_amount` (numeric) - Amount paid for booking
      - `booking_description` (text) - Details about the booking

  2. Purpose
    - Store complete vendor contact information for user's service bookings
    - Track wedding/ceremony service appointments
    - Maintain vendor details for future reference
*/

-- Add vendor contact information columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_vendor_bookings' AND column_name = 'vendor_email'
  ) THEN
    ALTER TABLE user_vendor_bookings ADD COLUMN vendor_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_vendor_bookings' AND column_name = 'vendor_phone'
  ) THEN
    ALTER TABLE user_vendor_bookings ADD COLUMN vendor_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_vendor_bookings' AND column_name = 'vendor_website'
  ) THEN
    ALTER TABLE user_vendor_bookings ADD COLUMN vendor_website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_vendor_bookings' AND column_name = 'vendor_address'
  ) THEN
    ALTER TABLE user_vendor_bookings ADD COLUMN vendor_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_vendor_bookings' AND column_name = 'service_package'
  ) THEN
    ALTER TABLE user_vendor_bookings ADD COLUMN service_package text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_vendor_bookings' AND column_name = 'booking_amount'
  ) THEN
    ALTER TABLE user_vendor_bookings ADD COLUMN booking_amount numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_vendor_bookings' AND column_name = 'booking_description'
  ) THEN
    ALTER TABLE user_vendor_bookings ADD COLUMN booking_description text;
  END IF;
END $$;
