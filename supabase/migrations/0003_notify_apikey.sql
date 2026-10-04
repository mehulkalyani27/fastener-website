-- The Supabase gateway can reject calls to an Edge Function that carry no API key ("No API key found
-- in request"). Send the project's public key too when the optional Vault secret exists:
--   inquiry_notify_apikey   the project's anon / publishable key
-- A legacy anon key is a JWT, so it is also sent as a bearer token; publishable keys are not JWTs.

create function public.inquiry_notify_headers(fn_secret text) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  fn_key text;
  headers jsonb := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', fn_secret);
begin
  select decrypted_secret into fn_key from vault.decrypted_secrets where name = 'inquiry_notify_apikey';
  if fn_key is not null then
    headers := headers || jsonb_build_object('apikey', fn_key);
    if fn_key like 'eyJ%' then
      headers := headers || jsonb_build_object('Authorization', 'Bearer ' || fn_key);
    end if;
  end if;
  return headers;
end;
$$;

create or replace function public.notify_inquiry_created() returns trigger
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
        headers := public.inquiry_notify_headers(fn_secret),
        timeout_milliseconds := 10000
      );
    end if;
  exception when others then
    null;
  end;
  return new;
end;
$$;

create or replace function public.trigger_inquiry_retry() returns bigint
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
    headers := public.inquiry_notify_headers(fn_secret),
    timeout_milliseconds := 120000
  );
end;
$$;

revoke all on function public.inquiry_notify_headers(text) from public, anon, authenticated;
revoke all on function public.notify_inquiry_created() from public, anon, authenticated;
revoke all on function public.trigger_inquiry_retry() from public, anon, authenticated;
