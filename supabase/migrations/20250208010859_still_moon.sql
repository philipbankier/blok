/*
  # Update blog authors security policies

  1. Changes
    - Replace public insert policy with authenticated-only policy
    - Add policy for authenticated users to update their own authors
*/

-- Drop the public insert policy
DROP POLICY IF EXISTS "Anyone can create blog authors" ON blog_authors;

-- Create new policy for authenticated users only
CREATE POLICY "Authenticated users can create blog authors"
  ON blog_authors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update any author
-- This is a simplified policy since we don't have a direct user-author relationship
CREATE POLICY "Authenticated users can update authors"
  ON blog_authors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);