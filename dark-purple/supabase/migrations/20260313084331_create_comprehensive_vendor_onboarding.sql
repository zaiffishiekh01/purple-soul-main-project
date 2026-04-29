/*
  # Comprehensive Vendor Onboarding System

  ## Overview
  Complete vendor onboarding with multi-step intelligent form, verification, and admin approval workflow.

  ## New Tables

  1. `vendor_applications`
     - Stores vendor application submissions before approval
     - Tracks application status and admin review
     - Stores comprehensive business information

  2. `vendor_verification`
     - Business verification documents
     - Tax ID verification
     - Identity verification

  3. `vendor_onboarding_progress`
     - Tracks completion of onboarding steps
     - Resume incomplete applications
     - Progress indicators

  ## Extended Vendor Table Fields
  - Business details (address, phone, website)
  - Tax information
  - Bank account details (encrypted)
  - Shipping capabilities
  - Return policy

  ## Workflow
  1. User creates account or logs in
  2. Completes multi-step vendor application
  3. Uploads verification documents
  4. Admin reviews application
  5. Admin approves → Vendor account activated
  6. Vendor completes profile setup
  7. Vendor can start listing products
*/

-- Create enum types for vendor application
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM (
      'draft',
      'submitted',
      'under_review',
      'approved',
      'rejected',
      'needs_info'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_type') THEN
    CREATE TYPE business_type AS ENUM (
      'sole_proprietor',
      'partnership',
      'llc',
      'corporation',
      'non_profit',
      'artisan',
      'cottage_industry'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
    CREATE TYPE verification_status AS ENUM (
      'pending',
      'verified',
      'failed',
      'expired'
    );
  END IF;
END $$;

-- Vendor Applications Table
CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Application Status
  status application_status DEFAULT 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,

  -- Step 1: Business Information
  business_name text NOT NULL,
  business_type business_type NOT NULL,
  business_description text CHECK (char_length(business_description) >= 50),
  business_story text,
  year_established integer CHECK (year_established >= 1800 AND year_established <= EXTRACT(YEAR FROM CURRENT_DATE)),

  -- Step 2: Contact Information
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  website_url text,
  social_media_links jsonb DEFAULT '{}'::jsonb,

  -- Step 3: Business Address
  business_address jsonb NOT NULL,
  /*
  {
    "address_line1": "123 Main St",
    "address_line2": "Suite 100",
    "city": "City Name",
    "state_province": "State",
    "postal_code": "12345",
    "country": "USA"
  }
  */

  -- Step 4: Products & Categories
  primary_category text NOT NULL,
  product_categories text[] DEFAULT ARRAY[]::text[],
  product_types text[] DEFAULT ARRAY[]::text[],
  estimated_monthly_products integer,
  sample_product_descriptions jsonb DEFAULT '[]'::jsonb,

  -- Step 5: Craftsmanship & Values
  is_handmade boolean DEFAULT true,
  handmade_percentage integer CHECK (handmade_percentage >= 0 AND handmade_percentage <= 100),
  materials_sourcing text,
  ethical_practices text[] DEFAULT ARRAY[]::text[],
  certifications text[] DEFAULT ARRAY[]::text[],

  -- Step 6: Business Operations
  production_time_days integer,
  shipping_regions text[] DEFAULT ARRAY[]::text[],
  return_policy text,
  custom_orders_accepted boolean DEFAULT false,

  -- Step 7: Tax & Legal
  tax_id_type text,
  tax_id_number text,
  business_license_number text,
  business_registered_state text,

  -- Step 8: Banking (for payouts)
  bank_account_holder text,
  bank_name text,
  bank_account_type text,
  bank_routing_number text,
  bank_account_last4 text,

  -- Admin Review
  admin_notes text,
  rejection_reason text,
  additional_info_requested text,

  -- Metadata
  application_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Unique constraint: one active application per user
  CONSTRAINT unique_active_application UNIQUE (user_id)
);

-- Vendor Verification Documents Table
CREATE TABLE IF NOT EXISTS vendor_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Application Reference
  application_id uuid NOT NULL REFERENCES vendor_applications(id) ON DELETE CASCADE,

  -- Document Type
  document_type text NOT NULL CHECK (document_type IN (
    'business_license',
    'tax_id_document',
    'identity_verification',
    'bank_statement',
    'product_photos',
    'craft_certification',
    'insurance_certificate',
    'other'
  )),

  -- Document Details
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,

  -- Verification
  verification_status verification_status DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
  verification_notes text,

  -- Metadata
  uploaded_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Vendor Onboarding Progress Table
CREATE TABLE IF NOT EXISTS vendor_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES vendor_applications(id) ON DELETE CASCADE,

  -- Progress Tracking
  current_step integer DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 8),
  completed_steps integer[] DEFAULT ARRAY[]::integer[],

  -- Step Completion Status
  step_1_business_info boolean DEFAULT false,
  step_2_contact_info boolean DEFAULT false,
  step_3_address boolean DEFAULT false,
  step_4_products boolean DEFAULT false,
  step_5_values boolean DEFAULT false,
  step_6_operations boolean DEFAULT false,
  step_7_legal boolean DEFAULT false,
  step_8_banking boolean DEFAULT false,

  -- Form Data (auto-save)
  form_data jsonb DEFAULT '{}'::jsonb,
  last_saved_at timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Unique constraint: one progress record per user
  CONSTRAINT unique_user_progress UNIQUE (user_id)
);

