-- Make payment-slips bucket public for admin viewing
UPDATE storage.buckets SET public = true WHERE id = 'payment-slips';

-- Create policy to allow anyone to read payment slips
CREATE POLICY "Public can view payment slips"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-slips');

-- Allow service_role to upload slips (for edge functions)
CREATE POLICY "Service role can upload payment slips"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-slips');