/*
  # Create Test New Product Offers System
  
  This migration creates a complete system for approval-based test product offers.
  This is NOT a purchase order system - it's for collaboration and pilot testing only.
  
  ## Tables Created
  
  1. **test_product_offers**
     - Main table for admin-created test product opportunities
     - Contains product specs, design references, target quantities
     - Status tracks lifecycle from draft to completion
     - locked_vendor_id indicates which vendor was approved for test (not purchase)
  
  2. **test_product_offer_vendors**
     - Vendor applications to test product offers
     - Contains vendor proposals, pricing estimates, capacity
     - Status tracks application lifecycle
  
  3. **test_product_offer_messages**
     - Two-way communication between admin and vendors
     - Supports file attachments via storage URLs
  
  ## Key Business Rules
  
  - No automatic purchase orders or payouts are created
  - "Approved for test" means permission to test/pilot, not guaranteed purchase
  - Real orders go through normal marketplace order system
  
  ## Security
  
  - RLS policies ensure vendors only see open offers and their own applications
  - Admins have full visibility
  - Message threads are visible to relevant parties only
*/

-- Create test_product_offers table
CREATE TABLE IF NOT EXISTS test_product_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  categories text[] DEFAULT '{}',
  target_quantity integer,
  test_batch_size integer,
  budget_currency text DEFAULT 'USD',
  budget_min decimal(10,2),
  budget_max decimal(10,2),
  target_region text,
  usage_type text,
  design_reference_urls text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'DRAFT',
  locked_vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  created_by_admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (
    status IN (
      'DRAFT',
      'OPEN_FOR_VENDORS',
      'UNDER_REVIEW',
      'APPROVED_VENDOR_SELECTED',
      'TEST_IN_PROGRESS',
      'TEST_COMPLETED',
      'CANCELLED'
    )
  ),
  CONSTRAINT valid_region CHECK (
    target_region IS NULL OR target_region IN (
      'North America',
      'Europe',
      'Middle East',
      'Asia',
      'Africa',
      'South America',
      'Oceania',
      'Global'
    )
  )
);

-- Create test_product_offer_vendors table
CREATE TABLE IF NOT EXISTS test_product_offer_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES test_product_offers(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  proposal_note text,
  estimated_unit_cost decimal(10,2),
  estimated_lead_time_days integer,
  max_capacity_units integer,
  sample_image_urls text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'APPLIED',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(offer_id, vendor_id),
  CONSTRAINT valid_vendor_status CHECK (
    status IN (
      'APPLIED',
      'SHORTLISTED',
      'APPROVED_FOR_TEST',
      'REJECTED'
    )
  )
);

-- Create test_product_offer_messages table
CREATE TABLE IF NOT EXISTS test_product_offer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES test_product_offers(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  sender_vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  message text NOT NULL,
  attachment_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_sender_type CHECK (sender_type IN ('ADMIN', 'VENDOR')),
  CONSTRAINT valid_sender CHECK (
    (sender_type = 'ADMIN' AND sender_admin_id IS NOT NULL AND sender_vendor_id IS NULL) OR
    (sender_type = 'VENDOR' AND sender_vendor_id IS NOT NULL AND sender_admin_id IS NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_offers_status ON test_product_offers(status);
CREATE INDEX IF NOT EXISTS idx_test_offers_locked_vendor ON test_product_offers(locked_vendor_id);
CREATE INDEX IF NOT EXISTS idx_test_offers_created_by ON test_product_offers(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_test_offer_vendors_offer ON test_product_offer_vendors(offer_id);
CREATE INDEX IF NOT EXISTS idx_test_offer_vendors_vendor ON test_product_offer_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_test_offer_vendors_status ON test_product_offer_vendors(status);
CREATE INDEX IF NOT EXISTS idx_test_offer_messages_offer ON test_product_offer_messages(offer_id);
CREATE INDEX IF NOT EXISTS idx_test_offer_messages_created ON test_product_offer_messages(created_at);

-- Enable RLS
ALTER TABLE test_product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_product_offer_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_product_offer_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_product_offers

-- Admins can do everything
CREATE POLICY "Admins can view all test product offers"
  ON test_product_offers FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create test product offers"
  ON test_product_offers FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update test product offers"
  ON test_product_offers FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete test product offers"
  ON test_product_offers FOR DELETE
  TO authenticated
  USING (is_admin());

-- Vendors can view open offers and offers they've applied to
CREATE POLICY "Vendors can view open test product offers"
  ON test_product_offers FOR SELECT
  TO authenticated
  USING (
    status IN ('OPEN_FOR_VENDORS', 'UNDER_REVIEW') OR
    id IN (
      SELECT offer_id FROM test_product_offer_vendors
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for test_product_offer_vendors

-- Admins can view all applications
CREATE POLICY "Admins can view all vendor applications"
  ON test_product_offer_vendors FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update vendor applications"
  ON test_product_offer_vendors FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Vendors can view their own applications
CREATE POLICY "Vendors can view own applications"
  ON test_product_offer_vendors FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Vendors can create applications for open offers
CREATE POLICY "Vendors can apply to open offers"
  ON test_product_offer_vendors FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) AND
    offer_id IN (
      SELECT id FROM test_product_offers
      WHERE status = 'OPEN_FOR_VENDORS'
    )
  );

-- Vendors can update their own pending applications
CREATE POLICY "Vendors can update own pending applications"
  ON test_product_offer_vendors FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) AND
    status = 'APPLIED'
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for test_product_offer_messages

-- Admins can view all messages
CREATE POLICY "Admins can view all offer messages"
  ON test_product_offer_messages FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can send messages"
  ON test_product_offer_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin() AND
    sender_type = 'ADMIN' AND
    sender_admin_id IN (
      SELECT id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Vendors can view messages for offers they've applied to
CREATE POLICY "Vendors can view messages for their applications"
  ON test_product_offer_messages FOR SELECT
  TO authenticated
  USING (
    offer_id IN (
      SELECT offer_id FROM test_product_offer_vendors
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

-- Vendors can send messages for offers they've applied to (if not cancelled)
CREATE POLICY "Vendors can send messages for their applications"
  ON test_product_offer_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'VENDOR' AND
    sender_vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) AND
    offer_id IN (
      SELECT offer_id FROM test_product_offer_vendors
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    ) AND
    offer_id IN (
      SELECT id FROM test_product_offers WHERE status != 'CANCELLED'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_offer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_test_product_offers_updated_at ON test_product_offers;
CREATE TRIGGER update_test_product_offers_updated_at
  BEFORE UPDATE ON test_product_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_test_offer_updated_at();

DROP TRIGGER IF EXISTS update_test_product_offer_vendors_updated_at ON test_product_offer_vendors;
CREATE TRIGGER update_test_product_offer_vendors_updated_at
  BEFORE UPDATE ON test_product_offer_vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_test_offer_updated_at();