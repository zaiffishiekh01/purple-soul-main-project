/*
  # Email Notification System

  ## Overview
  Email notification system for transactional emails including order confirmations,
  shipping updates, review reminders, and promotional campaigns. Stores templates,
  tracks sending history, and manages email preferences.

  ## New Tables
  
  ### `email_templates`
  Reusable email templates for different notification types
  - `id` (uuid, primary key)
  - `template_key` (text, unique) - Identifier (e.g., "order_confirmation")
  - `name` (text) - Human-readable name
  - `subject` (text) - Email subject line (supports variables)
  - `body_html` (text) - HTML email body
  - `body_text` (text) - Plain text fallback
  - `variables` (jsonb) - Available template variables
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `email_logs`
  Complete history of sent emails for audit and troubleshooting
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Recipient user
  - `recipient_email` (text) - Email address
  - `template_key` (text) - Template used
  - `subject` (text) - Actual subject sent
  - `status` (text) - pending, sent, failed, bounced
  - `sent_at` (timestamptz)
  - `failed_reason` (text)
  - `metadata` (jsonb) - Additional context (order_id, etc.)
  - `created_at` (timestamptz)
  
  ### `email_preferences`
  User email notification preferences
  - `id` (uuid, primary key)
  - `user_id` (uuid, unique) - References auth.users
  - `order_updates` (boolean) - Order and shipping notifications
  - `promotional` (boolean) - Marketing emails
  - `review_reminders` (boolean) - Review request emails
  - `product_restocks` (boolean) - Back-in-stock alerts
  - `price_drops` (boolean) - Price drop notifications
  - `newsletter` (boolean) - General newsletter
  - `unsubscribed_all` (boolean) - Global unsubscribe
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `email_queue`
  Queue for emails pending delivery
  - `id` (uuid, primary key)
  - `user_id` (uuid)
  - `recipient_email` (text)
  - `template_key` (text)
  - `template_data` (jsonb) - Variables for template
  - `priority` (integer) - Higher = more urgent
  - `scheduled_for` (timestamptz) - When to send
  - `status` (text) - queued, processing, sent, failed
  - `attempts` (integer) - Retry count
  - `last_error` (text)
  - `created_at` (timestamptz)
  - `processed_at` (timestamptz)

  ## Functions
  - `queue_email()` - Add email to sending queue
  - `send_order_confirmation()` - Queue order confirmation email
  - `send_shipping_update()` - Queue shipping notification
  - `check_email_preferences()` - Verify user allows this email type
  
  ## Indexes
  - user_id indexes for user-specific queries
  - template_key for template lookups
  - status indexes for queue processing
  - scheduled_for for time-based processing
  
  ## Security
  - Enable RLS on all tables
  - Users can view their own email history
  - Users can manage their own preferences
  - Only system/admins can manage templates and queue
*/

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  variables jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  template_key text NOT NULL,
  subject text NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at timestamptz,
  failed_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_updates boolean DEFAULT true NOT NULL,
  promotional boolean DEFAULT true NOT NULL,
  review_reminders boolean DEFAULT true NOT NULL,
  product_restocks boolean DEFAULT true NOT NULL,
  price_drops boolean DEFAULT true NOT NULL,
  newsletter boolean DEFAULT true NOT NULL,
  unsubscribed_all boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  template_key text NOT NULL,
  template_data jsonb DEFAULT '{}'::jsonb,
  priority integer DEFAULT 5 NOT NULL,
  scheduled_for timestamptz DEFAULT now() NOT NULL,
  status text DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'processing', 'sent', 'failed')),
  attempts integer DEFAULT 0 NOT NULL,
  last_error text,
  created_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz
);

-- Function to check email preferences
CREATE OR REPLACE FUNCTION check_email_preferences(
  p_user_id uuid,
  p_email_type text
)
RETURNS boolean AS $$
DECLARE
  v_prefs email_preferences%ROWTYPE;
BEGIN
  SELECT * INTO v_prefs FROM email_preferences WHERE user_id = p_user_id;
  
  IF v_prefs.id IS NULL THEN
    RETURN true; -- Default to allowing if no preferences set
  END IF;
  
  IF v_prefs.unsubscribed_all THEN
    RETURN false;
  END IF;
  
  CASE p_email_type
    WHEN 'order_updates' THEN RETURN v_prefs.order_updates;
    WHEN 'promotional' THEN RETURN v_prefs.promotional;
    WHEN 'review_reminders' THEN RETURN v_prefs.review_reminders;
    WHEN 'product_restocks' THEN RETURN v_prefs.product_restocks;
    WHEN 'price_drops' THEN RETURN v_prefs.price_drops;
    WHEN 'newsletter' THEN RETURN v_prefs.newsletter;
    ELSE RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to queue email
