-- 002_auth_user_sync.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, role, preferred_language, guidance_level)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    NULL,
    'en',
    'beginner'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users (idempotent)
INSERT INTO public.users (id, email, phone, role, preferred_language, guidance_level)
SELECT id, email, phone, NULL, 'en', 'beginner'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
