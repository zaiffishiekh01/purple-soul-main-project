import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return Reflect.get(getSupabaseClient(), prop);
  },
});

export type Artisan = {
  id: string;
  user_id: string;
  business_name: string;
  display_name: string;
  bio: string;
  heritage_story: string;
  location: string;
  traditions: string[];
  profile_image: string;
  cover_image: string;
  video_url: string;
  years_experience: number;
  verified: boolean;
  total_sales: number;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type ArtisanMedia = {
  id: string;
  artisan_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  caption: string;
  display_order: number;
  created_at: string;
};

export type Wishlist = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  is_registry: boolean;
  event_date?: string;
  share_code: string;
  created_at: string;
  updated_at: string;
};

export type WishlistItem = {
  id: string;
  wishlist_id: string;
  product_id: string;
  quantity_desired: number;
  quantity_purchased: number;
  priority: 'high' | 'medium' | 'low';
  notes: string;
  added_at: string;
};

export type CustomerGallery = {
  id: string;
  user_id: string;
  product_id: string;
  image_url: string;
  caption: string;
  location: string;
  is_approved: boolean;
  likes_count: number;
  created_at: string;
};

export type ArtisanMessage = {
  id: string;
  artisan_id: string;
  user_id: string;
  product_id?: string;
  message: string;
  sender_type: 'customer' | 'artisan';
  is_read: boolean;
  parent_id?: string;
  created_at: string;
};

export type TraditionGuide = {
  id: string;
  title: string;
  tradition: string;
  content: string;
  image_url: string;
  video_url: string;
  author_id?: string;
  view_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentPlan = {
  id: string;
  user_id: string;
  product_id: string;
  total_amount: number;
  deposit_amount: number;
  installment_amount: number;
  installment_count: number;
  installments_paid: number;
  status: 'active' | 'completed' | 'defaulted';
  next_payment_date: string;
  created_at: string;
  updated_at: string;
};

export type LiveActivity = {
  id: string;
  activity_type: 'purchase' | 'review' | 'gallery_post';
  user_location: string;
  product_id: string;
  message: string;
  created_at: string;
};

export type WeddingRegistry = {
  id: string;
  user_id: string;
  wedding_date: string | null;
  couple_name_1: string;
  couple_name_2: string;
  registry_url_slug: string;
  privacy_setting: 'public' | 'private' | 'password_protected';
  registry_password: string | null;
  story: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type RegistryItem = {
  id: string;
  registry_id: string;
  product_id: string;
  quantity_requested: number;
  quantity_purchased: number;
  priority: 'high' | 'medium' | 'low';
  notes: string;
  created_at: string;
  updated_at: string;
};

export type RegistryPurchase = {
  id: string;
  registry_item_id: string;
  purchaser_name: string;
  purchaser_email: string;
  quantity: number;
  purchase_date: string;
  message: string;
  is_anonymous: boolean;
  gift_wrapped: boolean;
};

export type RegistryStatistics = {
  registry_id: string;
  user_id: string;
  couple_name_1: string;
  couple_name_2: string;
  wedding_date: string | null;
  total_items: number;
  total_quantity_requested: number;
  total_quantity_purchased: number;
  total_purchases: number;
  unique_purchasers: number;
  completion_percentage: number;
};
