export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  address: string | Record<string, unknown>;
  tax_id: string;
  status: string;
  logo_url: string;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  can_view_customer_phone?: boolean;
  can_view_customer_email?: boolean;
  created_at: string;
  updated_at: string;
}

export type FeeWaiverStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type FeeWaiverDocumentType = 'BPL_CARD' | 'INCOME_CERTIFICATE' | 'OTHER';

export type FeeWaiverType = 'FULL_FEE_WAIVER' | 'REDUCED_COMMISSION';

export interface FeeWaiverRequest {
  id: string;
  vendor_id: string;
  status: FeeWaiverStatus;
  document_url: string;
  document_type: FeeWaiverDocumentType;
  note_from_vendor: string | null;
  note_from_admin: string | null;
  waiver_type: FeeWaiverType | null;
  commission_rate: number | null;
  valid_from: string | null;
  valid_until: string | null;
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type WarehouseRequestType = 'SEASONAL' | 'YEAR_ROUND' | 'TRIAL';
export type WarehouseRequestStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
export type ReturnShippingOption = 'RETURN_TO_ME' | 'LIQUIDATE' | 'DONATE';
export type WarehouseEndAction = 'RETURN' | 'LIQUIDATE' | 'DONATE' | 'PENDING';

export interface WarehouseRequest {
  id: string;
  vendor_id: string;
  request_type: WarehouseRequestType;
  expected_inventory_value: number;
  expected_sku_count: number;
  product_categories: string[];
  estimated_arrival_date: string | null;
  campaign_duration_months: number;
  shipping_acknowledgment: boolean;
  shipping_to_warehouse_paid: boolean;
  return_shipping_option: ReturnShippingOption | null;
  status: WarehouseRequestStatus;
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  warehouse_address: string | null;
  warehouse_contact_email: string | null;
  warehouse_contact_phone: string | null;
  arrival_deadline: string | null;
  program_end_date: string | null;
  vendor_notes: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehouseInventory {
  id: string;
  warehouse_request_id: string;
  vendor_id: string;
  product_id: string | null;
  sku: string;
  product_name: string;
  quantity_received: number;
  quantity_sold: number;
  quantity_remaining: number;
  received_at: string | null;
  location_in_warehouse: string | null;
  end_action: WarehouseEndAction | null;
  end_action_date: string | null;
  return_shipping_cost: number | null;
  return_tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export type TestProductOfferStatus =
  | 'DRAFT'
  | 'VENDOR_REQUESTED'
  | 'OPEN_FOR_VENDORS'
  | 'UNDER_REVIEW'
  | 'APPROVED_VENDOR_SELECTED'
  | 'TEST_IN_PROGRESS'
  | 'TEST_COMPLETED'
  | 'CANCELLED';

export interface TestProductOffer {
  id: string;
  title: string;
  description: string;
  categories: string[];
  target_quantity: number | null;
  test_batch_size: number | null;
  budget_currency: string | null;
  budget_min: number | null;
  budget_max: number | null;
  target_region: string | null;
  usage_type: string | null;
  design_reference_urls: string[];
  status: TestProductOfferStatus;
  locked_vendor_id: string | null;
  is_targeted_offer: boolean;
  vendor_requested: boolean;
  vendor_requester_id: string | null;
  target_vendor_categories: string[];
  created_by_admin_id: string;
  created_at: string;
  updated_at: string;
  vendors?: {
    business_name: string;
  };
  admin_users?: {
    email: string;
  };
}

export type TestOfferVendorStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'APPROVED_FOR_TEST'
  | 'REJECTED';

export interface TestProductOfferVendor {
  id: string;
  offer_id: string;
  vendor_id: string;
  proposal_note: string | null;
  estimated_unit_cost: number | null;
  estimated_lead_time_days: number | null;
  max_capacity_units: number | null;
  sample_image_urls: string[];
  status: TestOfferVendorStatus;
  created_at: string;
  updated_at: string;
  vendors?: {
    business_name: string;
    contact_email: string;
  };
  test_product_offers?: {
    title: string;
    status: TestProductOfferStatus;
    locked_vendor_id: string | null;
  };
}

export interface TestProductOfferMessage {
  id: string;
  offer_id: string;
  sender_type: 'ADMIN' | 'VENDOR';
  sender_admin_id: string | null;
  sender_vendor_id: string | null;
  message: string;
  attachment_urls: string[];
  created_at: string;
  admin_users?: {
    email: string;
  };
  vendors?: {
    business_name: string;
  };
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown>;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  price: number;
  base_price?: number;
  pricing_model?: 'FIXED' | 'REGIONAL';
  cost: number;
  markup_amount?: number;
  markup_type?: string;
  discount_amount?: number;
  discount_type?: string;
  final_price?: number;
  commission_percentage?: number;
  commission_amount?: number;
  final_marketplace_price?: number;
  images: string[];
  color?: string;
  size_dimensions?: string;
  care_instructions?: string;
  material?: string;
  shipping_timeline?: string;
  stock_quantity?: number;
  tags?: string[];
  image_metadata?: Array<{
    url: string;
    hasBackground: boolean;
    size: string;
    resolution: string;
  }>;
  is_digital?: boolean;
  download_limit?: number;
  license_duration_days?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DigitalProductFile {
  id: string;
  product_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  storage_url: string;
  created_at: string;
}

export interface ProductLicense {
  id: string;
  product_id: string;
  order_id: string;
  customer_email: string;
  license_key: string;
  download_limit: number;
  download_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  last_downloaded_at: string | null;
}

export interface Order {
  id: string;
  vendor_id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  proxy_email?: string;
  proxy_phone_display?: string;
  customer_display_name?: string;
  customer_first_name?: string;
  customer_last_initial?: string;
  shipping_address: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount?: number;
  discount_type?: string;
  discount_note?: string;
  payment_status: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  vendor_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  vendor_id: string;
  order_id: string | null;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'support';
  permissions: {
    manage_vendors?: boolean;
    manage_orders?: boolean;
    manage_products?: boolean;
    manage_users?: boolean;
    view_analytics?: boolean;
    manage_finance?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface RegionalPriceRule {
  id: string;
  product_id?: string;
  category?: string;
  vendor_id?: string;
  country_code: string;
  markup_type: 'FLAT' | 'PERCENT';
  markup_value: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_at: string;
  updated_by?: string;
}
