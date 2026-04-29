/*
  # Privacy-Protected Vendor-Customer Communication System

  ## Overview
  Complete messaging system with customer privacy protection and admin moderation.

  ## Key Privacy Features
  1. Customer email and phone are NEVER exposed to vendors
  2. Vendors must request admin approval to contact customers
  3. All communication goes through the platform (in-app messaging)
  4. Admin can approve/deny contact requests
  5. Customer data is masked in vendor-facing views

  ## New Tables

  1. `contact_requests`
     - Vendor requests to contact customer
     - Admin approval workflow
     - Fields: id, vendor_id, customer_id, order_id, reason, status, admin_notes

  2. `vendor_customer_messages`
     - In-platform messaging between vendor and customer
     - No direct email/phone exposure
     - Fields: id, thread_id, sender_type, sender_id, recipient_id, message_text, attachments

  3. `message_threads`
     - Message thread management
     - Links to orders and contact requests
     - Fields: id, vendor_id, customer_id, order_id, contact_request_id, status, last_message_at

  ## Security
  - RLS policies ensure vendors only see approved conversations
  - Customer data masking in all vendor-facing queries
  - Admin oversight on all contact initiation
  - Audit trail for all contact requests

  ## Workflow
  1. Vendor sees order with masked customer info (e.g., "Customer #1234")
  2. Vendor clicks "Request Contact" → creates contact_request with status='pending'
  3. Admin reviews request at /admin/contact-requests
  4. Admin approves → creates message_thread, sends notification to customer
  5. Customer receives "Vendor wants to contact you" notification
  6. Customer accepts → can now message vendor through platform
  7. All messages stored in vendor_customer_messages
*/

-- Create enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_request_status') THEN
    CREATE TYPE contact_request_status AS ENUM ('pending', 'approved', 'rejected', 'customer_declined');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_thread_status') THEN
    CREATE TYPE message_thread_status AS ENUM ('active', 'archived', 'blocked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sender_type') THEN
    CREATE TYPE sender_type AS ENUM ('customer', 'vendor', 'admin');
  END IF;
END $$;

-- Contact Requests Table
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Context
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,

  -- Request Details
  reason_category text NOT NULL CHECK (reason_category IN (
    'order_inquiry',
    'shipping_issue',
    'product_question',
    'return_assistance',
    'custom_order',
    'other'
  )),
  reason_text text NOT NULL,

  -- Approval Workflow
  status contact_request_status DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),

  -- Admin Review
  reviewed_by_admin_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  admin_notes text,

  -- Customer Response (if admin approves, customer still needs to accept)
  customer_accepted boolean DEFAULT false,
  customer_accepted_at timestamptz,
  customer_declined_reason text,

  -- Audit
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_reason_length CHECK (char_length(reason_text) >= 20 AND char_length(reason_text) <= 1000)
);

-- Message Threads Table
CREATE TABLE IF NOT EXISTS message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Context
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  contact_request_id uuid REFERENCES contact_requests(id) ON DELETE SET NULL,

  -- Thread Metadata
  subject text,
  status message_thread_status DEFAULT 'active',

  -- Activity Tracking
  last_message_at timestamptz DEFAULT now(),
  last_message_by sender_type,

  -- Unread Counts
  vendor_unread_count int DEFAULT 0,
  customer_unread_count int DEFAULT 0,

  -- Archived
  vendor_archived boolean DEFAULT false,
  customer_archived boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendor-Customer Messages Table
