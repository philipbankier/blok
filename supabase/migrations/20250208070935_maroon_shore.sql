/*
  # Create viewed posts tracking table

  1. New Tables
    - `viewed_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `post_id` (uuid, references blog_posts)
      - `viewed_at` (timestamptz)
      - Unique constraint on user_id + post_id

  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Read their own viewed posts
      - Create/update their own viewed posts
*/

-- Create viewed_posts table
CREATE TABLE IF NOT EXISTS public.viewed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  post_id uuid REFERENCES blog_posts NOT NULL,
  viewed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_viewed_posts_user_id ON viewed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_viewed_posts_post_id ON viewed_posts(post_id);

-- Enable RLS
ALTER TABLE viewed_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own viewed posts"
  ON viewed_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own viewed posts"
  ON viewed_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own viewed posts"
  ON viewed_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);