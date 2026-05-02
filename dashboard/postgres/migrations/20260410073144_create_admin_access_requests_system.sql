/*
  # Create Admin Access Requests System

  ## Summary
  This migration creates the admin_access_requests table which allows people
  to request admin access through the admin portal login page. Super admins can
  then review, approve, or reject these requests from the Admin Management panel.

  ## New Tables
  - `admin_access_requests`
    - `id` (uuid, primary key)
    - `email` (text) - requested email for admin account
    - `full_name` (text) - requester's full name
    - `reason` (text) - reason for needing admin access
    - `status` (text) - pending | approved | rejected
    - `reviewed_by` (uuid, nullable) - admin who reviewed the request
    - `reviewed_at` (timestamptz, nullable) - when reviewed
    - `notes` (text, nullable) - admin notes on the request
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Anyone can INSERT a new request (public access for submission)
  - Only admins can SELECT and UPDATE requests

  ## Notes
  - Requests are submitted from the public admin login page before any authentication
  - Super admins review and can then create the admin account via Admin Management
*/

CREATE TABLE IF NOT EXISTS admin_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_access_requests_status ON admin_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_access_requests_email ON admin_access_requests(email);

ALTER TABLE admin_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an admin access request"
  ON admin_access_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all access requests"
  ON admin_access_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update access requests"
  ON admin_access_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );
