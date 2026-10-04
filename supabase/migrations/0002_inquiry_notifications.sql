-- Wires the inquiries table to the send-inquiry-email Edge Function: an AFTER INSERT trigger for
-- instant notification, and a daily pg_cron job that retries whatever did not get sent.
--
-- The function's URL and shared secret are read from Supabase Vault (see supabase/README.md):
--   inquiry_notify_url     e.g. https://<project-ref>.supabase.co/functions/v1/send-inquiry-email
--   inquiry_notify_secret  the same value as the function's WEBHOOK_SECRET
-- Until they exist nothing is sent and rows simply stay "pending" for the retry to pick up.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- Queue the HTTP call to the Edge Function. net.http_post only queues the request (it is sent
-- after the transaction commits), and any error here is swallowed: a notification problem must
-- never fail or roll back an inquiry.
create function public.notify_inquiry_created() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fn_url text;
  fn_secret text;
begin
  begin
    select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'inquiry_notify_url';
    select decrypted_secret into fn_secret from vault.decrypted_secrets where name = 'inquiry_notify_secret';
    if fn_url is not null and fn_secret is not null then
      perform net.http_post(
        url := fn_url,
        body := jsonb_build_object('id', new.id),
        headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', fn_secret),
        timeout_milliseconds := 10000
      );
    end if;
  exception when others then
    null;
  end;
  return new;
end;
$$;

create trigger inquiries_notify
  after insert on public.inquiries
  for each row execute function public.notify_inquiry_created();

-- Ask the Edge Function to retry everything that needs it. The cron job calls this, and so can
-- you:  select public.trigger_inquiry_retry();
create function public.trigger_inquiry_retry() returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  fn_url text;
  fn_secret text;
begin
  select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'inquiry_notify_url';
  select decrypted_secret into fn_secret from vault.decrypted_secrets where name = 'inquiry_notify_secret';
  if fn_url is null or fn_secret is null then
    raise exception 'Vault secrets inquiry_notify_url / inquiry_notify_secret are not set';
  end if;
  return net.http_post(
    url := fn_url,
    body := jsonb_build_object('mode', 'retry'),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', fn_secret),
    timeout_milliseconds := 120000
  );
end;
$$;

revoke all on function public.notify_inquiry_created() from public, anon, authenticated;
revoke all on function public.trigger_inquiry_retry() from public, anon, authenticated;

-- Daily at 03:00 UTC (08:30 IST). Re-running the migration replaces the job of the same name.
select cron.schedule('retry-inquiry-emails', '0 3 * * *', $cron$ select public.trigger_inquiry_retry(); $cron$);
