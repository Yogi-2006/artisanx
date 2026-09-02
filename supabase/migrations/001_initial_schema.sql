-- 001_initial_schema.sql

-- Setup trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-------------------------------------------------------------------------------
-- 1. users
-------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('artisan', 'buyer', 'facilitator')),
    display_name TEXT,
    preferred_language TEXT CHECK (preferred_language IN ('en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur')),
    guidance_level TEXT CHECK (guidance_level IN ('beginner', 'intermediate', 'experienced')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Anyone can read artisan basic profiles" ON users FOR SELECT USING (role = 'artisan');
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);


-------------------------------------------------------------------------------
-- 2. artisan_profiles
-------------------------------------------------------------------------------
CREATE TABLE artisan_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artisan_name TEXT,
    business_name TEXT,
    craft_type TEXT,
    craft_category TEXT,
    location TEXT,
    cooperative_name TEXT,
    profile_photo_url TEXT,
    craft_story TEXT,
    years_experience INTEGER,
    production_capacity TEXT,
    verification_status TEXT CHECK (verification_status IN ('self_declared', 'facilitator_reviewed', 'cooperative_verified', 'documentation_pending')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_artisan_profiles_user_id ON artisan_profiles(user_id);

CREATE TRIGGER update_artisan_profiles_updated_at
BEFORE UPDATE ON artisan_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE artisan_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage own profile" ON artisan_profiles FOR ALL USING (user_id = auth.uid());



-------------------------------------------------------------------------------
-- 3. products
-------------------------------------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    category TEXT,
    tags TEXT[],
    materials JSONB,
    care_instructions TEXT,
    dimensions TEXT,
    stock_quantity INTEGER,
    moq INTEGER,
    lead_time_days INTEGER,
    price NUMERIC,
    min_safe_price NUMERIC,
    suggested_price NUMERIC,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    readiness_score INTEGER CHECK (readiness_score >= 0 AND readiness_score <= 100),
    customisation_available BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_artisan_id ON products(artisan_id);
CREATE INDEX idx_products_status ON products(status);

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage own products" ON products FOR ALL USING (artisan_id = auth.uid());
CREATE POLICY "Anyone can view published products" ON products FOR SELECT USING (status = 'published');


-------------------------------------------------------------------------------
-- 4. product_images
-------------------------------------------------------------------------------
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false,
    original_url TEXT,
    enhanced_url TEXT,
    quality_score INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage own product images" ON product_images FOR ALL 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.artisan_id = auth.uid()));

CREATE POLICY "Anyone can view images of published products" ON product_images FOR SELECT 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.status = 'published'));


-------------------------------------------------------------------------------
-- 5. voice_records
-------------------------------------------------------------------------------
CREATE TABLE voice_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    language TEXT CHECK (language IN ('en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur')),
    duration_seconds NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_records_product_id ON voice_records(product_id);
CREATE INDEX idx_voice_records_user_id ON voice_records(user_id);

ALTER TABLE voice_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own voice records" ON voice_records FOR ALL USING (user_id = auth.uid());


-------------------------------------------------------------------------------
-- 6. voice_transcripts
-------------------------------------------------------------------------------
CREATE TABLE voice_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_record_id UUID NOT NULL REFERENCES voice_records(id) ON DELETE CASCADE,
    original_text TEXT,
    original_language TEXT CHECK (original_language IN ('en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur')),
    translated_text TEXT,
    translated_language TEXT CHECK (translated_language IN ('en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur')),
    ai_generated_title TEXT,
    ai_generated_description TEXT,
    ai_generated_category TEXT,
    ai_generated_tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_transcripts_voice_record_id ON voice_transcripts(voice_record_id);

ALTER TABLE voice_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own voice transcripts" ON voice_transcripts FOR ALL 
USING (EXISTS (SELECT 1 FROM voice_records vr WHERE vr.id = voice_record_id AND vr.user_id = auth.uid()));


