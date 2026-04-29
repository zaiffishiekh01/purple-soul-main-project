/*
  # Complete Customer Account System Tables

  ## Overview
  Adds remaining tables that were missing from the previous migration:
  - saved_items
  - order_shipment_items
  - order_documents
  - return_request_items (references return_requests.user_id, not customer_id)
  - order_gift_options
  - user_activity_log

  All tables have RLS enabled with appropriate policies.
*/

-- Saved for Later
CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  notes text,
  saved_at timestamptz DEFAULT now()
);

-- Order Shipment Items
CREATE TABLE IF NOT EXISTS order_shipment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES order_shipments(id) ON DELETE CASCADE NOT NULL,
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL
);

-- Order Documents
CREATE TABLE IF NOT EXISTS order_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  generated_at timestamptz DEFAULT now()
);

-- Return Request Items
CREATE TABLE IF NOT EXISTS return_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_request_id uuid REFERENCES return_requests(id) ON DELETE CASCADE NOT NULL,
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL
);

-- Gift Options (separate from order_gift_options already in orders table)
CREATE TABLE IF NOT EXISTS order_gift_options (
  order_id uuid PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  is_gift boolean DEFAULT false,
  recipient_id uuid REFERENCES recipients(id),
  gift_wrap_style text,
  gift_message text,
  hide_prices boolean DEFAULT false,
  delivery_date_preference date,
  greeting_card boolean DEFAULT false,
  special_packaging text
);

-- Activity Log
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  ip_address text,
  user_agent text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_order_shipment_items_shipment_id ON order_shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_order_documents_order_id ON order_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_return_request_items_return_request_id ON return_request_items(return_request_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);

-- Enable RLS
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_gift_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Saved Items
CREATE POLICY "Users can manage own saved items"
  ON saved_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies: Order Shipment Items
CREATE POLICY "Users can view shipment items for own orders"
  ON order_shipment_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_shipments
      JOIN orders ON orders.id = order_shipments.order_id
      WHERE order_shipments.id = order_shipment_items.shipment_id
      AND orders.customer_id = auth.uid()
    )
  );

-- RLS Policies: Order Documents
CREATE POLICY "Users can view documents for own orders"
  ON order_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_documents.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- RLS Policies: Return Request Items
CREATE POLICY "Users can view own return request items"
  ON return_request_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM return_requests
      WHERE return_requests.id = return_request_items.return_request_id
      AND return_requests.user_id = auth.uid()
    )
  );

-- RLS Policies: Order Gift Options
CREATE POLICY "Users can view gift options for own orders"
  ON order_gift_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_gift_options.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage gift options for own orders"
  ON order_gift_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_gift_options.order_id
      AND orders.customer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_gift_options.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- RLS Policies: Activity Log
CREATE POLICY "Users can view own activity log"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
