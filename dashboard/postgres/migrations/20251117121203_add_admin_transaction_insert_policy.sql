/*
  # Add Admin INSERT Policy for Transactions

  1. Changes
    - Add INSERT policy for admin users on transactions table
    - Allows admins to create transaction records for completed payouts
  
  2. Security
    - Only admin users can insert transactions
    - Uses is_admin() function to verify admin status
*/

-- Add admin insert policy for transactions
CREATE POLICY "Admins can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());
