/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for all foreign key columns that don't have covering indexes
    - Improves query performance for joins and foreign key lookups
    - Essential for production-scale database performance

  2. Indexes Added (40 total)
    - cart_items: product_id, vendor_id
    - coupon_usage: coupon_id, order_id, user_id
    - gift_card_transactions: gift_card_id, order_id
    - gift_cards: purchased_by_user_id
    - order_gift_options: recipient_id
    - order_items: product_id
    - order_shipment_items: order_item_id
    - orders: recipient_id, shipping_method_id
    - payment_methods: billing_address_id
    - payments: order_id
    - product_attachments: product_id, recipient_id, user_id
    - recipients: address_id
    - refunds: order_id, processed_by, return_id
    - registries: shipping_address_id
    - registry_items: product_id
    - registry_purchases: order_id, registry_item_id
    - return_request_items: order_item_id
    - return_requests: order_id
    - returns: approved_by
    - saved_cart_items: product_id, user_id
    - saved_items: product_id
    - support_messages: ticket_id, user_id
    - support_tickets: order_id
    - user_profiles: default_recipient_id
    - vendor_order_items: order_item_id, product_id
    - vendors: user_id
    - wishlist_items: product_id

  3. Notes
    - All indexes use IF NOT EXISTS to prevent errors on re-run
    - Index names follow convention: idx_tablename_columnname_fk
    - These indexes significantly improve query performance at scale
*/

-- cart_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id_fk ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_vendor_id_fk ON public.cart_items(vendor_id);

-- coupon_usage foreign key indexes
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id_fk ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id_fk ON public.coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id_fk ON public.coupon_usage(user_id);

-- gift_card_transactions foreign key indexes
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_gift_card_id_fk ON public.gift_card_transactions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_order_id_fk ON public.gift_card_transactions(order_id);

-- gift_cards foreign key indexes
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchased_by_user_id_fk ON public.gift_cards(purchased_by_user_id);

-- order_gift_options foreign key indexes
CREATE INDEX IF NOT EXISTS idx_order_gift_options_recipient_id_fk ON public.order_gift_options(recipient_id);

-- order_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_order_items_product_id_fk ON public.order_items(product_id);

-- order_shipment_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_order_shipment_items_order_item_id_fk ON public.order_shipment_items(order_item_id);

-- orders foreign key indexes
CREATE INDEX IF NOT EXISTS idx_orders_recipient_id_fk ON public.orders(recipient_id);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method_id_fk ON public.orders(shipping_method_id);

-- payment_methods foreign key indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_billing_address_id_fk ON public.payment_methods(billing_address_id);

-- payments foreign key indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id_fk ON public.payments(order_id);

-- product_attachments foreign key indexes
CREATE INDEX IF NOT EXISTS idx_product_attachments_product_id_fk ON public.product_attachments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attachments_recipient_id_fk ON public.product_attachments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_product_attachments_user_id_fk ON public.product_attachments(user_id);

-- recipients foreign key indexes
CREATE INDEX IF NOT EXISTS idx_recipients_address_id_fk ON public.recipients(address_id);

-- refunds foreign key indexes
CREATE INDEX IF NOT EXISTS idx_refunds_order_id_fk ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_processed_by_fk ON public.refunds(processed_by);
CREATE INDEX IF NOT EXISTS idx_refunds_return_id_fk ON public.refunds(return_id);

-- registries foreign key indexes
CREATE INDEX IF NOT EXISTS idx_registries_shipping_address_id_fk ON public.registries(shipping_address_id);

-- registry_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_registry_items_product_id_fk ON public.registry_items(product_id);

-- registry_purchases foreign key indexes
CREATE INDEX IF NOT EXISTS idx_registry_purchases_order_id_fk ON public.registry_purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_registry_purchases_registry_item_id_fk ON public.registry_purchases(registry_item_id);

-- return_request_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_return_request_items_order_item_id_fk ON public.return_request_items(order_item_id);

-- return_requests foreign key indexes
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id_fk ON public.return_requests(order_id);

-- returns foreign key indexes
CREATE INDEX IF NOT EXISTS idx_returns_approved_by_fk ON public.returns(approved_by);

-- saved_cart_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_saved_cart_items_product_id_fk ON public.saved_cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_saved_cart_items_user_id_fk ON public.saved_cart_items(user_id);

-- saved_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_saved_items_product_id_fk ON public.saved_items(product_id);

-- support_messages foreign key indexes
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id_fk ON public.support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id_fk ON public.support_messages(user_id);

-- support_tickets foreign key indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_order_id_fk ON public.support_tickets(order_id);

-- user_profiles foreign key indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_default_recipient_id_fk ON public.user_profiles(default_recipient_id);

-- vendor_order_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_vendor_order_items_order_item_id_fk ON public.vendor_order_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_vendor_order_items_product_id_fk ON public.vendor_order_items(product_id);

-- vendors foreign key indexes
CREATE INDEX IF NOT EXISTS idx_vendors_user_id_fk ON public.vendors(user_id);

-- wishlist_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id_fk ON public.wishlist_items(product_id);
