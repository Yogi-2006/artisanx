-- 027_facilitator_profiles.sql
-- Add facilitator profile fields to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS region_served TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS areas_of_expertise TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS short_bio TEXT;
