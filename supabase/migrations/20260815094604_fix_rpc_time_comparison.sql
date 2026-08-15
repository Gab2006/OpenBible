create or replace function public.get_subscriptions_due_for_notification()
returns setof public.push_subscriptions
language sql
security definer
as $$
  -- Compare the current time in the user's timezone to their notify_time using to_char for robust formatting
  select * from public.push_subscriptions
  where to_char(timezone(timezone, now()), 'HH24:MI') = to_char(notify_time, 'HH24:MI');
$$;
