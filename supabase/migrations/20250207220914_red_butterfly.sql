/*
  # Update user profiles sync mechanism

  1. Changes
    - Add refresh function for user profiles
    - Add trigger to keep profiles in sync with auth.users
    - Update get_post_author function
*/

-- Function to refresh user profiles
CREATE OR REPLACE FUNCTION public.refresh_user_profiles()
RETURNS void AS $$
BEGIN
  -- Clear existing profiles
  DELETE FROM public.user_profiles;
  
  -- Insert updated profiles
  INSERT INTO public.user_profiles (id, display_name)
  SELECT 
    id,
    COALESCE(
      NULLIF(raw_user_meta_data->>'display_name', ''),
      SPLIT_PART(email, '@', 1)
    ) as display_name
  FROM auth.users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial population of profiles
SELECT public.refresh_user_profiles();

-- Update the function to use the profiles table
CREATE OR REPLACE FUNCTION public.get_post_author(post_row blog_posts)
RETURNS TEXT AS $$
  SELECT display_name
  FROM public.user_profiles
  WHERE id = post_row.user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a trigger to keep profiles in sync
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS trigger AS $$
BEGIN
  PERFORM public.refresh_user_profiles();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_profiles_trigger ON auth.users;
CREATE TRIGGER sync_user_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON auth.users
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.sync_user_profiles();