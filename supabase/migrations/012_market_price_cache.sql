CREATE TABLE market_price_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_signature TEXT UNIQUE NOT NULL,
    price_low NUMERIC(10,2),
    price_high NUMERIC(10,2),
    price_median NUMERIC(10,2),
    source_listings JSONB,
    fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_market_price_cache_query_signature ON market_price_cache(query_signature);

ALTER TABLE pricing_inputs 
ADD COLUMN market_price_low NUMERIC(10,2) NULL,
ADD COLUMN market_price_high NUMERIC(10,2) NULL,
ADD COLUMN market_price_reasoning TEXT NULL,
ADD COLUMN market_data_source TEXT DEFAULT 'live_search',
ADD COLUMN market_sample_listings JSONB NULL,
ADD COLUMN final_price_basis TEXT NULL;

ALTER TABLE pricing_inputs
ADD CONSTRAINT check_final_price_basis 
CHECK (final_price_basis IS NULL OR final_price_basis IN ('cost_floor', 'market_estimate', 'manual'));
