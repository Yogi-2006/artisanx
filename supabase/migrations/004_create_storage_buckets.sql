-- 004_create_storage_buckets.sql

-- 1. Create the profile-photos bucket and make it public
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to profile-photos
CREATE POLICY "Public read access for profile-photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-photos');

-- 3. Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'profile-photos' 
    AND name LIKE (auth.uid()::text || '_%')
);

-- 4. Allow authenticated users to update their own profile photos
CREATE POLICY "Users can update their own profile photos" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'profile-photos' 
    AND name LIKE (auth.uid()::text || '_%')
);

-- 5. Allow authenticated users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'profile-photos' 
    AND name LIKE (auth.uid()::text || '_%')
);
