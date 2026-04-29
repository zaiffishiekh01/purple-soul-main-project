/*
  # Add INSERT policy for transactions table
  
  1. Problem
     - Vendors can view transactions but cannot create them
     - This blocks refund processing which needs to create refund transactions
  
  2. Solution
     - Add INSERT policy allowing approved vendors to create transactions for their own vendor_id
     - Ensures vendors can only create transactions for themselves
  
  3. Security
     - Policy checks vendor is approved
     - Policy checks vendor_id matches authenticated user's vendor
     - Maintains data integrity and security
*/

-- Drop policy if it exists
DROP POLICY IF EXISTS "Approved vendors can create own transactions" ON transactions;

-- Add INSERT policy for approved vendors on transactions table
CREATE POLICY "Approved vendors can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT id 
      FROM vendors 
      WHERE user_id = auth.uid() 
        AND is_approved = true
    )
  );
