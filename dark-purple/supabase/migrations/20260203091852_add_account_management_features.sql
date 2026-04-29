/*
  # Account Management Features - Returns, Refunds, Subscriptions, and Notifications

  1. Modify Existing Tables
    - `returns` - Add missing columns for new return flow
    - `refunds` - Add customer_id and other missing columns

  2. New Tables
    - `subscriptions` - Digital content subscriptions
    - `notification_preferences` - User notification settings

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Add missing columns to returns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'returns' AND column_name = 'return_number'
  ) THEN
    ALTER TABLE returns ADD COLUMN return_number text UNIQUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'returns' AND column_name = 'item_condition'
  ) THEN
    ALTER TABLE returns ADD COLUMN item_condition text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'returns' AND column_name = 'refund_preference'
  ) THEN
    ALTER TABLE returns ADD COLUMN refund_preference text DEFAULT 'original';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'returns' AND column_name = 'additional_notes'
  ) THEN
    ALTER TABLE returns ADD COLUMN additional_notes text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'returns' AND column_name = 'return_amount'
  ) THEN
    ALTER TABLE returns ADD COLUMN return_amount decimal(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Add missing columns to refunds table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'refunds' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE refunds ADD COLUMN customer_id uuid;
    UPDATE refunds SET customer_id = (SELECT customer_id FROM orders WHERE orders.id = refunds.order_id) WHERE customer_id IS NULL;
    ALTER TABLE refunds ALTER COLUMN customer_id SET NOT NULL;
    ALTER TABLE refunds ADD CONSTRAINT refunds_customer_id_fkey 
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'refunds' AND column_name = 'refund_number'
  ) THEN
    ALTER TABLE refunds ADD COLUMN refund_number text UNIQUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'refunds' AND column_name = 'refund_amount'
  ) THEN
    ALTER TABLE refunds ADD COLUMN refund_amount decimal(10, 2) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'refunds' AND column_name = 'refund_method'
  ) THEN
    ALTER TABLE refunds ADD COLUMN refund_method text DEFAULT 'original';
  END IF;
END $$;

-- Add RLS policies for returns
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'returns' AND policyname = 'Users can view own returns'
  ) THEN
    CREATE POLICY "Users can view own returns"
      ON returns FOR SELECT
      TO authenticated
      USING (auth.uid() = customer_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'returns' AND policyname = 'Users can create own returns'
  ) THEN
    CREATE POLICY "Users can create own returns"
      ON returns FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = customer_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'returns' AND policyname = 'Users can update own returns'
  ) THEN
    CREATE POLICY "Users can update own returns"
      ON returns FOR UPDATE
      TO authenticated
      USING (auth.uid() = customer_id)
      WITH CHECK (auth.uid() = customer_id);
  END IF;
END $$;

-- Add RLS policies for refunds
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'refunds' AND policyname = 'Users can view own refunds'
  ) THEN
    CREATE POLICY "Users can view own refunds"
      ON refunds FOR SELECT
      TO authenticated
      USING (auth.uid() = customer_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_refunds_customer ON refunds(customer_id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  plan_type text NOT NULL,
  price decimal(10, 2) NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  payment_method text,
  next_billing_date timestamptz,
  started_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscriptions'
  ) THEN
    CREATE POLICY "Users can view own subscriptions"
      ON subscriptions FOR SELECT
      TO authenticated
      USING (auth.uid() = customer_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can create own subscriptions'
  ) THEN
    CREATE POLICY "Users can create own subscriptions"
      ON subscriptions FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = customer_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscriptions'
  ) THEN
    CREATE POLICY "Users can update own subscriptions"
      ON subscriptions FOR UPDATE
      TO authenticated
      USING (auth.uid() = customer_id)
      WITH CHECK (auth.uid() = customer_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  order_placed boolean DEFAULT true,
  order_shipped boolean DEFAULT true,
  order_delivered boolean DEFAULT true,
  return_status boolean DEFAULT true,
  wishlist_back_in_stock boolean DEFAULT true,
  price_drop boolean DEFAULT false,
  support_ticket_updates boolean DEFAULT true,
  system_notifications boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  in_app_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users can view own notification preferences'
  ) THEN
    CREATE POLICY "Users can view own notification preferences"
      ON notification_preferences FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users can insert own notification preferences'
  ) THEN
    CREATE POLICY "Users can insert own notification preferences"
      ON notification_preferences FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users can update own notification preferences'
  ) THEN
    CREATE POLICY "Users can update own notification preferences"
      ON notification_preferences FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_notification_preferences_updated_at
      BEFORE UPDATE ON notification_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
