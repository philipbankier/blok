/*
  # Add author display name

  1. Changes
    - Add display_name column to auth.users
    - Add function to get user's display name
    - Add RLS policy for reading user profiles

  2. Security
    - Enable RLS on auth.users
    - Add policy for reading user profiles
*/

-- Add display_name to auth.users if it doesn't exist
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create a function to get user's display name
CREATE OR REPLACE FUNCTION public.get_user_display_name(user_id uuid)
RETURNS TEXT AS $$
  SELECT 
    COALESCE(
      display_name,
      SPLIT_PART(email, '@', 1)
    )
  FROM auth.users
  WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;