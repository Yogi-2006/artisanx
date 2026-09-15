-- 025_support_and_disputes.sql

-------------------------------------------------------------------------------
-- 1. support_requests
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('profile_help', 'product_creation_help', 'pricing_help', 'catalogue_help', 'buyer_enquiry_help', 'order_issue', 'other')),
    issue_summary TEXT NOT NULL,
    description TEXT NOT NULL,
    related_id UUID, -- Optional reference (e.g. order_id, product_id, enquiry_id)
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'waiting_for_artisan', 'resolved', 'closed')) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_support_requests_artisan_id ON support_requests(artisan_id);

CREATE TRIGGER update_support_requests_updated_at
BEFORE UPDATE ON support_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Artisans can manage their own support requests
CREATE POLICY "Artisans can view own support requests" ON support_requests FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Artisans can insert own support requests" ON support_requests FOR INSERT WITH CHECK (artisan_id = auth.uid());
CREATE POLICY "Artisans can update own support requests" ON support_requests FOR UPDATE USING (artisan_id = auth.uid());

-- Facilitators access is typically granted via service_role or specific roles, 
-- but let's add a policy for anyone with role 'facilitator' just in case RLS is evaluated for them
CREATE POLICY "Facilitators can view all support requests" ON support_requests FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));
CREATE POLICY "Facilitators can update all support requests" ON support_requests FOR UPDATE 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));

-------------------------------------------------------------------------------
-- 2. disputes
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artisan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('product_damaged', 'quantity_mismatch', 'quality_disagreement', 'product_differs_from_description', 'production_delay', 'delivery_issue', 'cancellation_disagreement', 'other')),
    raised_by_role TEXT NOT NULL CHECK (raised_by_role IN ('buyer', 'artisan')),
    buyer_explanation TEXT,
    artisan_explanation TEXT,
    status TEXT NOT NULL CHECK (status IN ('open', 'under_review', 'waiting_for_buyer', 'waiting_for_artisan', 'resolved', 'closed')) DEFAULT 'open',
    facilitator_notes TEXT,
    resolution_summary TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_buyer_id ON disputes(buyer_id);
CREATE INDEX idx_disputes_artisan_id ON disputes(artisan_id);

CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own disputes" ON disputes FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Buyers can insert own disputes" ON disputes FOR INSERT WITH CHECK (buyer_id = auth.uid() AND raised_by_role = 'buyer');
CREATE POLICY "Buyers can update own disputes" ON disputes FOR UPDATE USING (buyer_id = auth.uid());

CREATE POLICY "Artisans can view own disputes" ON disputes FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Artisans can insert own disputes" ON disputes FOR INSERT WITH CHECK (artisan_id = auth.uid() AND raised_by_role = 'artisan');
CREATE POLICY "Artisans can update own disputes" ON disputes FOR UPDATE USING (artisan_id = auth.uid());

CREATE POLICY "Facilitators can view all disputes" ON disputes FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));
CREATE POLICY "Facilitators can update all disputes" ON disputes FOR UPDATE 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));

-------------------------------------------------------------------------------
-- 3. Modify conversations
-------------------------------------------------------------------------------
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS support_request_id UUID REFERENCES support_requests(id) ON DELETE CASCADE UNIQUE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE UNIQUE;

-- We need to allow buyer_id to be nullable because support requests only involve Artisan and Facilitator
ALTER TABLE conversations ALTER COLUMN buyer_id DROP NOT NULL;

-- Update RLS policies for conversations to allow facilitators
CREATE POLICY "Facilitators can view all conversations" ON conversations FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));
CREATE POLICY "Facilitators can insert conversations" ON conversations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));
CREATE POLICY "Facilitators can update conversations" ON conversations FOR UPDATE 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));

-- Update RLS policies for messages to allow facilitators
CREATE POLICY "Facilitators can view all messages" ON messages FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));
CREATE POLICY "Facilitators can insert messages" ON messages FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));
CREATE POLICY "Facilitators can update messages" ON messages FOR UPDATE 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'facilitator'));

-- Need to grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disputes TO authenticated;
