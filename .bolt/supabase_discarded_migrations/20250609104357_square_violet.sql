/*
  # Final Database Cleanup Script
  
  This script ensures all RLS policies are clean and properly configured
  to prevent any "policy already exists" errors.
  
  1. Security
     - Safely removes all existing policies
     - Creates clean, uniquely named policies
     - Ensures proper RLS configuration
  
  2. Data Integrity
     - Verifies foreign key relationships
     - Ensures proper indexes exist
     - Validates data consistency
*/

-- 1. CLEAN UP ALL EXISTING POLICIES (Safe removal)
-- Artworks policies
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
DROP POLICY IF EXISTS "artworks_public_read" ON artworks;
DROP POLICY IF EXISTS "artworks_owner_read" ON artworks;
DROP POLICY IF EXISTS "artworks_owner_create" ON artworks;
DROP POLICY IF EXISTS "artworks_owner_update" ON artworks;
DROP POLICY IF EXISTS "artworks_owner_delete" ON artworks;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_read" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_create" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_update" ON profiles;

-- Comments policies
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments." ON comments;
DROP POLICY IF EXISTS "Users can update their own comments." ON comments;
DROP POLICY IF EXISTS "comments_public_read" ON comments;
DROP POLICY IF EXISTS "comments_owner_create" ON comments;
DROP POLICY IF EXISTS "comments_owner_update" ON comments;
DROP POLICY IF EXISTS "comments_owner_delete" ON comments;

-- 2. CREATE FINAL CLEAN POLICIES WITH UNIQUE NAMES

-- ARTWORKS POLICIES
CREATE POLICY "v2_artworks_public_read"
  ON artworks
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "v2_artworks_owner_read"
  ON artworks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "v2_artworks_owner_create"
  ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "v2_artworks_owner_update"
  ON artworks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "v2_artworks_owner_delete"
  ON artworks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PROFILES POLICIES
CREATE POLICY "v2_profiles_public_read"
  ON profiles
  FOR SELECT
  TO public
  USING (is_public_profile = true);

CREATE POLICY "v2_profiles_owner_read"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "v2_profiles_owner_create"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "v2_profiles_owner_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- COMMENTS POLICIES
CREATE POLICY "v2_comments_public_read"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "v2_comments_owner_create"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "v2_comments_owner_update"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "v2_comments_owner_delete"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. ENSURE RLS IS ENABLED
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. VERIFY AND FIX FOREIGN KEY RELATIONSHIPS
DO $$
BEGIN
  -- Fix artworks foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'artworks_user_id_fkey' 
    AND table_name = 'artworks'
  ) THEN
    ALTER TABLE artworks DROP CONSTRAINT artworks_user_id_fkey;
  END IF;
  
  ALTER TABLE artworks ADD CONSTRAINT artworks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- Fix profiles foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- Fix comments foreign keys
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments DROP CONSTRAINT comments_user_id_fkey;
  END IF;
  
  ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_artwork_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments DROP CONSTRAINT comments_artwork_id_fkey;
  END IF;
  
  ALTER TABLE comments ADD CONSTRAINT comments_artwork_id_fkey 
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE;
END $$;

-- 5. ENSURE ALL PERFORMANCE INDEXES EXIST
CREATE INDEX IF NOT EXISTS artworks_user_id_idx ON artworks(user_id);
CREATE INDEX IF NOT EXISTS artworks_is_public_idx ON artworks(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS artworks_created_at_idx ON artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS artworks_featured_idx ON artworks(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_public_idx ON profiles(is_public_profile) WHERE is_public_profile = true;

CREATE INDEX IF NOT EXISTS comments_artwork_id_idx ON comments(artwork_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- 6. CREATE/UPDATE TRIGGER FUNCTION FOR NEW USER PROFILES
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ENSURE TRIGGER EXISTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. DATA INTEGRITY FIXES
-- Update any artworks missing user_email
UPDATE artworks 
SET user_email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = artworks.user_id
)
WHERE user_email IS NULL OR user_email = '';

-- 9. FINAL VERIFICATION QUERY
-- This will show you the current state of your policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('artworks', 'profiles', 'comments')
ORDER BY tablename, policyname;