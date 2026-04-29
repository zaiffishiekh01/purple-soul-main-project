/*
  # Product Approval Workflow & Vendor Auto-Approve

  ## Summary
  1. Add `approval_status` to products (pending_review | approved | rejected | deactivated)
  2. Add `deactivation_reason` column to products (admin fills this when deactivating)
  3. Add `approved_by` and `approved_at` to products for audit trail
  4. Add `rejection_reason` to products
  5. Add `auto_approve_products` boolean to vendors (admin sets per vendor)
  6. Ensure default product status remains 'draft' and approval_status = 'pending_review'

  ## New Columns
  - products.approval_status: workflow state controlled by admin
  - products.deactivation_reason: reason shown to vendor when admin deactivates
  - products.approved_by: uuid of admin who approved
  - products.approved_at: timestamp of approval
  - products.rejection_reason: reason shown to vendor when rejected
  - vendors.auto_approve_products: admin toggle to auto-approve that vendor's products
*/

-- Add approval workflow columns to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE products ADD COLUMN approval_status text NOT NULL DEFAULT 'pending_review'
      CHECK (approval_status IN ('pending_review', 'approved', 'rejected', 'deactivated'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'deactivation_reason'
  ) THEN
    ALTER TABLE products ADD COLUMN deactivation_reason text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE products ADD COLUMN rejection_reason text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE products ADD COLUMN approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE products ADD COLUMN approved_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Add auto_approve_products to vendors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'auto_approve_products'
  ) THEN
    ALTER TABLE vendors ADD COLUMN auto_approve_products boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Backfill existing active products as approved
UPDATE products
SET approval_status = 'approved',
    approved_at = updated_at
WHERE status = 'active' AND approval_status = 'pending_review';

-- Backfill draft products as pending_review (already default, but be explicit)
UPDATE products
SET approval_status = 'pending_review'
WHERE status = 'draft' AND approval_status = 'pending_review';

-- Index for fast admin approval queue queries
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON products(approval_status);
CREATE INDEX IF NOT EXISTS idx_products_vendor_approval ON products(vendor_id, approval_status);
