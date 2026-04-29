/*
  # User Dashboard System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `photo_url` (text, nullable)
      - `faith_tradition` (text) - Islam, Christian, Jewish, Interfaith
      - `country` (text)
      - `timezone` (text)
      - `language` (text)
      - `verified` (boolean, default false)
      - `member_tier` (text) - Free, Premium, Elite
      - `member_since` (timestamptz)
      - `loyalty_points` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_planner_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `planner_type` (text) - wedding, pilgrimage, birth, seasonal, remembrance, home-blessing
      - `planner_title` (text)
      - `total_steps` (integer)
      - `completed_steps` (integer)
      - `next_task` (text)
      - `progress_percentage` (integer)
      - `status` (text) - active, paused, completed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `order_number` (text, unique)
      - `product_name` (text)
      - `product_image` (text)
      - `artisan_name` (text)
      - `region` (text)
      - `total_amount` (decimal)
      - `status` (text) - pending, processing, in-transit, delivered, cancelled
      - `items_count` (integer)
      - `verified` (boolean)
      - `order_date` (timestamptz)
      - `delivery_date` (timestamptz, nullable)
      - `created_at` (timestamptz)

    - `user_vendor_bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `booking_type` (text) - officiant, photographer, venue, caterer, other
      - `vendor_name` (text)
      - `booking_date` (timestamptz)
      - `location` (text)
      - `status` (text) - pending, confirmed, completed, cancelled
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `notification_type` (text) - event, order, planner, system
      - `message` (text)
      - `color` (text) - emerald, blue, rose, amber, purple
      - `read` (boolean, default false)
      - `created_at` (timestamptz)

    - `sacred_calendar_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles, nullable for global events)
      - `event_name` (text)
      - `event_date` (date)
      - `event_type` (text) - islam, christian, jewish, interfaith
      - `color` (text)
      - `is_global` (boolean, default true) - global events visible to all
      - `reminder_enabled` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read/write their own data
    - Admin roles for global calendar events

  3. Indexes
    - Index on user_id for all user-specific tables
    - Index on order_date for orders
    - Index on event_date for calendar
*/

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  photo_url text,
  faith_tradition text DEFAULT 'Interfaith' CHECK (faith_tradition IN ('Islam', 'Christian', 'Jewish', 'Interfaith')),
  country text DEFAULT 'United States',
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'English',
  verified boolean DEFAULT false,
  member_tier text DEFAULT 'Free' CHECK (member_tier IN ('Free', 'Premium', 'Elite')),
  member_since timestamptz DEFAULT now(),
  loyalty_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Planner Progress
CREATE TABLE IF NOT EXISTS user_planner_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  planner_type text NOT NULL CHECK (planner_type IN ('wedding', 'pilgrimage', 'birth', 'seasonal', 'remembrance', 'home-blessing')),
  planner_title text NOT NULL,
  total_steps integer DEFAULT 10,
  completed_steps integer DEFAULT 0,
  next_task text DEFAULT '',
  progress_percentage integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_planner_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own planners"
  ON user_planner_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own planners"
  ON user_planner_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planners"
  ON user_planner_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own planners"
  ON user_planner_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Orders
CREATE TABLE IF NOT EXISTS user_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  order_number text UNIQUE NOT NULL,
  product_name text NOT NULL,
  product_image text DEFAULT '',
  artisan_name text DEFAULT '',
  region text DEFAULT '',
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'in-transit', 'delivered', 'cancelled')),
  items_count integer DEFAULT 1,
  verified boolean DEFAULT false,
  order_date timestamptz DEFAULT now(),
  delivery_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON user_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON user_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Vendor Bookings
CREATE TABLE IF NOT EXISTS user_vendor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  booking_type text NOT NULL CHECK (booking_type IN ('officiant', 'photographer', 'venue', 'caterer', 'other')),
  vendor_name text NOT NULL,
  booking_date timestamptz NOT NULL,
  location text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_vendor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON user_vendor_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON user_vendor_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON user_vendor_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON user_vendor_bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('event', 'order', 'planner', 'system')),
  message text NOT NULL,
  color text DEFAULT 'purple' CHECK (color IN ('emerald', 'blue', 'rose', 'amber', 'purple', 'teal')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON user_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sacred Calendar Events
CREATE TABLE IF NOT EXISTS sacred_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('islam', 'christian', 'jewish', 'interfaith')),
  color text DEFAULT 'purple' CHECK (color IN ('emerald', 'blue', 'rose', 'amber', 'purple', 'teal')),
  is_global boolean DEFAULT true,
  reminder_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sacred_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view global calendar events"
  ON sacred_calendar_events FOR SELECT
  TO authenticated
  USING (is_global = true OR auth.uid() = user_id);

CREATE POLICY "Users can create personal calendar events"
  ON sacred_calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_global = false);

CREATE POLICY "Users can update own calendar events"
  ON sacred_calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_global = false)
  WITH CHECK (auth.uid() = user_id AND is_global = false);

CREATE POLICY "Users can delete own calendar events"
  ON sacred_calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_global = false);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_planner_progress_user_id ON user_planner_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_planner_progress_status ON user_planner_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_orders_user_id ON user_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orders_date ON user_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_vendor_bookings_user_id ON user_vendor_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vendor_bookings_date ON user_vendor_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_sacred_calendar_events_date ON sacred_calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_sacred_calendar_events_type ON sacred_calendar_events(event_type);

-- Insert some global sacred calendar events
INSERT INTO sacred_calendar_events (event_name, event_date, event_type, color, is_global) VALUES
  ('Ramadan Begins', '2026-03-23', 'islam', 'emerald', true),
  ('Eid al-Fitr', '2026-04-21', 'islam', 'emerald', true),
  ('Easter Sunday', '2026-04-12', 'christian', 'blue', true),
  ('Christmas', '2026-12-25', 'christian', 'blue', true),
  ('Good Friday', '2026-04-10', 'christian', 'blue', true),
  ('Passover', '2026-04-11', 'jewish', 'purple', true),
  ('Hanukkah', '2026-12-14', 'jewish', 'purple', true),
  ('Rosh Hashanah', '2026-09-21', 'jewish', 'purple', true),
  ('Yom Kippur', '2026-09-30', 'jewish', 'purple', true)
ON CONFLICT DO NOTHING;
