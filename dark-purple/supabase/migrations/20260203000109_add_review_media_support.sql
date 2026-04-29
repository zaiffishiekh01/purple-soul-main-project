/*
  # Add Review Media Support

  1. New Tables
    - `review_media`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to product_reviews)
      - `media_type` (text) - image, video
      - `media_url` (text)
      - `thumbnail_url` (text, optional)
      - `alt_text` (text, optional)
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on review_media table
    - Users can add media to their own reviews
    - Anyone can view media for approved reviews
    - Users can delete media from their own reviews

  3. Indexes
    - review_id for fast media lookups
    - display_order for proper ordering
*/

CREATE TABLE IF NOT EXISTS review_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  thumbnail_url text,
  alt_text text,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_media_review_id ON review_media(review_id);
CREATE INDEX IF NOT EXISTS idx_review_media_display_order ON review_media(review_id, display_order);

ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media for approved reviews"
  ON review_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM product_reviews
      WHERE id = review_media.review_id
      AND status = 'approved'
    )
  );

CREATE POLICY "Users can add media to own reviews"
  ON review_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_reviews
      WHERE id = review_media.review_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media from own reviews"
  ON review_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_reviews
      WHERE id = review_media.review_id
      AND user_id = auth.uid()
    )
  );