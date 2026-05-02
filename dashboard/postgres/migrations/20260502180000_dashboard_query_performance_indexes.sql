-- Composite indexes aligned with dashboard relational reads:
-- WHERE vendor_id = … ORDER BY created_at / updated_at DESC, and admin status filters.
-- Uses CREATE INDEX (not CONCURRENTLY) so migrations stay compatible with transactional apply script.

CREATE INDEX IF NOT EXISTS idx_orders_vendor_created_at ON orders (vendor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_vendor_created_at ON transactions (vendor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_vendor_created_at ON products (vendor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_returns_vendor_created_at ON returns (vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_status_created_at ON returns (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_vendor_updated_at ON inventory (vendor_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_shipments_vendor_created_at ON shipments (vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_status_created_at ON shipments (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shipping_labels_carrier_created_at ON shipping_labels (carrier, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_returns_requested_at ON returns (requested_at DESC);
