-- 023_buyer_features_6_to_10.sql

ALTER TABLE buyer_enquiries ADD COLUMN IF NOT EXISTS buyer_message TEXT;
