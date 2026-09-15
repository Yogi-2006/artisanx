CREATE TABLE facilitator_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facilitator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE facilitator_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view activity" ON facilitator_activities FOR SELECT TO authenticated USING (true);
