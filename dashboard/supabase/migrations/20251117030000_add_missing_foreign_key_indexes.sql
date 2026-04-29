/*
  # Add Missing Foreign Key Indexes

  1. Security & Performance
    - Add indexes for foreign keys without covering indexes
    - Improves query performance for JOIN operations
    - Prevents performance degradation at scale

  2. Changes
    - Add index on payout_requests.processed_by
    - Add index on platform_fees.created_by
    - Add index on product_guidelines.updated_by
    - Add index on vendors.approved_by
*/

-- Add index for payout_requests.processed_by foreign key
CREATE INDEX IF NOT EXISTS idx_payout_requests_processed_by
ON payout_requests(processed_by);

-- Add index for platform_fees.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_platform_fees_created_by
ON platform_fees(created_by);

-- Add index for product_guidelines.updated_by foreign key
CREATE INDEX IF NOT EXISTS idx_product_guidelines_updated_by
ON product_guidelines(updated_by);

-- Add index for vendors.approved_by foreign key
CREATE INDEX IF NOT EXISTS idx_vendors_approved_by
ON vendors(approved_by);
