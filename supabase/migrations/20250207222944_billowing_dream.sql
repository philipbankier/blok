/*
  # Fix blog posts user_id reference

  1. Changes
    - Drop existing policies that depend on user_id
    - Recreate user_id column with correct reference to user_profiles
    - Recreate policies with proper user_id reference
    - Add performance index
  
  2. Security
    - Recreate RLS policies for user_id
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;

-- Recreate the user_id column with proper reference
ALTER TABLE blog_posts 
  DROP COLUMN IF EXISTS user_id;

ALTER TABLE blog_posts 
  ADD COLUMN user_id uuid REFERENCES public.user_profiles(id);

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id 
  ON blog_posts(user_id);

-- Update existing posts to have a default user if needed
UPDATE blog_posts 
SET user_id = (
  SELECT id 
  FROM user_profiles 
  LIMIT 1
)
WHERE user_id IS NULL;

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