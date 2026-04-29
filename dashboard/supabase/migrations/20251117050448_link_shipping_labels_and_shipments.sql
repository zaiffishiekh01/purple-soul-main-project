/*
  # Link Shipping Labels and Shipments

  ## Overview
  This migration creates a relationship between shipping_labels and shipments tables
  to enable automatic shipment tracking when labels are created.

  ## Changes

  1. **Schema Modifications**
    - Add `shipping_label_id` column to `shipments` table
    - Add foreign key constraint from shipments to shipping_labels
    - Add index for performance

  2. **New Function**
    - `auto_create_shipment_from_label()` - Trigger function that automatically
      creates a shipment record when a shipping label status changes to 'ready'

  3. **New Trigger**
    - Trigger on shipping_labels table to auto-create shipment records

  4. **Security**
    - No RLS changes needed (inherits from existing policies)

  ## Important Notes
  - When a shipping label is created with status 'ready', a shipment is auto-created
  - The shipment inherits key data from the label (tracking, carrier, order)
  - Both records remain linked via shipping_label_id foreign key
  - Vendors can view/manage both labels and shipments independently
*/

-- Add shipping_label_id column to shipments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shipments' AND column_name = 'shipping_label_id'
  ) THEN
    ALTER TABLE shipments ADD COLUMN shipping_label_id uuid REFERENCES shipping_labels(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_shipments_shipping_label_id ON shipments(shipping_label_id);

-- Create function to auto-create shipment from label
CREATE OR REPLACE FUNCTION auto_create_shipment_from_label()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_shipment_id uuid;
BEGIN
  -- Only create shipment if label status is 'ready' and no shipment exists yet
  IF NEW.status = 'ready' AND NOT EXISTS (
    SELECT 1 FROM shipments WHERE shipping_label_id = NEW.id
  ) THEN
    -- Create shipment record
    INSERT INTO shipments (
      order_id,
      vendor_id,
      tracking_number,
      carrier,
      shipping_method,
      status,
      shipping_label_id,
      created_at,
      updated_at
    ) VALUES (
      NEW.order_id,
      NEW.vendor_id,
      NEW.tracking_number,
      NEW.courier_partner,
      NEW.shipping_method,
      'pending',
      NEW.id,
      now(),
      now()
    )
    RETURNING id INTO v_shipment_id;

    RAISE NOTICE 'Auto-created shipment % for label %', v_shipment_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on shipping_labels
DROP TRIGGER IF EXISTS trigger_auto_create_shipment ON shipping_labels;
CREATE TRIGGER trigger_auto_create_shipment
  AFTER INSERT OR UPDATE OF status
  ON shipping_labels
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_shipment_from_label();

-- Add helpful comment
COMMENT ON COLUMN shipments.shipping_label_id IS 'Links to the shipping label used for this shipment. Auto-populated when label is created.';
COMMENT ON TRIGGER trigger_auto_create_shipment ON shipping_labels IS 'Automatically creates a shipment record when a shipping label is marked as ready';