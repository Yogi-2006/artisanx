-- 1. Product Analytics (Performance)
CREATE TABLE IF NOT EXISTS product_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'passport_view', 'save', 'enquiry', 'order')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pae_product_id ON product_analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_pae_event_type ON product_analytics_events(event_type);

ALTER TABLE product_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisan can view own product analytics"
ON product_analytics_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM products p 
        WHERE p.id = product_analytics_events.product_id 
        AND p.artisan_id = auth.uid()
    )
);

CREATE POLICY "Anyone can insert public analytics"
ON product_analytics_events FOR INSERT
WITH CHECK (true);


-- 2. Buyer Communication (Conversations & Messages)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID REFERENCES buyer_enquiries(id) ON DELETE CASCADE UNIQUE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    artisan_id UUID REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_artisan ON conversations(artisan_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (auth.uid() = artisan_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can insert own conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = artisan_id OR auth.uid() = buyer_id);


CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (c.artisan_id = auth.uid() OR c.buyer_id = auth.uid())
    )
);

CREATE POLICY "Users can insert messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = conversation_id
        AND (c.artisan_id = auth.uid() OR c.buyer_id = auth.uid())
    )
);

CREATE POLICY "Users can update read status of received messages"
ON messages FOR UPDATE
USING (
    auth.uid() != sender_id AND
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (c.artisan_id = auth.uid() OR c.buyer_id = auth.uid())
    )
);


-- 3. Reviews
CREATE TABLE IF NOT EXISTS buyer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    artisan_id UUID REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating_overall INTEGER CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_quality INTEGER CHECK (rating_quality >= 1 AND rating_quality <= 5),
    rating_communication INTEGER CHECK (rating_communication >= 1 AND rating_communication <= 5),
    rating_timeliness INTEGER CHECK (rating_timeliness >= 1 AND rating_timeliness <= 5),
    review_text TEXT,
    is_verified_buyer BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON buyer_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_artisan ON buyer_reviews(artisan_id);

ALTER TABLE buyer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON buyer_reviews FOR SELECT
USING (true);

CREATE POLICY "Only buyer can insert reviews for completed orders"
ON buyer_reviews FOR INSERT
WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = order_id
        AND o.status = 'completed'
        AND o.buyer_id = auth.uid()
    )
);
