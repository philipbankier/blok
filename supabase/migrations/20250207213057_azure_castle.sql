/*
  # Update blog posts table policies

  1. Security Changes
    - Add policy for authenticated users to insert blog posts
    - Add policy for public to read blog posts
    - Add policy for authenticated users to update their own posts
    - Add policy for authenticated users to delete their own posts

  2. Changes
    - Add user_id column to track post ownership
    - Add policies for CRUD operations
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Blog posts are readable by everyone" ON blog_posts;

-- Create new policies
CREATE POLICY "Anyone can read blog posts"
  ON blog_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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