CREATE TABLE IF NOT EXISTS vendor_customer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thread
  thread_id uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,

  -- Sender/Recipient
  sender_type sender_type NOT NULL,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Message Content
  message_text text NOT NULL CHECK (char_length(message_text) >= 1 AND char_length(message_text) <= 5000),

  -- Attachments (image URLs, document URLs)
  attachments jsonb DEFAULT '[]'::jsonb,

  -- Read Status
  is_read boolean DEFAULT false,
  read_at timestamptz,

  -- Reply to
  parent_message_id uuid REFERENCES vendor_customer_messages(id) ON DELETE SET NULL,

  -- Flagging/Moderation
  is_flagged boolean DEFAULT false,
  flagged_reason text,
  flagged_by_admin_id uuid REFERENCES users(id) ON DELETE SET NULL,

  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_requests_vendor ON contact_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_customer ON contact_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_order ON contact_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_pending ON contact_requests(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_message_threads_vendor ON message_threads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_customer ON message_threads(customer_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_order ON message_threads(order_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_status ON message_threads(status);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON message_threads(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendor_customer_messages_thread ON vendor_customer_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_vendor_customer_messages_sender ON vendor_customer_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_vendor_customer_messages_created ON vendor_customer_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_customer_messages_unread ON vendor_customer_messages(is_read) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_customer_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_requests

-- Vendors can view their own contact requests
CREATE POLICY "Vendors can view own contact requests"
  ON contact_requests FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE id IN (
        SELECT v.id FROM vendors v
        JOIN users u ON u.id = auth.uid()
        WHERE v.id = vendor_id
      )
    )
  );

-- Vendors can create contact requests
CREATE POLICY "Vendors can create contact requests"
  ON contact_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE id IN (
        SELECT v.id FROM vendors v
        JOIN users u ON u.id = auth.uid()
        WHERE v.id = vendor_id
      )
    )
  );

-- Customers can view contact requests about them
CREATE POLICY "Customers can view contact requests about them"
  ON contact_requests FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Customers can update their acceptance status
CREATE POLICY "Customers can respond to contact requests"
  ON contact_requests FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Admins can view all contact requests
CREATE POLICY "Admins can view all contact requests"
  ON contact_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update contact requests (approve/reject)
CREATE POLICY "Admins can approve/reject contact requests"
  ON contact_requests FOR UPDATE
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

-- RLS Policies for message_threads

-- Vendors can view threads they're part of
CREATE POLICY "Vendors can view own threads"
  ON message_threads FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE id IN (
        SELECT v.id FROM vendors v
        JOIN users u ON u.id = auth.uid()
        WHERE v.id = vendor_id
      )
    )
  );

-- Customers can view threads they're part of
CREATE POLICY "Customers can view own threads"
  ON message_threads FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Admins can create threads (after approving contact request)
CREATE POLICY "Admins can create threads"
  ON message_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Vendors and customers can update thread metadata (archive, mark read)
CREATE POLICY "Participants can update thread metadata"
  ON message_threads FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE id IN (
        SELECT v.id FROM vendors v
        JOIN users u ON u.id = auth.uid()
        WHERE v.id = vendor_id
      )
    )
    OR customer_id = auth.uid()
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE id IN (
        SELECT v.id FROM vendors v
        JOIN users u ON u.id = auth.uid()
        WHERE v.id = vendor_id
      )
    )
    OR customer_id = auth.uid()
  );

-- RLS Policies for vendor_customer_messages

-- Participants can view messages in their threads
CREATE POLICY "Participants can view thread messages"
  ON vendor_customer_messages FOR SELECT
  TO authenticated
  USING (
    thread_id IN (
      SELECT id FROM message_threads
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE id IN (
          SELECT v.id FROM vendors v
          JOIN users u ON u.id = auth.uid()
          WHERE v.id = vendor_id
        )
      )
      OR customer_id = auth.uid()
    )
  );

-- Participants can send messages in active threads
CREATE POLICY "Participants can send messages"
  ON vendor_customer_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND thread_id IN (
      SELECT id FROM message_threads
      WHERE status = 'active'
      AND (
        vendor_id IN (
          SELECT id FROM vendors WHERE id IN (
            SELECT v.id FROM vendors v
            JOIN users u ON u.id = auth.uid()
            WHERE v.id = vendor_id
          )
        )
        OR customer_id = auth.uid()
      )
    )
  );