-------------------------------------------------------------------------------
-- 7. pricing_inputs
-------------------------------------------------------------------------------
CREATE TABLE pricing_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_costs JSONB,
    labor_hours NUMERIC,
    labor_rate NUMERIC,
    packaging_cost NUMERIC,
    overhead_cost NUMERIC,
    logistics_cost NUMERIC,
    profit_margin_percent NUMERIC,
    calculated_min_price NUMERIC,
    calculated_suggested_price NUMERIC,
    price_range_low NUMERIC,
    price_range_high NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pricing_inputs_product_id ON pricing_inputs(product_id);

CREATE TRIGGER update_pricing_inputs_updated_at
BEFORE UPDATE ON pricing_inputs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE pricing_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage own pricing inputs" ON pricing_inputs FOR ALL 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.artisan_id = auth.uid()));


-------------------------------------------------------------------------------
-- 8. product_passports
-------------------------------------------------------------------------------
CREATE TABLE product_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    qr_code_url TEXT,
    shareable_url TEXT,
    passport_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_passports_product_id ON product_passports(product_id);

ALTER TABLE product_passports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage own product passports" ON product_passports FOR ALL 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.artisan_id = auth.uid()));

CREATE POLICY "Anyone can view passports of published products" ON product_passports FOR SELECT 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.status = 'published'));


-------------------------------------------------------------------------------
-- 9. buyer_enquiries
-------------------------------------------------------------------------------
CREATE TABLE buyer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    artisan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER,
    budget NUMERIC,
    delivery_deadline TIMESTAMPTZ,
    customisation_request TEXT,
    status TEXT CHECK (status IN ('new', 'viewed', 'responded', 'closed')) DEFAULT 'new',
    artisan_response TEXT CHECK (artisan_response IN ('interested', 'need_details', 'cannot_fulfil')),
    artisan_response_note TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_buyer_enquiries_product_id ON buyer_enquiries(product_id);
CREATE INDEX idx_buyer_enquiries_buyer_id ON buyer_enquiries(buyer_id);
CREATE INDEX idx_buyer_enquiries_artisan_id ON buyer_enquiries(artisan_id);

CREATE TRIGGER update_buyer_enquiries_updated_at
BEFORE UPDATE ON buyer_enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE buyer_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own enquiries" ON buyer_enquiries FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Artisans can view received enquiries" ON buyer_enquiries FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Buyers can insert enquiries" ON buyer_enquiries FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Buyers can update own enquiries" ON buyer_enquiries FOR UPDATE USING (buyer_id = auth.uid());
CREATE POLICY "Artisans can update received enquiries" ON buyer_enquiries FOR UPDATE USING (artisan_id = auth.uid());
CREATE POLICY "Buyers can delete own enquiries" ON buyer_enquiries FOR DELETE USING (buyer_id = auth.uid());


-------------------------------------------------------------------------------
-- 10. notifications
-------------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (user_id = auth.uid());


-------------------------------------------------------------------------------
-- 11. facilitator_reviews
-------------------------------------------------------------------------------
CREATE TABLE facilitator_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facilitator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    review_status TEXT CHECK (review_status IN ('pending', 'approved', 'needs_changes')),
    notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_facilitator_reviews_facilitator_id ON facilitator_reviews(facilitator_id);
CREATE INDEX idx_facilitator_reviews_product_id ON facilitator_reviews(product_id);

ALTER TABLE facilitator_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can view their product reviews" ON facilitator_reviews FOR SELECT 
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.artisan_id = auth.uid()));

CREATE POLICY "Facilitators can view and manage their reviews" ON facilitator_reviews FOR ALL 
USING (facilitator_id = auth.uid() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'facilitator'));


-------------------------------------------------------------------------------
-- 12. guidance_workflows
-------------------------------------------------------------------------------
CREATE TABLE guidance_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_key TEXT UNIQUE NOT NULL,
    title_en TEXT,
    title_ta TEXT,
    title_hi TEXT,
    title_te TEXT,
    title_kn TEXT,
    title_ml TEXT,
    title_bn TEXT,
    title_mr TEXT,
    title_ur TEXT,
    target_role TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_guidance_workflows_updated_at
