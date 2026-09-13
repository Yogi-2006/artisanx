-- 017_add_enhanced_quality_flag.sql
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS enhanced_quality BOOLEAN DEFAULT false;
