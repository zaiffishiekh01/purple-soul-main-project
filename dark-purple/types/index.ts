export type UserRole = 'customer' | 'vendor' | 'admin';
export type VendorStatus = 'pending' | 'active' | 'suspended';

export type OrderStatus =
  | 'created'
  | 'payment_pending'
  | 'paid'
  | 'vendor_confirmed'
  | 'picking'
  | 'packed'
  | 'label_created'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'return_approved'
  | 'return_rejected'
  | 'return_in_transit'
  | 'return_received'
  | 'refund_pending'
  | 'refunded';

export type ShipmentStatus = 'pending' | 'label_created' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'in_transit' | 'received' | 'refunded';
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  shipping_addresses: ShippingAddress[];
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  user_id?: string;
  business_name: string;
  email: string;
  description?: string;
  logo_url?: string;
  status: VendorStatus;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  layer: 1 | 2 | 3;
  parent_id?: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image_url?: string;
  product_ids: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  title: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  layer1_category_slug?: string;
  layer2_category_slug?: string;
  traditions: string[];
  purposes: string[];
  occasions: string[];
  format?: string;
  sensitivity?: string;
  materials?: string;
  care_instructions?: string;
  shipping_notes?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  // Curated badge system
  craft_badges?: string[];
  experience_badges?: string[];
  curation_badge?: string;
  practical_badges?: string[];
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  contact_info: ContactInfo;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shipments?: Shipment[];
  payments?: Payment[];
  customer?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  product?: Product;
  vendor?: Vendor;
}

export interface Shipment {
  id: string;
  order_id: string;
  vendor_id: string;
  carrier?: string;
  service_type?: string;
  tracking_number?: string;
  label_url?: string;
  status: ShipmentStatus;
  package_weight?: number;
  package_dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  shipped_at?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface ReturnItem {
  product_id: string;
  quantity: number;
  reason: string;
}

export interface Return {
  id: string;
  order_id: string;
  customer_id: string;
  status: ReturnStatus;
  items: ReturnItem[];
  reason: string;
  notes?: string;
  images: string[];
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  order?: Order;
  customer?: User;
}

export interface Refund {
  id: string;
  order_id: string;
  return_id?: string;
  amount: number;
  status: RefundStatus;
  method?: string;
  transaction_id?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transaction_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSession {
  cart_items: CartItem[];
  shipping_address?: ShippingAddress;
  contact_info?: ContactInfo;
  delivery_method?: string;
  payment_method?: string;
}

export interface OrderStatusTimeline {
  status: OrderStatus;
  timestamp: string;
  description: string;
  completed: boolean;
}

export const Layer1Categories = [
  'prayer-remembrance',
  'sacred-space-home',
  'learning-scripture',
  'rituals-life-moments',
  'reflection-inner-work',
  'apparel-personal-expression',
  'sacred-art-aesthetics',
  'music-sound-silence',
  'gifts-collections',
  'digital-media-resources'
] as const;

export type Layer1Category = typeof Layer1Categories[number];

export const Traditions = ['jewish', 'christian', 'islamic', 'interfaith'] as const;
export type Tradition = typeof Traditions[number];

export const Purposes = [
  'daily-practice',
  'study',
  'meditation',
  'celebration',
  'mourning',
  'healing',
  'gifting',
  'teaching'
] as const;
export type Purpose = typeof Purposes[number];

export const Occasions = [
  'sabbath',
  'ramadan',
  'passover',
  'easter',
  'christmas',
  'eid',
  'hanukkah',
  'rosh-hashanah',
  'yom-kippur',
  'wedding',
  'birth',
  'coming-of-age',
  'funeral'
] as const;
export type Occasion = typeof Occasions[number];
