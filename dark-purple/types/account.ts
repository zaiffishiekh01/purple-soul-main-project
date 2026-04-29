export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  preferred_language: string;
  default_shipping_method: string | null;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  two_factor_enabled: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  delivery_instructions: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  is_gift_recipient: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: string;
  token: string;
  last_four: string;
  card_brand: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  billing_address_id: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recipient {
  id: string;
  user_id: string;
  name: string;
  relationship: string | null;
  address_id: string | null;
  gift_preferences: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  notes: string | null;
  priority: number;
  quantity_desired: number;
  notify_price_drop: boolean;
  notify_restock: boolean;
  added_at: string;
}

export interface GiftCard {
  id: string;
  code: string;
  original_amount: number;
  current_balance: number;
  currency: string;
  purchased_by_user_id: string | null;
  recipient_email: string | null;
  message: string | null;
  scheduled_delivery_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  redeemed_at: string | null;
}

export interface Registry {
  id: string;
  user_id: string;
  name: string;
  type: 'new_home' | 'marriage' | 'birth' | 'study' | 'healing' | 'mourning' | 'pilgrimage';
  description: string | null;
  event_date: string | null;
  shipping_address_id: string | null;
  is_public: boolean;
  share_token: string;
  allow_partial_contributions: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistryItem {
  id: string;
  registry_id: string;
  product_id: string;
  quantity_desired: number;
  quantity_purchased: number;
  amount_contributed: number;
  notes: string | null;
  priority: number;
  added_at: string;
}

export interface OrderShipment {
  id: string;
  order_id: string;
  vendor_id: string | null;
  carrier: string;
  tracking_number: string;
  tracking_url: string | null;
  status: 'label_created' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  shipped_at: string;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  reason_details: string | null;
  return_method: 'refund' | 'store_credit' | 'exchange';
  status: 'requested' | 'approved' | 'label_issued' | 'in_transit' | 'received' | 'inspected' | 'refunded' | 'rejected';
  return_label_url: string | null;
  refund_amount: number | null;
  refund_issued_at: string | null;
  photos: any | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  document_type: 'invoice' | 'receipt' | 'packing_slip' | 'return_label' | 'customs';
  file_url: string;
  file_name: string;
  generated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  ip_address: string | null;
  user_agent: string | null;
  details: any | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  attachments: string[] | null;
  is_internal: boolean;
  created_at: string;
}
