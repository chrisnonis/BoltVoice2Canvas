/*
  # Complete Database Fix for Voice2Canvas

  This script addresses:
  1. Foreign key relationships between artworks and auth.users
  2. RLS policies for proper access control
  3. Missing indexes for performance
  4. Profile table setup and relationships
  5. Security policies for user data protection

  Run this script in your Supabase SQL Editor.
*/

-- 1. First, let's ensure the profiles table is properly set up
-- Check if profiles table exists and has correct structure
DO $$
BEGIN
  -- Ensure profiles table has correct foreign key to auth.users
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  -- Add correct foreign key constraint for profiles
  ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- 2. Fix artworks table foreign key relationships
DO $$
BEGIN
  -- Drop existing artworks foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'artworks_user_id_fkey' 
    AND table_name = 'artworks'
  ) THEN
    ALTER TABLE artworks DROP CONSTRAINT artworks_user_id_fkey;
  END IF;
  
  -- Add correct foreign key constraint for artworks
  ALTER TABLE artworks ADD CONSTRAINT artworks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- 3. Clean up all existing RLS policies for artworks
DROP POLICY IF EXISTS "Public artworks are viewable by everyone" ON artworks;
DROP POLICY IF EXISTS "Public artworks are viewable by everyone." ON artworks;
DROP POLICY IF EXISTS "Users can insert their own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can insert their own artworks." ON artworks;
DROP POLICY IF EXISTS "Users can insert own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can read own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can update own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can update their own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can update their own artworks." ON artworks;
DROP POLICY IF EXISTS "Users can delete own artworks" ON artworks;
DROP POLICY IF EXISTS "Public artworks viewable by everyone" ON artworks;
DROP POLICY IF EXISTS "Users can view own artworks" ON artworks;
DROP POLICY IF EXISTS "artworks_public_select_policy" ON artworks;
DROP POLICY IF EXISTS "artworks_user_select_policy" ON artworks;
DROP POLICY IF EXISTS "artworks_user_insert_policy" ON artworks;
DROP POLICY IF EXISTS "artworks_user_update_policy" ON artworks;
DROP POLICY IF EXISTS "artworks_user_delete_policy" ON artworks;

-- 4. Create clean, uniquely named RLS policies for artworks
CREATE POLICY "artworks_public_read"
  ON artworks
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "artworks_owner_read"
  ON artworks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "artworks_owner_create"
  ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "artworks_owner_update"
  ON artworks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "artworks_owner_delete"
  ON artworks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Clean up and recreate RLS policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;

CREATE POLICY "profiles_public_read"
  ON profiles
  FOR SELECT
  TO public
  USING (is_public_profile = true);

CREATE POLICY "profiles_owner_read"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_owner_create"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_owner_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Clean up and recreate RLS policies for comments
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments." ON comments;
DROP POLICY IF EXISTS "Users can update their own comments." ON comments;

CREATE POLICY "comments_public_read"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "comments_owner_create"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_owner_update"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_owner_delete"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Ensure all necessary indexes exist for performance
CREATE INDEX IF NOT EXISTS artworks_user_id_idx ON artworks(user_id);
CREATE INDEX IF NOT EXISTS artworks_is_public_idx ON artworks(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS artworks_created_at_idx ON artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS artworks_featured_idx ON artworks(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_public_idx ON profiles(is_public_profile) WHERE is_public_profile = true;

CREATE INDEX IF NOT EXISTS comments_artwork_id_idx ON comments(artwork_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- 8. Ensure RLS is enabled on all tables
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 9. Create a function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, is_public_profile)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Verify data integrity - Update any existing artworks with missing user_email
UPDATE artworks 
SET user_email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = artworks.user_id
)
WHERE user_email IS NULL OR user_email = '';

-- 12. Add any missing constraints
DO $$
BEGIN
  -- Ensure user_email is not null for new records
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'artworks_user_email_not_null'
  ) THEN
    ALTER TABLE artworks ADD CONSTRAINT artworks_user_email_not_null 
    CHECK (user_email IS NOT NULL AND user_email != '');
  END IF;
END $$;