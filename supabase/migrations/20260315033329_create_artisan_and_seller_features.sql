/*
  # E-commerce Platform Advanced Features Schema

  ## 1. New Tables
  
  ### `artisans`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Links to authentication
  - `business_name` (text) - Artisan's business/studio name
  - `display_name` (text) - Public display name
  - `bio` (text) - Artisan's story and background
  - `heritage_story` (text) - Cultural and traditional heritage
  - `location` (text) - Geographic location
  - `traditions` (text[]) - Array of traditions they specialize in
  - `profile_image` (text) - URL to profile photo
  - `cover_image` (text) - URL to cover/banner image
  - `video_url` (text) - Introduction or workshop video
  - `years_experience` (integer) - Years in the craft
  - `verified` (boolean) - Verification status
  - `total_sales` (integer) - Total number of sales
  - `rating` (numeric) - Average rating
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `artisan_media`
  - `id` (uuid, primary key)
  - `artisan_id` (uuid, references artisans)
  - `media_type` (text) - 'image', 'video'
  - `media_url` (text) - URL to media
  - `caption` (text) - Description
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz)

  ### `wishlists`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Wishlist name (e.g., "Wedding Registry", "Housewarming")
  - `description` (text) - Description
  - `is_public` (boolean) - Public visibility
  - `is_registry` (boolean) - Special registry type
  - `event_date` (date) - For registries/special occasions
  - `share_code` (text, unique) - Shareable code
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `wishlist_items`
  - `id` (uuid, primary key)
  - `wishlist_id` (uuid, references wishlists)
  - `product_id` (uuid, references products)
  - `quantity_desired` (integer) - How many wanted
  - `quantity_purchased` (integer) - How many already purchased by others
  - `priority` (text) - 'high', 'medium', 'low'
  - `notes` (text) - Personal notes
  - `added_at` (timestamptz)

  ### `customer_gallery`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products)
  - `image_url` (text) - Customer photo
  - `caption` (text) - Customer's description
  - `location` (text) - Where they're using it
  - `is_approved` (boolean) - Moderation status
  - `likes_count` (integer) - Community engagement
  - `created_at` (timestamptz)

  ### `artisan_messages`
  - `id` (uuid, primary key)
  - `artisan_id` (uuid, references artisans)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products) - Optional context
  - `message` (text) - Message content
  - `sender_type` (text) - 'customer' or 'artisan'
  - `is_read` (boolean) - Read status
  - `parent_id` (uuid, references artisan_messages) - For threading
  - `created_at` (timestamptz)

  ### `tradition_guides`
  - `id` (uuid, primary key)
  - `title` (text) - Guide title
  - `tradition` (text) - Associated tradition
  - `content` (text) - Educational content
  - `image_url` (text) - Featured image
  - `video_url` (text) - Optional video
  - `author_id` (uuid, references artisans) - Optional artisan contributor
  - `view_count` (integer) - Engagement tracking
  - `published` (boolean) - Publication status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `gift_finder_responses`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Optional for logged-in users
  - `session_id` (text) - For anonymous users
  - `occasion` (text) - Gift occasion
  - `recipient_relationship` (text) - Who it's for
  - `traditions` (text[]) - Tradition preferences
  - `price_range` (text) - Budget range
  - `style_preferences` (text[]) - Style choices
  - `recommended_products` (uuid[]) - Product IDs
  - `created_at` (timestamptz)

  ### `payment_plans`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products)
  - `total_amount` (numeric) - Total price
  - `deposit_amount` (numeric) - Initial deposit
  - `installment_amount` (numeric) - Per-installment amount
  - `installment_count` (integer) - Number of payments
  - `installments_paid` (integer) - Payments completed
  - `status` (text) - 'active', 'completed', 'defaulted'
  - `next_payment_date` (date) - Next due date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `live_activity_feed`
  - `id` (uuid, primary key)
  - `activity_type` (text) - 'purchase', 'review', 'gallery_post'
  - `user_location` (text) - Anonymized location (city/state)
  - `product_id` (uuid, references products)
  - `message` (text) - Activity description
  - `created_at` (timestamptz)

  ### `seller_analytics`
  - `id` (uuid, primary key)
  - `artisan_id` (uuid, references artisans)
  - `date` (date) - Analytics date
  - `views` (integer) - Profile/product views
  - `sales_count` (integer) - Number of sales
  - `revenue` (numeric) - Revenue generated
  - `customer_regions` (jsonb) - Geographic breakdown
  - `top_products` (jsonb) - Best sellers
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Policies for authenticated users to manage their own data
  - Public read access where appropriate (artisan profiles, guides)
  - Artisans can manage their own profiles and respond to messages
*/

-- Artisans table
CREATE TABLE IF NOT EXISTS artisans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  business_name text NOT NULL,
  display_name text NOT NULL,
  bio text DEFAULT '',
  heritage_story text DEFAULT '',
  location text DEFAULT '',
  traditions text[] DEFAULT '{}',
  profile_image text DEFAULT '',
  cover_image text DEFAULT '',
  video_url text DEFAULT '',
  years_experience integer DEFAULT 0,
  verified boolean DEFAULT false,
  total_sales integer DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Artisan media gallery
CREATE TABLE IF NOT EXISTS artisan_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  caption text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Wishlists and registries
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  is_public boolean DEFAULT false,
  is_registry boolean DEFAULT false,
  event_date date,
  share_code text UNIQUE DEFAULT substring(md5(random()::text) from 1 for 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wishlist items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists ON DELETE CASCADE NOT NULL,
  product_id uuid NOT NULL,
  quantity_desired integer DEFAULT 1,
  quantity_purchased integer DEFAULT 0,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes text DEFAULT '',
  added_at timestamptz DEFAULT now()
);

