/*
  # Fix user relationship and policies for blog posts

  1. Changes
    - Drop existing policies that depend on user_id
    - Recreate user_id column with proper foreign key reference
    - Recreate policies with proper user authentication checks
    - Add function to get post author information

  2. Security
    - Maintain row level security
    - Recreate policies for proper user access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;

-- Recreate user_id column with proper foreign key reference
ALTER TABLE blog_posts 
  DROP COLUMN IF EXISTS user_id,
  ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Recreate policies
CREATE POLICY "Users can update their own blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update the query to use auth.users directly
CREATE OR REPLACE FUNCTION public.get_post_author(post_row blog_posts)
RETURNS TEXT AS $$
  SELECT 
    COALESCE(
      u.display_name,
      SPLIT_PART(u.email, '@', 1)
    )
  FROM auth.users u
  WHERE u.id = post_row.user_id;
$$ LANGUAGE sql SECURITY DEFINER;