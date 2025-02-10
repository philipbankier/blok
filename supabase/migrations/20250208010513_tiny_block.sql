/*
  # Add insert policy for blog authors

  1. Changes
    - Add policy to allow public insertion of blog authors
*/

-- Create policy for public insert access
CREATE POLICY "Anyone can create blog authors"
  ON blog_authors
  FOR INSERT
  TO public
  WITH CHECK (true);