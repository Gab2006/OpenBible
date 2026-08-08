-- Fix 1: Function Search Path Mutable for get_subscriptions_due_for_notification
alter function public.get_subscriptions_due_for_notification() set search_path = '';

-- Fix 2 & 3: Revoke execute from public/anon/authenticated on SECURITY DEFINER functions
revoke execute on function public.get_subscriptions_due_for_notification() from public, anon, authenticated;
grant execute on function public.get_subscriptions_due_for_notification() to service_role;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role';
  END IF;
END $$;

-- Fix 4: Move pg_net out of the public schema
create schema if not exists extensions;
drop extension if exists pg_net;
create extension pg_net schema extensions;
