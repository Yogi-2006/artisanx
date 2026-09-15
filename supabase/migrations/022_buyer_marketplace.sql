-- 022_buyer_marketplace.sql

-------------------------------------------------------------------------------
-- 1. Add state to artisan_profiles
-------------------------------------------------------------------------------
ALTER TABLE artisan_profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE artisan_profiles ADD COLUMN IF NOT EXISTS district TEXT;

-------------------------------------------------------------------------------
-- 2. saved_products (Wishlist)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(buyer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_products_buyer_id ON saved_products(buyer_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_product_id ON saved_products(product_id);

ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can manage own saved products" ON saved_products FOR ALL 
USING (buyer_id = auth.uid());

-- Grants for saved_products
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_products TO authenticated;