BEFORE UPDATE ON guidance_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE guidance_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active guidance workflows" ON guidance_workflows FOR SELECT USING (is_active = true);


-------------------------------------------------------------------------------
-- 13. guidance_steps
-------------------------------------------------------------------------------
CREATE TABLE guidance_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES guidance_workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    screen_name TEXT,
    target_id TEXT,
    gesture_type TEXT CHECK (gesture_type IN ('point', 'tap', 'swipe', 'scroll', 'highlight', 'wait', 'success')),
    instruction_en TEXT,
    instruction_ta TEXT,
    instruction_hi TEXT,
    instruction_te TEXT,
    instruction_kn TEXT,
    instruction_ml TEXT,
    instruction_bn TEXT,
    instruction_mr TEXT,
    instruction_ur TEXT,
    expected_event TEXT,
    expected_condition TEXT,
    fallback_instruction_en TEXT,
    fallback_instruction_ta TEXT,
    fallback_instruction_hi TEXT,
    fallback_instruction_te TEXT,
    fallback_instruction_kn TEXT,
    fallback_instruction_ml TEXT,
    fallback_instruction_bn TEXT,
    fallback_instruction_mr TEXT,
    fallback_instruction_ur TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guidance_steps_workflow_id ON guidance_steps(workflow_id);

CREATE TRIGGER update_guidance_steps_updated_at
BEFORE UPDATE ON guidance_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE guidance_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read guidance steps" ON guidance_steps FOR SELECT USING (true);


-------------------------------------------------------------------------------
-- 14. user_guidance_progress
-------------------------------------------------------------------------------
CREATE TABLE user_guidance_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES guidance_workflows(id) ON DELETE CASCADE,
    workflow_version INTEGER,
    current_step_id UUID REFERENCES guidance_steps(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('not_started', 'active', 'paused', 'skipped', 'completed')) DEFAULT 'not_started',
    guidance_level TEXT CHECK (guidance_level IN ('beginner', 'intermediate', 'experienced')),
    dont_show_again BOOLEAN DEFAULT false,
    last_shown_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    skipped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, workflow_id)
);

CREATE INDEX idx_user_guidance_progress_user_id ON user_guidance_progress(user_id);
CREATE INDEX idx_user_guidance_progress_workflow_id ON user_guidance_progress(workflow_id);

CREATE TRIGGER update_user_guidance_progress_updated_at
BEFORE UPDATE ON user_guidance_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_guidance_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own guidance progress" ON user_guidance_progress FOR ALL USING (user_id = auth.uid());


-------------------------------------------------------------------------------
-- 15. guidance_events
-------------------------------------------------------------------------------
CREATE TABLE guidance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES guidance_workflows(id) ON DELETE CASCADE,
    step_id UUID REFERENCES guidance_steps(id) ON DELETE SET NULL,
    event_type TEXT CHECK (event_type IN ('GUIDE_STARTED', 'GUIDE_STEP_VIEWED', 'GUIDE_STEP_COMPLETED', 'GUIDE_PAUSED', 'GUIDE_RESUMED', 'GUIDE_SKIPPED', 'GUIDE_REPLAYED', 'GUIDE_COMPLETED', 'GUIDE_TARGET_NOT_FOUND', 'GUIDE_ERROR')),
    screen_name TEXT,
    target_id TEXT,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guidance_events_user_id ON guidance_events(user_id);
CREATE INDEX idx_guidance_events_workflow_id ON guidance_events(workflow_id);

ALTER TABLE guidance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own guidance events" ON guidance_events FOR ALL USING (user_id = auth.uid());

-- Deferred policies
CREATE POLICY "Anyone can view artisan profiles of published products" ON artisan_profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM products p 
        WHERE p.artisan_id = artisan_profiles.user_id AND p.status = 'published'
    )
);
