-- 019_marketplace_grants.sql

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_revisions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_status_history TO authenticated;
