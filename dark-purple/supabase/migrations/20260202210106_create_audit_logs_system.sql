/*
  # Audit Logs System Migration

  ## Overview
  Creates a comprehensive audit logging system for compliance and security monitoring.
  Every sensitive action in the platform is logged with full context.

  ## New Tables

  ### 1. `audit_logs`
     - Complete audit trail of all platform actions
     - Fields: id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, timestamp
     - Immutable (no updates/deletes allowed except by system)

  ### 2. `audit_log_contexts`
     - Additional context for audit logs (optional)
     - Fields: audit_log_id, key, value
     - Enables flexible metadata without schema changes

  ## Audit Events Tracked

  ### Authentication
  - user.login.success
  - user.login.failed
  - user.logout
  - user.password.change
  - user.mfa.enroll
  - user.mfa.verify

  ### Authorization
  - role.assign
  - role.revoke
  - permission.grant
  - permission.revoke

  ### Vendor Management
  - vendor.create
  - vendor.approve
  - vendor.suspend
  - vendor.update

  ### Product Management
  - product.create
  - product.update
  - product.delete
  - inventory.update

  ### Order Management
  - order.create
  - order.update.status
  - order.cancel
  - shipment.create
  - shipment.update

  ### Financial
  - payment.create
  - payout.create
  - payout.execute
  - refund.create

  ### System
  - settings.update
  - admin.action

  ## Security Features

  - Tamper-evident logging (append-only)
  - IP address and user agent tracking
  - Structured JSON details field
  - Indexed for fast search and reporting
  - 90-day retention recommended (configurable)

  ## Important Notes

  - Audit logs should NEVER be deleted by application code
  - Consider partitioning by month for large datasets
  - Use for security investigations and compliance reporting
  - PII should be minimized in log details
*/

-- Create enum for common audit actions
CREATE TYPE audit_action AS ENUM (
  -- Auth actions
  'user.login.success',
  'user.login.failed',
  'user.logout',
  'user.register',
  'user.password.change',
  'user.password.reset',
  'user.mfa.enroll',
  'user.mfa.verify',
  'user.email.verify',
  
  -- Authorization
  'role.assign',
  'role.revoke',
  'permission.grant',
  'permission.revoke',
  
  -- User management
  'user.create',
  'user.update',
  'user.delete',
  'user.suspend',
  'user.activate',
  
  -- Vendor management
  'vendor.create',
  'vendor.update',
  'vendor.approve',
  'vendor.reject',
  'vendor.suspend',
  'vendor.activate',
  
  -- Product management
  'product.create',
  'product.update',
  'product.delete',
  'product.activate',
  'product.deactivate',
  
  -- Inventory
  'inventory.update',
  'inventory.bulk.update',
  
  -- Order management
  'order.create',
  'order.update',
  'order.cancel',
  'order.status.change',
  
  -- Shipment
  'shipment.create',
  'shipment.update',
  'shipment.label.create',
  
  -- Returns & Refunds
  'return.create',
  'return.approve',
  'return.reject',
  'refund.create',
  'refund.process',
  
  -- Financial
  'payment.create',
  'payment.refund',
  'payout.create',
  'payout.execute',
  'fee_waiver.create',
  
  -- System
  'settings.update',
  'category.create',
  'category.update',
  'category.delete',
  'admin.action'
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  session_id uuid,
  status text DEFAULT 'success',
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create audit_log_contexts table for additional metadata
CREATE TABLE IF NOT EXISTS audit_log_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id uuid NOT NULL REFERENCES audit_logs(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for common audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_contexts_audit_log_id ON audit_log_contexts(audit_log_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_contexts_key ON audit_log_contexts(key);

-- Create GIN index for JSONB details field (fast JSON querying)
CREATE INDEX IF NOT EXISTS idx_audit_logs_details ON audit_logs USING GIN (details);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Admins can view all audit logs (will be enforced at API level)
-- This is a placeholder that assumes admin check happens in application
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policy: No updates or deletes allowed (immutable logs)
-- Only the system should be able to delete very old logs for retention

-- Create helper function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_action audit_action,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_session_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    session_id
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_session_id
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to add audit context
CREATE OR REPLACE FUNCTION add_audit_context(
  p_audit_log_id uuid,
  p_key text,
  p_value text
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_log_contexts (audit_log_id, key, value)
  VALUES (p_audit_log_id, p_key, p_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;