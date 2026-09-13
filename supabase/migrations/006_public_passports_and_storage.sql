-- 006_public_passports_and_storage.sql

-- 1. Create qr-codes bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qr-codes', 'qr-codes', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for qr-codes
CREATE POLICY "Public read access for qr-codes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can manage qr-codes" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'qr-codes');

-- 3. Grants for anon to read passports and published products
-- This allows the unauthenticated backend client to fetch public passport data
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_passports TO anon;
