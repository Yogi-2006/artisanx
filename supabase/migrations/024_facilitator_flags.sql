-- 024_facilitator_flags.sql
-- Add flags and update review_status for the full correction loop

ALTER TABLE facilitator_reviews DROP CONSTRAINT IF EXISTS facilitator_reviews_review_status_check;
ALTER TABLE facilitator_reviews ADD CONSTRAINT facilitator_reviews_review_status_check 
  CHECK (review_status IN ('pending', 'approved', 'needs_changes', 'resubmitted'));

ALTER TABLE facilitator_reviews ADD COLUMN IF NOT EXISTS flags TEXT[];