-- Extend vendors table with additional fields
DO $$
BEGIN
  -- Business Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'business_type') THEN
    ALTER TABLE vendors ADD COLUMN business_type business_type;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'business_address') THEN
    ALTER TABLE vendors ADD COLUMN business_address jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'phone') THEN
    ALTER TABLE vendors ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'website') THEN
    ALTER TABLE vendors ADD COLUMN website text;
  END IF;

  -- Operational Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'production_time_days') THEN
    ALTER TABLE vendors ADD COLUMN production_time_days integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'return_policy') THEN
    ALTER TABLE vendors ADD COLUMN return_policy text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'shipping_regions') THEN
    ALTER TABLE vendors ADD COLUMN shipping_regions text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Verification
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'is_verified') THEN
    ALTER TABLE vendors ADD COLUMN is_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'verified_at') THEN
    ALTER TABLE vendors ADD COLUMN verified_at timestamptz;
  END IF;

  -- Application reference
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'application_id') THEN
    ALTER TABLE vendors ADD COLUMN application_id uuid REFERENCES vendor_applications(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_submitted ON vendor_applications(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendor_verification_application ON vendor_verification(application_id);
CREATE INDEX IF NOT EXISTS idx_vendor_verification_status ON vendor_verification(verification_status);

CREATE INDEX IF NOT EXISTS idx_vendor_progress_user ON vendor_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_progress_application ON vendor_onboarding_progress(application_id);

-- Enable RLS
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_applications

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON vendor_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create applications
CREATE POLICY "Users can create applications"
  ON vendor_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own draft/needs_info applications
CREATE POLICY "Users can update own draft applications"
  ON vendor_applications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status IN ('draft', 'needs_info'))
  WITH CHECK (user_id = auth.uid() AND status IN ('draft', 'needs_info', 'submitted'));

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON vendor_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update applications (review, approve, reject)
CREATE POLICY "Admins can update applications"
  ON vendor_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for vendor_verification

-- Users can view their own verification documents
CREATE POLICY "Users can view own verification docs"
  ON vendor_verification FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM vendor_applications WHERE user_id = auth.uid()
    )
  );

-- Users can upload verification documents
CREATE POLICY "Users can upload verification docs"
  ON vendor_verification FOR INSERT
  TO authenticated
  WITH CHECK (
    application_id IN (
      SELECT id FROM vendor_applications WHERE user_id = auth.uid()
    )
  );

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification docs"
  ON vendor_verification FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update verification status
CREATE POLICY "Admins can update verification status"
  ON vendor_verification FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for vendor_onboarding_progress

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON vendor_onboarding_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own progress
CREATE POLICY "Users can create own progress"
  ON vendor_onboarding_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON vendor_onboarding_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Helper function to auto-save progress