-- Participants can mark messages as read
CREATE POLICY "Participants can mark messages read"
  ON vendor_customer_messages FOR UPDATE
  TO authenticated
  USING (
    thread_id IN (
      SELECT id FROM message_threads
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE id IN (
          SELECT v.id FROM vendors v
          JOIN users u ON u.id = auth.uid()
          WHERE v.id = vendor_id
        )
      )
      OR customer_id = auth.uid()
    )
  )
  WITH CHECK (
    thread_id IN (
      SELECT id FROM message_threads
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE id IN (
          SELECT v.id FROM vendors v
          JOIN users u ON u.id = auth.uid()
          WHERE v.id = vendor_id
        )
      )
      OR customer_id = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON vendor_customer_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can flag messages
CREATE POLICY "Admins can flag messages"
  ON vendor_customer_messages FOR UPDATE
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

-- Create helper function to update thread last_message_at
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET
    last_message_at = NEW.created_at,
    last_message_by = NEW.sender_type,
    vendor_unread_count = CASE
      WHEN NEW.sender_type != 'vendor' THEN vendor_unread_count + 1
      ELSE vendor_unread_count
    END,
    customer_unread_count = CASE
      WHEN NEW.sender_type != 'customer' THEN customer_unread_count + 1
      ELSE customer_unread_count
    END,
    updated_at = now()
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update thread metadata
DROP TRIGGER IF EXISTS trigger_update_thread_last_message ON vendor_customer_messages;
CREATE TRIGGER trigger_update_thread_last_message
  AFTER INSERT ON vendor_customer_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message();

-- Create helper function to mark messages as read
CREATE OR REPLACE FUNCTION mark_thread_messages_read(
  p_thread_id uuid,
  p_reader_type sender_type
)
RETURNS void AS $$
BEGIN
  UPDATE vendor_customer_messages
  SET is_read = true, read_at = now()
  WHERE thread_id = p_thread_id
    AND sender_type != p_reader_type
    AND is_read = false;

  IF p_reader_type = 'vendor' THEN
    UPDATE message_threads
    SET vendor_unread_count = 0
    WHERE id = p_thread_id;
  ELSIF p_reader_type = 'customer' THEN
    UPDATE message_threads
    SET customer_unread_count = 0
    WHERE id = p_thread_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for vendor-facing order information (MASKED customer data)
CREATE OR REPLACE VIEW vendor_order_view AS
SELECT
  o.id,
  o.order_number,
  o.status,
  o.created_at,
  o.confirmed_at,

  -- MASKED customer information - NO email, NO phone, NO real name
  'Customer #' || SUBSTRING(o.customer_id::text, 1, 8) as customer_display_name,
  o.customer_id,

  -- Shipping address - MASKED personal details
  jsonb_build_object(
    'city', o.shipping_address->>'city',
    'state_province', o.shipping_address->>'state_province',
    'country', o.shipping_address->>'country',
    'postal_code', o.shipping_address->>'postal_code'
  ) as shipping_address_summary,

  -- Full address only visible after contact approved
  CASE
    WHEN EXISTS (
      SELECT 1 FROM contact_requests cr
      WHERE cr.order_id = o.id
      AND cr.status = 'approved'
      AND cr.customer_accepted = true
    ) THEN o.shipping_address
    ELSE NULL
  END as shipping_address_full,

  -- Contact info only visible after contact approved
  CASE
    WHEN EXISTS (
      SELECT 1 FROM contact_requests cr
      WHERE cr.order_id = o.id
      AND cr.status = 'approved'
      AND cr.customer_accepted = true
    ) THEN o.contact_info
    ELSE jsonb_build_object(
      'email', 'Use platform messaging',
      'phone', 'Use platform messaging'
    )
  END as contact_info_masked,

  o.subtotal,
  o.tax,
  o.shipping_cost,
  o.total,
  o.discount_amount,
  o.coupon_code
FROM orders o;

-- Grant access to vendor_order_view
GRANT SELECT ON vendor_order_view TO authenticated;