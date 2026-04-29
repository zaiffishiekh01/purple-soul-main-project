/*
  # Moderated Review System

  1. New Tables
    - `product_reviews_moderated`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `rating` (integer, 1-5)
      - `title` (text)
      - `content` (text)
      - `status` (text) - pending, approved, rejected, hidden, edited_pending
      - `verified_purchase` (boolean)
      - `used_for` (text, nullable) - prayer, home, gifting, decor, celebration
      - `recommend` (boolean, nullable)
      - `helpful_count` (integer)
      - `moderator_notes` (text, nullable)
      - `moderated_by` (uuid, nullable, foreign key to auth.users)
      - `moderated_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `review_images`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to product_reviews_moderated)
      - `image_url` (text)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      
    - `review_helpful_votes`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to product_reviews_moderated)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can create and edit their own reviews
    - Only approved reviews are publicly visible
    - Admins can moderate all reviews
    - Users can vote reviews as helpful

  3. Important Notes
    - Only approved reviews count toward product ratings
    - Edited approved reviews return to pending status
    - Moderators must re-approve edited reviews
    - Deleted reviews are soft-deleted (status = hidden)
*/

-- Product reviews with moderation
CREATE TABLE IF NOT EXISTS product_reviews_moderated (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden', 'edited_pending')),
  verified_purchase boolean DEFAULT false,
  used_for text CHECK (used_for IN ('prayer', 'home', 'gifting', 'decor', 'celebration', 'other')),
  recommend boolean,
  helpful_count integer DEFAULT 0,
  moderator_notes text,
  moderated_by uuid REFERENCES auth.users(id),
  moderated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_reviews_moderated ENABLE ROW LEVEL SECURITY;

-- Users can view approved reviews (public)
CREATE POLICY "Anyone can view approved reviews"
  ON product_reviews_moderated FOR SELECT
  USING (status = 'approved');

-- Users can view their own reviews regardless of status
CREATE POLICY "Users can view own reviews"
  ON product_reviews_moderated FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON product_reviews_moderated FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can update their own reviews (goes back to pending)
CREATE POLICY "Users can update own reviews"
  ON product_reviews_moderated FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Review images
CREATE TABLE IF NOT EXISTS review_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES product_reviews_moderated(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view images for approved reviews"
  ON review_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM product_reviews_moderated
      WHERE product_reviews_moderated.id = review_images.review_id
      AND product_reviews_moderated.status = 'approved'
    )
  );

CREATE POLICY "Users can view images for own reviews"
  ON review_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_reviews_moderated
      WHERE product_reviews_moderated.id = review_images.review_id
      AND product_reviews_moderated.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage images for own reviews"
  ON review_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_reviews_moderated
      WHERE product_reviews_moderated.id = review_images.review_id
      AND product_reviews_moderated.user_id = auth.uid()
    )
  );

-- Helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES product_reviews_moderated(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view helpful votes"
  ON review_helpful_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add helpful votes"
  ON review_helpful_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own helpful votes"
  ON review_helpful_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_reviews_moderated
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_reviews_moderated
    SET helpful_count = GREATEST(0, helpful_count - 1)
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON review_helpful_votes;
CREATE TRIGGER update_review_helpful_count_trigger
AFTER INSERT OR DELETE ON review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- Function to handle review edits
CREATE OR REPLACE FUNCTION handle_review_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- If an approved review is edited, change status to edited_pending
  IF OLD.status = 'approved' AND (
    OLD.rating != NEW.rating OR
    OLD.title != NEW.title OR
    OLD.content != NEW.content
  ) THEN
    NEW.status := 'edited_pending';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review edits
DROP TRIGGER IF EXISTS handle_review_edit_trigger ON product_reviews_moderated;
CREATE TRIGGER handle_review_edit_trigger
BEFORE UPDATE ON product_reviews_moderated
FOR EACH ROW
EXECUTE FUNCTION handle_review_edit();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON product_reviews_moderated(product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews_moderated(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews_moderated(status);
CREATE INDEX IF NOT EXISTS idx_review_images_review ON review_images(review_id);
CREATE INDEX IF NOT EXISTS idx_helpful_votes_review ON review_helpful_votes(review_id);