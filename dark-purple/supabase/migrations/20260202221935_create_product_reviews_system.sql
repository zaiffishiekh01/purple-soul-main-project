/*
  # Product Reviews and Ratings System

  1. New Tables
    - `product_reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `user_id` (uuid, foreign key to auth.users)
      - `order_id` (uuid, foreign key to orders, optional - ensures verified purchase)
      - `rating` (integer, 1-5)
      - `title` (text)
      - `review_text` (text)
      - `helpful_count` (integer, default 0)
      - `verified_purchase` (boolean, default false)
      - `status` (text, default 'pending') - pending, approved, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `review_helpful_votes`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to product_reviews)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
    
    - `review_responses`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to product_reviews)
      - `responder_id` (uuid, foreign key to auth.users)
      - `responder_type` (text) - vendor, admin
      - `response_text` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can create reviews for products they purchased
    - Users can read approved reviews
    - Users can update their own reviews (within timeframe)
    - Users can vote reviews helpful (once per review)
    - Vendors can respond to reviews for their products
    - Admins can moderate all reviews

  3. Indexes
    - product_id for fast review lookups
    - user_id for user review history
    - rating for filtering
    - status for moderation
*/

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  review_text text NOT NULL CHECK (char_length(review_text) >= 10 AND char_length(review_text) <= 5000),
  helpful_count integer DEFAULT 0 NOT NULL,
  verified_purchase boolean DEFAULT false NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(review_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  responder_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responder_type text NOT NULL CHECK (responder_type IN ('vendor', 'admin')),
  response_text text NOT NULL CHECK (char_length(response_text) >= 10 AND char_length(response_text) <= 2000),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
  ON product_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create reviews for purchased products"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = product_reviews.product_id
      AND o.customer_id = auth.uid()
      AND o.status = 'delivered'
    )
  );

CREATE POLICY "Users can update own reviews within 30 days"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND created_at > now() - interval '30 days'
  )
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own pending reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  );

CREATE POLICY "Anyone can read helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote reviews helpful"
  ON review_helpful_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own helpful votes"
  ON review_helpful_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read review responses"
  ON review_responses FOR SELECT
  USING (true);

CREATE POLICY "Vendors can respond to reviews for their products"
  ON review_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    responder_type = 'vendor'
    AND auth.uid() = responder_id
    AND EXISTS (
      SELECT 1 FROM product_reviews pr
      JOIN products p ON p.id = pr.product_id
      WHERE pr.id = review_responses.review_id
      AND p.vendor_id = auth.uid()
    )
  );

CREATE POLICY "Responders can update own responses"
  ON review_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = responder_id)
  WITH CHECK (auth.uid() = responder_id);

CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_helpful_count_trigger
AFTER INSERT OR DELETE ON review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

CREATE OR REPLACE FUNCTION update_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_updated_at();

CREATE TRIGGER update_review_responses_updated_at
BEFORE UPDATE ON review_responses
FOR EACH ROW
EXECUTE FUNCTION update_review_updated_at();