/*
  # Add blog authors and update blog posts

  1. New Tables
    - `blog_authors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)

  2. Changes to blog_posts
    - Add `author_id` column referencing blog_authors
    - Remove user-based policies
    - Add new policies for public access

  3. Security
    - Enable RLS on blog_authors
    - Add policy for public read access
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can read blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can create blog posts" ON blog_posts;

-- Create blog_authors table
CREATE TABLE IF NOT EXISTS blog_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read blog authors"
  ON blog_authors
  FOR SELECT
  TO public
  USING (true);

-- Add author_id to blog_posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES blog_authors(id);

-- Create new policies for blog posts
CREATE POLICY "Anyone can read blog posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create blog posts"
  ON blog_posts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Now we can safely remove the user_id column
ALTER TABLE blog_posts
  DROP COLUMN IF EXISTS user_id;