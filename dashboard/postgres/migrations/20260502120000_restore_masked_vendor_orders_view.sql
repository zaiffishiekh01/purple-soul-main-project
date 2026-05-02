/*
  # Restore vendor-safe vendor_orders view

  Reverts the wide `SELECT * FROM orders` from 20260410115755 to the same
  privacy model as 20251117083149: no raw customer email, phone, full name,
  or billing address. Vendors see first name + last initial, shipping address,
  and order/financial fields. Proxy relay fields and non-PII order metadata
  (discounts, Stripe ids) are included for fulfillment and accounting.
*/

DROP VIEW IF EXISTS public.vendor_orders CASCADE;

CREATE VIEW public.vendor_orders AS
SELECT
  o.id,
  o.vendor_id,
  o.order_number,
  o.customer_first_name || ' ' || o.customer_last_initial || '.' AS customer_display_name,
  (o.customer_first_name || ' ' || o.customer_last_initial || '.') AS customer_name,
  o.customer_first_name,
  o.customer_last_initial,
  o.shipping_address,
  o.status,
  o.total_amount,
  o.subtotal,
  o.tax_amount,
  o.shipping_cost,
  o.discount_amount,
  o.discount_type,
  o.discount_note,
  o.payment_status,
  o.payment_method,
  o.notes,
  o.proxy_email,
  o.proxy_phone_display,
  o.stripe_payment_intent_id,
  o.stripe_payment_status,
  o.stripe_transfer_id,
  o.created_at,
  o.updated_at
FROM public.orders o;

ALTER VIEW public.vendor_orders SET (security_invoker = true);

GRANT SELECT ON public.vendor_orders TO authenticated;

COMMENT ON VIEW public.vendor_orders IS
  'Vendor-safe view: masked customer name, no email/phone/billing/full legal name.';
