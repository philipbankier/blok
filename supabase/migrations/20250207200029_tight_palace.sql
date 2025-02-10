/*
  # Initial Schema for BlogTok

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `summary` (text)
      - `url` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `blog_post_id` (uuid, references blog_posts)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Blog posts are readable by everyone
    - Favorites are only readable/writable by the authenticated user who created them
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  url text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  blog_post_id uuid REFERENCES blog_posts NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, blog_post_id)
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Blog posts are readable by everyone
CREATE POLICY "Blog posts are readable by everyone"
  ON blog_posts
  FOR SELECT
  TO public
  USING (true);

-- Favorites policies
CREATE POLICY "Users can read their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);