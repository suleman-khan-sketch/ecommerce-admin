/*
  # Add user_id to staff table and create profile function

  1. Changes to staff table
    - Add `user_id` column (uuid) that links to auth.users(id)
    - Add unique constraint on user_id
    - Add foreign key constraint to auth.users

  2. New Functions
    - `get_my_profile` - Returns the current user's staff profile with role information
    
  3. Security
    - Function uses auth.uid() to get current user
    - Only returns profile for authenticated users
*/

-- Add user_id column to staff table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE staff ADD COLUMN user_id uuid;
    ALTER TABLE staff ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE staff ADD CONSTRAINT staff_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_my_profile();

-- Create get_my_profile function
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS TABLE (
  name text,
  image_url text,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name,
    s.image_url,
    sr.name::text as role
  FROM staff s
  JOIN staff_roles sr ON s.role_id = sr.id
  WHERE s.user_id = auth.uid()
  AND s.published = true
  LIMIT 1;
END;
$$;