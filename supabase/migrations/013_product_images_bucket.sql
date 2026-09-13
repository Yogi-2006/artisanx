-- 013_product_images_bucket.sql

-- 1. Create the product-images bucket and make it public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to product-images
CREATE POLICY "Public read access for product-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- 3. Allow authenticated users to manage product-images
CREATE POLICY "Authenticated users can manage product-images" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'product-images');
