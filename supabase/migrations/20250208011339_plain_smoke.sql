/*
  # Remove RLS restrictions
  
  1. Changes
    - Disable RLS on all tables to allow full access with private key
*/

-- Disable RLS on all tables
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since they won't be needed
DROP POLICY IF EXISTS "Anyone can read blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can create blog posts" ON blog_posts;

DROP POLICY IF EXISTS "Anyone can read blog authors" ON blog_authors;
DROP POLICY IF EXISTS "Authenticated users can create blog authors" ON blog_authors;
DROP POLICY IF EXISTS "Authenticated users can update authors" ON blog_authors;
DROP POLICY IF EXISTS "Anyone can create blog authors" ON blog_authors;

DROP POLICY IF EXISTS "Users can read their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

DROP POLICY IF EXISTS "Anyone can read user profiles" ON user_profiles;