/*
  # Rename avatar_url to author_image_url

  1. Changes
    - Rename avatar_url column to author_image_url in blog_authors table
*/

-- Rename avatar_url to author_image_url in blog_authors table
ALTER TABLE blog_authors
  RENAME COLUMN avatar_url TO author_image_url;