/*
  # Add INSERT policy for gift cards

  1. Changes
    - Add policy allowing authenticated users to insert gift cards they purchase

  2. Security
    - Users can only insert gift cards where they are the purchaser
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gift_cards' AND policyname = 'Users can purchase gift cards'
  ) THEN
    CREATE POLICY "Users can purchase gift cards"
      ON gift_cards FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = purchased_by_user_id);
  END IF;
END $$;
