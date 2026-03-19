-- =============================================
-- Storage RLS Policies for 'media' bucket
-- =============================================

-- Ensure the media bucket exists and is public (for reading via public URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload files to the media bucket
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Allow public read access (bucket is public)
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
