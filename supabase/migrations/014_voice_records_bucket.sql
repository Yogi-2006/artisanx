-- Migration to create the voice-records storage bucket and security policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'voice-records',
    'voice-records',
    false, -- Voice recordings should be PRIVATE
    10485760, -- 10MB
    ARRAY['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/ogg']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for voice-records bucket
-- Allow authenticated artisan to upload their own recording
CREATE POLICY "Allow authenticated artisan to insert voice records"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'voice-records'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Allow authenticated artisan to select their own recording
CREATE POLICY "Allow authenticated artisan to select own voice records"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'voice-records'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Allow authenticated artisan to update own voice records
CREATE POLICY "Allow authenticated artisan to update own voice records"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'voice-records'
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'voice-records'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Allow authenticated artisan to delete own voice records
CREATE POLICY "Allow authenticated artisan to delete own voice records"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'voice-records'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
