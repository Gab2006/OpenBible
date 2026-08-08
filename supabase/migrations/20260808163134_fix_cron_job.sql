-- Rimuovi il cron job esistente
select cron.unschedule('send-daily-verse-every-minute');

-- Ricrea il cron job senza l'header "Authorization: Bearer NULL" che causa il fallimento
select cron.schedule(
  'send-daily-verse-every-minute',
  '* * * * *',
  $$
    select net.http_post(
      url:='https://cgedwigippdjvzxtmyyy.supabase.co/functions/v1/send-daily-verse',
      headers:='{"Content-Type": "application/json"}'::jsonb
    );
  $$
);
