/*
  # Fix Materials Column Type

  1. Changes
    - Alter materials column from text to text array to match other filter columns

  2. Purpose
    - Ensure materials can store multiple values like other filter fields
*/

DO $$
BEGIN
  ALTER TABLE products ALTER COLUMN materials TYPE text[] USING 
    CASE 
      WHEN materials IS NULL OR materials = '' THEN '{}'::text[]
      ELSE ARRAY[materials]::text[]
    END;
  
  ALTER TABLE products ALTER COLUMN materials SET DEFAULT '{}';
END $$;
