/*
  # Add Missing Foreign Key Indexes

  1. Purpose
    - Add indexes on all foreign key columns for optimal query performance
    - Prevents table scans when joining tables

  2. Indexes Added
    - inventory(product_id)
    - labels(vendor_id)
    - order_items(product_id)
    - order_labels(label_id)
    - payouts(vendor_id)
    - return_items(order_item_id, product_id, return_id)
    - returns(order_id)
    - shipments(order_id)
    - support_messages(ticket_id)
    - transactions(order_id)
*/

-- Inventory foreign key indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- Labels foreign key indexes
CREATE INDEX IF NOT EXISTS idx_labels_vendor_id ON labels(vendor_id);

-- Order items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Order labels foreign key indexes
CREATE INDEX IF NOT EXISTS idx_order_labels_label_id ON order_labels(label_id);

-- Payouts foreign key indexes
CREATE INDEX IF NOT EXISTS idx_payouts_vendor_id ON payouts(vendor_id);

-- Return items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_return_items_order_item_id ON return_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_return_items_product_id ON return_items(product_id);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);

-- Returns foreign key indexes
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);

-- Shipments foreign key indexes
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);

-- Support messages foreign key indexes
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);

-- Transactions foreign key indexes
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
