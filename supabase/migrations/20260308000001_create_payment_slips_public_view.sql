-- Create a public view that exposes ONLY the payment proof URLs (no personal data)
CREATE OR REPLACE VIEW public.payment_slips_public AS
SELECT
    id,
    payment_proof_url
FROM public.orders
WHERE payment_proof_url IS NOT NULL
  AND status IN ('paid', 'processing', 'completed')
ORDER BY updated_at DESC;

-- Allow anonymous users to read from this view
GRANT SELECT ON public.payment_slips_public TO anon;
GRANT SELECT ON public.payment_slips_public TO authenticated;
