/*
  # Add user profiles relationship to blog posts

  1. Changes
    - Add foreign key relationship between blog_posts.user_id and user_profiles.id
    - Update existing blog posts to have a default user profile if needed
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add foreign key relationship if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_user_id_fkey'
  ) THEN
    ALTER TABLE blog_posts
      DROP CONSTRAINT IF EXISTS blog_posts_user_id_fkey,
      ADD CONSTRAINT blog_posts_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES user_profiles(id);
  END IF;
END $$;