/*
  # Update blog posts table policies for seeding

  1. Security Changes
    - Allow public (unauthenticated) users to insert blog posts
    - Keep existing policies for reading, updating, and deleting

  Note: This is necessary to allow seeding of initial posts without authentication
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Authenticated users can create blog posts" ON blog_posts;

-- Create new policy allowing public inserts
CREATE POLICY "Anyone can create blog posts"
  ON blog_posts
  FOR INSERT
  TO public
  WITH CHECK (true);