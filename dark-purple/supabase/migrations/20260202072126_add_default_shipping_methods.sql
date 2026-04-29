/*
  # Add Default Shipping Methods

  1. New Data
    - Inserts three standard shipping methods:
      - Standard Shipping (FREE, 5-7 business days)
      - Express Shipping ($9.99, 2-3 business days)
      - Overnight Shipping ($24.99, 1 business day)
  
  2. Notes
    - Uses IF NOT EXISTS check to prevent duplicate inserts
    - Methods are active by default with proper display order
    - Covers typical e-commerce shipping tiers
*/

-- Insert default shipping methods only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM shipping_methods LIMIT 1) THEN
    INSERT INTO shipping_methods (name, description, carrier, base_price, estimated_days_min, estimated_days_max, is_active, display_order)
    VALUES
      (
        'Standard Shipping',
        'Free shipping on all orders',
        'USPS',
        0.00,
        5,
        7,
        true,
        1
      ),
      (
        'Express Shipping',
        'Faster delivery for your important items',
        'UPS',
        9.99,
        2,
        3,
        true,
        2
      ),
      (
        'Overnight Shipping',
        'Next business day delivery',
        'FedEx',
        24.99,
        1,
        1,
        true,
        3
      );
  END IF;
END $$;