-- Customer gallery (photos of purchases in use)
CREATE TABLE IF NOT EXISTS customer_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text DEFAULT '',
  location text DEFAULT '',
  is_approved boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Artisan messaging system
CREATE TABLE IF NOT EXISTS artisan_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid,
  message text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'artisan')),
  is_read boolean DEFAULT false,
  parent_id uuid REFERENCES artisan_messages,
  created_at timestamptz DEFAULT now()
);

-- Tradition guides (educational content)
CREATE TABLE IF NOT EXISTS tradition_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tradition text NOT NULL,
  content text NOT NULL,
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  author_id uuid REFERENCES artisans,
  view_count integer DEFAULT 0,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gift finder quiz responses
CREATE TABLE IF NOT EXISTS gift_finder_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  session_id text,
  occasion text NOT NULL,
  recipient_relationship text NOT NULL,
  traditions text[] DEFAULT '{}',
  price_range text NOT NULL,
  style_preferences text[] DEFAULT '{}',
  recommended_products uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Payment plans (layaway)
CREATE TABLE IF NOT EXISTS payment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid NOT NULL,
  total_amount numeric NOT NULL,
  deposit_amount numeric NOT NULL,
  installment_amount numeric NOT NULL,
  installment_count integer NOT NULL,
  installments_paid integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
  next_payment_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Live activity feed (social proof)
CREATE TABLE IF NOT EXISTS live_activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL CHECK (activity_type IN ('purchase', 'review', 'gallery_post')),
  user_location text NOT NULL,
  product_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Seller analytics dashboard
CREATE TABLE IF NOT EXISTS seller_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  views integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  customer_regions jsonb DEFAULT '{}',
  top_products jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(artisan_id, date)
);

-- Enable RLS on all tables
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradition_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_finder_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artisans
CREATE POLICY "Anyone can view verified artisan profiles"
  ON artisans FOR SELECT
  TO authenticated, anon
  USING (verified = true);

CREATE POLICY "Artisans can view own profile"
  ON artisans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Artisans can update own profile"
  ON artisans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create artisan profile"
  ON artisans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for artisan_media
CREATE POLICY "Anyone can view artisan media"
  ON artisan_media FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = artisan_media.artisan_id
      AND artisans.verified = true
    )
  );

CREATE POLICY "Artisans can manage own media"
  ON artisan_media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = artisan_media.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- RLS Policies for wishlists
CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public wishlists by share code"
  ON wishlists FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Users can manage own wishlists"
  ON wishlists FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for wishlist_items
CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.is_public = true
    )
  );

CREATE POLICY "Users can manage own wishlist items"
  ON wishlist_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- RLS Policies for customer_gallery
CREATE POLICY "Anyone can view approved gallery posts"
  ON customer_gallery FOR SELECT
  TO authenticated, anon
  USING (is_approved = true);

CREATE POLICY "Users can view own gallery posts"
  ON customer_gallery FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create gallery posts"
  ON customer_gallery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gallery posts"
  ON customer_gallery FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for artisan_messages
CREATE POLICY "Users can view own messages"
  ON artisan_messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = artisan_messages.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON artisan_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR sender_type = 'artisan');

CREATE POLICY "Artisans can update message read status"
  ON artisan_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = artisan_messages.artisan_id
      AND artisans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = artisan_messages.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- RLS Policies for tradition_guides
CREATE POLICY "Anyone can view published guides"
  ON tradition_guides FOR SELECT
  TO authenticated, anon
  USING (published = true);

CREATE POLICY "Artisan authors can manage own guides"
  ON tradition_guides FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = tradition_guides.author_id
      AND artisans.user_id = auth.uid()
    )
  );

-- RLS Policies for gift_finder_responses
CREATE POLICY "Users can view own gift finder responses"
  ON gift_finder_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create gift finder responses"
  ON gift_finder_responses FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for payment_plans
CREATE POLICY "Users can view own payment plans"
  ON payment_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment plans"
  ON payment_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment plans"
  ON payment_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for live_activity_feed
CREATE POLICY "Anyone can view recent activity feed"
  ON live_activity_feed FOR SELECT
  TO authenticated, anon
  USING (created_at > now() - interval '24 hours');

CREATE POLICY "System can create activity feed entries"
  ON live_activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for seller_analytics
CREATE POLICY "Artisans can view own analytics"
  ON seller_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = seller_analytics.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create analytics"
  ON seller_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = seller_analytics.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON artisans(user_id);
CREATE INDEX IF NOT EXISTS idx_artisans_verified ON artisans(verified);
CREATE INDEX IF NOT EXISTS idx_artisan_media_artisan_id ON artisan_media(artisan_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_code ON wishlists(share_code);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_customer_gallery_product_id ON customer_gallery(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_gallery_approved ON customer_gallery(is_approved);
CREATE INDEX IF NOT EXISTS idx_artisan_messages_artisan_id ON artisan_messages(artisan_id);
CREATE INDEX IF NOT EXISTS idx_artisan_messages_user_id ON artisan_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_tradition_guides_published ON tradition_guides(published);
CREATE INDEX IF NOT EXISTS idx_payment_plans_user_id ON payment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_live_activity_created_at ON live_activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_artisan_date ON seller_analytics(artisan_id, date DESC);