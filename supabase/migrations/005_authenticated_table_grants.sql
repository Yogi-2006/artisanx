-- 005_authenticated_table_grants.sql

-- Grant full CRUD base privileges for operational tables to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artisan_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_transcripts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_inputs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_passports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_enquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facilitator_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_guidance_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guidance_events TO authenticated;

-- Grant Read-Only base privileges for configuration tables to authenticated users
GRANT SELECT ON public.guidance_workflows TO authenticated;
GRANT SELECT ON public.guidance_steps TO authenticated;
