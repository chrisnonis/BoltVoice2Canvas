-- Step 1: Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/*'];

-- Step 2: Drop all existing policies for storage.objects related to avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Step 3: Create simple, permissive policies for the avatars bucket
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- Step 4: Also drop and recreate bucket policies if they exist
DROP POLICY IF EXISTS "bucket_avatars_select" ON storage.buckets;
DROP POLICY IF EXISTS "bucket_avatars_insert" ON storage.buckets;
DROP POLICY IF EXISTS "bucket_avatars_update" ON storage.buckets;
DROP POLICY IF EXISTS "bucket_avatars_delete" ON storage.buckets;

-- Step 5: Create bucket-level policies
CREATE POLICY "bucket_avatars_select" ON storage.buckets
FOR SELECT USING (id = 'avatars');

CREATE POLICY "bucket_avatars_insert" ON storage.buckets
FOR INSERT TO authenticated
WITH CHECK (id = 'avatars');