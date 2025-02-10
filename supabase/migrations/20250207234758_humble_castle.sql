/*
  # Add author image to user profiles

  1. Changes
    - Add `avatar_url` column to `user_profiles` table
    - Set a default avatar using Unsplash random avatars
  
  2. Security
    - Maintains existing RLS policies
*/

-- Add avatar_url column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT
DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop';