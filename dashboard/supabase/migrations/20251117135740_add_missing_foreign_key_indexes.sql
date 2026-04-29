/*
  # Add Missing Foreign Key Indexes

  1. Problem
    - Multiple foreign key columns lack indexes
    - This causes suboptimal query performance on JOIN operations
    - Foreign keys without indexes can lead to table locks during updates

  2. Solution
    - Add indexes for all unindexed foreign key columns
    - Improves query performance for JOINs and lookups
    - Prevents potential locking issues

  3. Tables Affected
    - fee_waiver_requests
    - platform_settings
    - regional_price_rules
    - stripe_payment_intents
    - test_product_offer_messages
    - transactions
    - warehouse_requests
*/

-- Fee waiver requests - reviewed_by_admin_id
CREATE INDEX IF NOT EXISTS idx_fee_waiver_requests_reviewed_by_admin_id 
ON fee_waiver_requests(reviewed_by_admin_id);

-- Platform settings - updated_by
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by 
ON platform_settings(updated_by);

-- Regional price rules - created_by
CREATE INDEX IF NOT EXISTS idx_regional_price_rules_created_by 
ON regional_price_rules(created_by);

-- Stripe payment intents - customer_id
CREATE INDEX IF NOT EXISTS idx_stripe_payment_intents_customer_id 
ON stripe_payment_intents(customer_id);

-- Test product offer messages - sender IDs
CREATE INDEX IF NOT EXISTS idx_test_product_offer_messages_sender_admin_id 
ON test_product_offer_messages(sender_admin_id);

CREATE INDEX IF NOT EXISTS idx_test_product_offer_messages_sender_vendor_id 
ON test_product_offer_messages(sender_vendor_id);

-- Transactions - payout_request_id
CREATE INDEX IF NOT EXISTS idx_transactions_payout_request_id 
ON transactions(payout_request_id);

-- Warehouse requests - reviewed_by_admin_id
CREATE INDEX IF NOT EXISTS idx_warehouse_requests_reviewed_by_admin_id 
ON warehouse_requests(reviewed_by_admin_id);