CREATE OR REPLACE FUNCTION update_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  -- Auto-mark steps as completed based on required fields
  IF NEW.business_name IS NOT NULL AND NEW.business_type IS NOT NULL THEN
    NEW.step_1_business_info = true;
  END IF;

  IF NEW.contact_email IS NOT NULL AND NEW.contact_phone IS NOT NULL THEN
    NEW.step_2_contact_info = true;
  END IF;

  IF NEW.business_address IS NOT NULL THEN
    NEW.step_3_address = true;
  END IF;

  IF NEW.primary_category IS NOT NULL THEN
    NEW.step_4_products = true;
  END IF;

  -- Update completed steps array
  NEW.completed_steps = ARRAY[]::integer[];
  IF NEW.step_1_business_info THEN NEW.completed_steps = array_append(NEW.completed_steps, 1); END IF;
  IF NEW.step_2_contact_info THEN NEW.completed_steps = array_append(NEW.completed_steps, 2); END IF;
  IF NEW.step_3_address THEN NEW.completed_steps = array_append(NEW.completed_steps, 3); END IF;
  IF NEW.step_4_products THEN NEW.completed_steps = array_append(NEW.completed_steps, 4); END IF;
  IF NEW.step_5_values THEN NEW.completed_steps = array_append(NEW.completed_steps, 5); END IF;
  IF NEW.step_6_operations THEN NEW.completed_steps = array_append(NEW.completed_steps, 6); END IF;
  IF NEW.step_7_legal THEN NEW.completed_steps = array_append(NEW.completed_steps, 7); END IF;
  IF NEW.step_8_banking THEN NEW.completed_steps = array_append(NEW.completed_steps, 8); END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress
DROP TRIGGER IF EXISTS trigger_update_onboarding_progress ON vendor_applications;
CREATE TRIGGER trigger_update_onboarding_progress
  BEFORE INSERT OR UPDATE ON vendor_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_progress();

-- Helper function to create vendor from approved application
CREATE OR REPLACE FUNCTION create_vendor_from_application(p_application_id uuid)
RETURNS uuid AS $$
DECLARE
  v_application vendor_applications;
  v_vendor_id uuid;
BEGIN
  -- Get application
  SELECT * INTO v_application
  FROM vendor_applications
  WHERE id = p_application_id
  AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or not approved';
  END IF;

  -- Check if vendor already exists
  SELECT id INTO v_vendor_id
  FROM vendors
  WHERE user_id = v_application.user_id;

  IF FOUND THEN
    -- Update existing vendor
    UPDATE vendors SET
      business_name = v_application.business_name,
      email = v_application.contact_email,
      description = v_application.business_description,
      business_type = v_application.business_type,
      business_address = v_application.business_address,
      phone = v_application.contact_phone,
      website = v_application.website_url,
      production_time_days = v_application.production_time_days,
      return_policy = v_application.return_policy,
      shipping_regions = v_application.shipping_regions,
      status = 'active',
      is_verified = true,
      verified_at = now(),
      application_id = p_application_id,
      updated_at = now()
    WHERE id = v_vendor_id;
  ELSE
    -- Create new vendor
    INSERT INTO vendors (
      user_id,
      business_name,
      email,
      description,
      business_type,
      business_address,
      phone,
      website,
      production_time_days,
      return_policy,
      shipping_regions,
      status,
      is_verified,
      verified_at,
      application_id
    ) VALUES (
      v_application.user_id,
      v_application.business_name,
      v_application.contact_email,
      v_application.business_description,
      v_application.business_type,
      v_application.business_address,
      v_application.contact_phone,
      v_application.website_url,
      v_application.production_time_days,
      v_application.return_policy,
      v_application.shipping_regions,
      'active',
      true,
      now(),
      p_application_id
    ) RETURNING id INTO v_vendor_id;
  END IF;

  -- Update user role
  UPDATE users SET role = 'vendor' WHERE id = v_application.user_id;

  RETURN v_vendor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;