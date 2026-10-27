-- Supabase Row Level Security (RLS) & Public API Hardening Script
-- Bu script, Supabase'in açık PostgREST API'si üzerinden veri sızıntılarını ve yetkisiz erişimleri önler.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;

-- Halka açık PostgREST rollerinin (anon ve authenticated) public şemaya izinsiz erişimini sonlandır
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;
