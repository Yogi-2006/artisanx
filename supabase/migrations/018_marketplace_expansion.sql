-- 018_marketplace_expansion.sql

-------------------------------------------------------------------------------
-- 1. Extend buyer_enquiries status
-------------------------------------------------------------------------------
ALTER TABLE buyer_enquiries DROP CONSTRAINT IF EXISTS buyer_enquiries_status_check;
ALTER TABLE buyer_enquiries ADD CONSTRAINT buyer_enquiries_status_check 
  CHECK (status IN ('new', 'viewed', 'responded', 'quote_sent', 'accepted', 'rejected', 'closed'));

-------------------------------------------------------------------------------
-- 2. quotations
-------------------------------------------------------------------------------
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id TEXT UNIQUE NOT NULL,
    enquiry_id UUID NOT NULL REFERENCES buyer_enquiries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    artisan_id UUID NOT NULL REFERENCES users(id),
    current_version INTEGER DEFAULT 1,
    status TEXT CHECK (status IN ('draft', 'sent', 'changes_requested', 'accepted', 'rejected')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quotations_enquiry_id ON quotations(enquiry_id);
CREATE INDEX idx_quotations_artisan_id ON quotations(artisan_id);
CREATE INDEX idx_quotations_buyer_id ON quotations(buyer_id);

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisans can manage own quotations" ON quotations FOR ALL USING (artisan_id = auth.uid());
CREATE POLICY "Buyers can read own quotations" ON quotations FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Buyers can update own quotations" ON quotations FOR UPDATE USING (buyer_id = auth.uid());

-------------------------------------------------------------------------------
-- 3. quotation_revisions
-------------------------------------------------------------------------------
CREATE TABLE quotation_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    moq INTEGER,
    customization_cost NUMERIC DEFAULT 0,
    production_lead_time_days INTEGER,
    expected_dispatch_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    artisan_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(quotation_id, version)
);

CREATE INDEX idx_quotation_revisions_quotation_id ON quotation_revisions(quotation_id);

ALTER TABLE quotation_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisans can manage own quotation revisions" ON quotation_revisions FOR ALL 
USING (EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_id AND q.artisan_id = auth.uid()));
CREATE POLICY "Buyers can read own quotation revisions" ON quotation_revisions FOR SELECT 
USING (EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_id AND q.buyer_id = auth.uid()));

-------------------------------------------------------------------------------
-- 4. orders
-------------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id TEXT UNIQUE NOT NULL,
    quotation_id UUID UNIQUE REFERENCES quotations(id),
    enquiry_id UUID REFERENCES buyer_enquiries(id),
    product_id UUID NOT NULL REFERENCES products(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    artisan_id UUID NOT NULL REFERENCES users(id),
    status TEXT CHECK (status IN ('confirmed', 'in_production', 'ready_for_dispatch', 'dispatched', 'delivered', 'completed', 'cancellation_requested', 'cancelled', 'return_requested', 'returned', 'disputed')) DEFAULT 'confirmed',
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_order_value NUMERIC NOT NULL,
    customization_details TEXT,
    product_snapshot JSONB NOT NULL,
    order_date TIMESTAMPTZ DEFAULT now(),
    expected_completion_date TIMESTAMPTZ,
    expected_dispatch_date TIMESTAMPTZ,
    actual_dispatch_date TIMESTAMPTZ,
    buyer_notes TEXT,
    artisan_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_artisan_id ON orders(artisan_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisans can manage own orders" ON orders FOR ALL USING (artisan_id = auth.uid());
CREATE POLICY "Buyers can read own orders" ON orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Buyers can update own orders" ON orders FOR UPDATE USING (buyer_id = auth.uid());

-------------------------------------------------------------------------------
-- 5. order_status_history
-------------------------------------------------------------------------------
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES users(id),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisans can manage order history" ON order_status_history FOR ALL 
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.artisan_id = auth.uid()));
CREATE POLICY "Buyers can read order history" ON order_status_history FOR SELECT 
USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));
