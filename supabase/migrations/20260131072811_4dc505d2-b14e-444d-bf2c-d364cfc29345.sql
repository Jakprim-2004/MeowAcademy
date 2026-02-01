-- Create storage bucket for payment slips
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own payment slips
CREATE POLICY "Users can upload payment slips"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-slips' 
  AND auth.role() = 'authenticated'
);

-- Allow users to view their own payment slips (folder structure: user_id/filename)
CREATE POLICY "Users can view their own payment slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-slips' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow service role to access all payment slips for verification
CREATE POLICY "Service role can access all payment slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-slips'
  AND auth.role() = 'service_role'
);