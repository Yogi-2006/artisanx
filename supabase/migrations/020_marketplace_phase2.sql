-- 020_marketplace_phase2.sql

-------------------------------------------------------------------------------
-- 1. Modify products table for Inventory & Capacity
-------------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_made_to_order BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS monthly_capacity INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Update status constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check 
  CHECK (status IN ('draft', 'published', 'out_of_stock', 'made_to_order', 'temporarily_unavailable', 'archived'));

-------------------------------------------------------------------------------
-- 2. product_variants
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('colour', 'size', 'pattern')),
    value TEXT NOT NULL,
    stock_quantity INTEGER,
    price_adjustment NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisans can manage own product variants" ON product_variants FOR ALL 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.artisan_id = auth.uid()));
CREATE POLICY "Anyone can view product variants" ON product_variants FOR SELECT 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.status IN ('published', 'made_to_order')));

-- Grants for product_variants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT SELECT ON public.product_variants TO anon;

-------------------------------------------------------------------------------
-- 3. Variant Tracking in Enquiries & Orders
-------------------------------------------------------------------------------
ALTER TABLE buyer_enquiries ADD COLUMN IF NOT EXISTS requested_variant JSONB;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS variant_snapshot JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_snapshot JSONB;

-------------------------------------------------------------------------------
-- 4. order_cancellations
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    cancelled_by_role TEXT NOT NULL CHECK (cancelled_by_role IN ('artisan', 'buyer', 'system')),
    cancelled_by_user UUID REFERENCES users(id),
    reason TEXT NOT NULL CHECK (reason IN ('Material unavailable', 'Unable to meet quantity', 'Production delay', 'Buyer request', 'Pricing disagreement', 'Other')),
    notes TEXT,
    previous_status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_cancellations_order_id ON order_cancellations(order_id);

ALTER TABLE order_cancellations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisans can read and insert order cancellations" ON order_cancellations FOR ALL
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.artisan_id = auth.uid()));
CREATE POLICY "Buyers can read and insert order cancellations" ON order_cancellations FOR ALL
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));

-- Grants for order_cancellations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_cancellations TO authenticated;
