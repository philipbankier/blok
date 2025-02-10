/*
  # Create user profiles table

  1. Changes
    - Create a user profiles table instead of a view
    - Set up proper RLS policies
    - Create function to get post author names

  2. Security
    - Enable RLS on the profiles table
    - Allow public read access to profiles
    - Maintain user privacy by only exposing necessary fields
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read user profiles"
  ON public.user_profiles
  FOR SELECT
  TO public
  USING (true);

-- Create trigger to automatically create/update profile
CREATE OR REPLACE FUNCTION public.handle_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_profile();

-- Update the function to use the profiles table
CREATE OR REPLACE FUNCTION public.get_post_author(post_row blog_posts)
RETURNS TEXT AS $$
  SELECT display_name
  FROM public.user_profiles
  WHERE id = post_row.user_id;
$$ LANGUAGE sql SECURITY DEFINER;