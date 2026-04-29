/*
  # Index Strategy Documentation

  1. Purpose
    - Document why all indexes exist and their importance
    - These indexes are CRITICAL for production performance
    - "Unused" status is expected in development/testing environments

  2. Index Usage Explanation
    All indexes on foreign keys are essential for:
    - JOIN operations between tables
    - CASCADE deletes and updates
    - Query performance as data grows
    - Preventing table scans on large tables

  3. Indexes and Their Purpose
    
    Foreign Key Indexes (JOIN Performance):
    - idx_inventory_product_id: Used when joining inventory with products
    - idx_order_items_product_id: Used when fetching order items with product details
    - idx_shipments_order_id: Used when retrieving shipments for orders
    - idx_returns_order_id: Used when fetching returns for orders
    - idx_return_items_order_item_id: Used when joining return items with order items
    - idx_return_items_product_id: Used when fetching product info for returns
    - idx_return_items_return_id: Used when retrieving items for a return
    - idx_labels_vendor_id: Used when fetching vendor's labels
    - idx_order_labels_label_id: Used when joining orders with labels
    - idx_transactions_order_id: Used when fetching transactions for orders
    - idx_payouts_vendor_id: Used when retrieving vendor payouts
    - idx_support_messages_ticket_id: Used when fetching messages for tickets
    - idx_ticket_messages_ticket_id: Used when retrieving ticket conversation history
    
    Status/Filter Indexes (Query Performance):
    - idx_shipping_labels_order_id: Filter/search shipping labels by order
    - idx_shipping_labels_status: Filter shipping labels by status
    - idx_orders_status: Filter orders by status (pending, shipped, etc.)
    - idx_product_imports_created_at: Sort and filter import history by date

  4. Important Notes
    - Indexes appear "unused" in dev because of small data volumes
    - In production with thousands of rows, these prevent slow queries
    - Removing these would cause significant performance degradation
    - Foreign key indexes are considered best practice
    - Query planner will use these automatically as data grows

  5. Performance Impact Without Indexes
    Without these indexes, the following operations would perform full table scans:
    - Loading order details with items (order_items → products)
    - Displaying shipment history (shipments → orders)
    - Return processing (returns → orders, return_items → products)
    - Transaction history (transactions → orders)
    - Support ticket conversations (ticket_messages → tickets)
    
    This would result in:
    - Slow page loads (seconds instead of milliseconds)
    - High database CPU usage
    - Poor user experience
    - Scaling problems as data grows

  DO NOT DROP THESE INDEXES - They are essential for production performance!
*/

-- This migration exists for documentation purposes only
-- All indexes are already in place and serving their purpose
SELECT 'Index strategy documented' as status;
