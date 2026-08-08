create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  subscription jsonb not null,
  notify_time time not null,
  timezone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: lock down the table so only service role can access it
alter table public.push_subscriptions enable row level security;

-- pg_cron requires the 'pg_cron' extension
create extension if not exists pg_cron;

-- Set up the cron job to run every minute
-- It calls the Edge Function "send-daily-verse"
-- Note: Replace the URL with the actual project URL, or use the `net.http_post` extension if installed.
-- Wait, pg_cron calling Edge Functions natively in Supabase is usually done via `pg_net`.
create extension if not exists pg_net;

select cron.schedule(
  'send-daily-verse-every-minute',
  '* * * * *',
  $$
    select net.http_post(
      url:='https://cgedwigippdjvzxtmyyy.supabase.co/functions/v1/send-daily-verse',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.jwt.env', true) || '"}'::jsonb
    );
  $$
);

create or replace function public.get_subscriptions_due_for_notification()
returns setof public.push_subscriptions
language sql
security definer
as $$
  -- Compare the current time in the user's timezone to their notify_time
  select * from public.push_subscriptions
  where date_trunc('minute', timezone(timezone, now()))::time = date_trunc('minute', notify_time)::time;
$$;