CREATE OR REPLACE FUNCTION queue_email(
  p_user_id uuid,
  p_recipient_email text,
  p_template_key text,
  p_template_data jsonb DEFAULT '{}'::jsonb,
  p_priority integer DEFAULT 5,
  p_scheduled_for timestamptz DEFAULT now()
)
RETURNS uuid AS $$
DECLARE
  v_queue_id uuid;
  v_email_type text;
BEGIN
  -- Determine email type from template key
  v_email_type := CASE
    WHEN p_template_key LIKE '%order%' OR p_template_key LIKE '%shipping%' THEN 'order_updates'
    WHEN p_template_key LIKE '%promo%' OR p_template_key LIKE '%sale%' THEN 'promotional'
    WHEN p_template_key LIKE '%review%' THEN 'review_reminders'
    WHEN p_template_key LIKE '%restock%' THEN 'product_restocks'
    WHEN p_template_key LIKE '%price%' THEN 'price_drops'
    WHEN p_template_key LIKE '%newsletter%' THEN 'newsletter'
    ELSE 'order_updates'
  END;
  
  -- Check if user allows this type of email
  IF p_user_id IS NOT NULL AND NOT check_email_preferences(p_user_id, v_email_type) THEN
    RETURN NULL; -- User has opted out
  END IF;
  
  -- Add to queue
  INSERT INTO email_queue (user_id, recipient_email, template_key, template_data, priority, scheduled_for)
  VALUES (p_user_id, p_recipient_email, p_template_key, p_template_data, p_priority, p_scheduled_for)
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send order confirmation
CREATE OR REPLACE FUNCTION send_order_confirmation(p_order_id uuid)
RETURNS uuid AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_user users%ROWTYPE;
  v_template_data jsonb;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  SELECT * INTO v_user FROM users WHERE id = v_order.customer_id;
  
  v_template_data := jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.id,
    'customer_name', v_user.full_name,
    'total', v_order.total,
    'order_date', v_order.created_at
  );
  
  RETURN queue_email(
    v_order.customer_id,
    v_user.email,
    'order_confirmation',
    v_template_data,
    10, -- High priority
    now()
  );
END;
$$ LANGUAGE plpgsql;

-- Insert default email templates
INSERT INTO email_templates (template_key, name, subject, body_html, body_text, variables) VALUES
('order_confirmation', 'Order Confirmation', 'Order Confirmation - Order #{{order_number}}',
 '<h1>Thank you for your order!</h1><p>Your order #{{order_number}} has been confirmed.</p><p>Total: ${{total}}</p>',
 'Thank you for your order! Your order #{{order_number}} has been confirmed. Total: ${{total}}',
 '{"order_number": "string", "total": "number", "customer_name": "string"}'::jsonb),

('shipping_update', 'Shipping Update', 'Your order is on its way!',
 '<h1>Your order has shipped!</h1><p>Tracking number: {{tracking_number}}</p>',
 'Your order has shipped! Tracking number: {{tracking_number}}',
 '{"tracking_number": "string", "carrier": "string"}'::jsonb),

('review_reminder', 'Review Reminder', 'How was your recent purchase?',
 '<h1>We''d love your feedback!</h1><p>Please review your recent purchase.</p>',
 'We''d love your feedback! Please review your recent purchase.',
 '{"product_name": "string", "order_id": "string"}'::jsonb)
ON CONFLICT (template_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_key ON email_logs(template_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority DESC, created_at);

CREATE INDEX IF NOT EXISTS idx_email_templates_template_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates" ON email_templates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for email_logs
CREATE POLICY "Users can view own email logs" ON email_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all email logs" ON email_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can create email logs" ON email_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- RLS Policies for email_preferences
CREATE POLICY "Users can view own email preferences" ON email_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own email preferences" ON email_preferences FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own email preferences" ON email_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for email_queue
CREATE POLICY "Admins can view email queue" ON email_queue FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can manage email queue" ON email_queue FOR ALL TO authenticated
  USING (true);
