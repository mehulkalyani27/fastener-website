-- Contact-form inquiries and the bookkeeping for their notification email.
--
-- Access model: both tables are closed to the public API (RLS on, no policies, grants revoked).
--   * the website calls submit_inquiry() with the public (anon) key — it can only add inquiries;
--   * the send-inquiry-email Edge Function uses the service role and the claim_/finish_ functions.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  email text not null check (char_length(email) between 5 and 254 and email like '%_@_%._%'),
  message text not null check (char_length(message) between 10 and 2000),

  -- Where it came from and a salted hash of the sender's IP (abuse limits only; never the raw IP).
  source text check (char_length(source) <= 200),
  ip_hash text check (char_length(ip_hash) <= 128),

  -- Email notification state: pending -> sending -> sent | failed (retried) -> dead (gave up).
  notify_status text not null default 'pending'
    check (notify_status in ('pending', 'sending', 'sent', 'failed', 'dead')),
  notify_attempts integer not null default 0,
  notify_last_attempt_at timestamptz,
  notify_last_error text check (char_length(notify_last_error) <= 500),
  resend_email_id text,
  notified_at timestamptz
);

-- One row per delivery attempt: the full history behind notify_status.
create table public.inquiry_email_attempts (
  id bigint generated always as identity primary key,
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  attempted_at timestamptz not null default now(),
  outcome text not null check (outcome in ('sent', 'failed')),
  http_status integer,
  error text check (char_length(error) <= 500),
  resend_email_id text
);

create index inquiries_ip_hash_created_idx on public.inquiries (ip_hash, created_at) where ip_hash is not null;
create index inquiries_created_idx on public.inquiries (created_at);
create index inquiries_unsent_idx on public.inquiries (notify_status, created_at) where notify_status <> 'sent';
create index inquiry_email_attempts_inquiry_idx on public.inquiry_email_attempts (inquiry_id, attempted_at);

alter table public.inquiries enable row level security;
alter table public.inquiry_email_attempts enable row level security;
revoke all on public.inquiries, public.inquiry_email_attempts from anon, authenticated;

-- Everything that needs attention, newest first (check it in the Supabase dashboard).
create view public.inquiries_needing_attention with (security_invoker = true) as
  select id, created_at, name, email, notify_status, notify_attempts, notify_last_attempt_at, notify_last_error
  from public.inquiries
  where notify_status in ('failed', 'dead')
     or (notify_status = 'pending' and created_at < now() - interval '15 minutes')
     or (notify_status = 'sending' and notify_last_attempt_at < now() - interval '10 minutes')
  order by created_at desc;
revoke all on public.inquiries_needing_attention from anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Public entry point: the only thing the website's key can do.
-- Limits: 5 per sender per hour, 60 in total per hour (bounds spam and the email quota),
-- and an identical resubmission within 10 minutes is accepted without storing it again.
-- ---------------------------------------------------------------------------------------------
create function public.submit_inquiry(
  p_name text,
  p_phone text,
  p_email text,
  p_message text,
  p_source text default null,
  p_ip_hash text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if p_ip_hash is not null and (
    select count(*) from public.inquiries
    where ip_hash = p_ip_hash and created_at > now() - interval '1 hour'
  ) >= 5 then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  if (select count(*) from public.inquiries where created_at > now() - interval '1 hour') >= 60 then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  if exists (
    select 1 from public.inquiries
    where lower(email) = lower(p_email) and message = p_message and created_at > now() - interval '10 minutes'
  ) then
    return jsonb_build_object('status', 'duplicate');
  end if;

  insert into public.inquiries (name, phone, email, message, source, ip_hash)
  values (p_name, p_phone, p_email, p_message, p_source, p_ip_hash)
  returning id into new_id;

  return jsonb_build_object('status', 'ok', 'id', new_id);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Notification bookkeeping, used by the Edge Function (service role only).
-- ---------------------------------------------------------------------------------------------

-- Claim one inquiry for sending: pending/failed, or "sending" for over 10 minutes (a crashed run).
-- Atomic, so a trigger call and the daily retry can never send the same inquiry twice.
create function public.claim_inquiry_for_notify(p_id uuid, p_max_attempts integer default 5)
returns setof public.inquiries
language sql
security definer
set search_path = ''
as $$
  update public.inquiries
  set notify_status = 'sending',
      notify_attempts = notify_attempts + 1,
      notify_last_attempt_at = now()
  where id = p_id
    and notify_attempts < p_max_attempts
    and (
      notify_status in ('pending', 'failed')
      or (notify_status = 'sending' and notify_last_attempt_at < now() - interval '10 minutes')
    )
  returning *;
$$;

-- Claim the oldest inquiry that needs a retry: failed, stuck "sending", or "pending" for over 15
-- minutes (the trigger call never arrived). Only the last 30 days; skip-locked keeps runs apart.
create function public.claim_next_inquiry_retry(p_max_attempts integer default 5)
returns setof public.inquiries
language sql
security definer
set search_path = ''
as $$
  update public.inquiries
  set notify_status = 'sending',
      notify_attempts = notify_attempts + 1,
      notify_last_attempt_at = now()
  where id = (
    select id from public.inquiries
    where notify_attempts < p_max_attempts
      and created_at > now() - interval '30 days'
      and (
        notify_status = 'failed'
        or (notify_status = 'pending' and created_at < now() - interval '15 minutes')
        or (notify_status = 'sending' and notify_last_attempt_at < now() - interval '10 minutes')
      )
    order by created_at
    limit 1
    for update skip locked
  )
  returning *;
$$;

-- Record the outcome of an attempt. A rate-limited attempt (p_refund_attempt) does not count
-- against the limit, so a day of exhausted email quota cannot push inquiries to "dead".
create function public.finish_inquiry_notify(
  p_id uuid,
  p_ok boolean,
  p_http_status integer default null,
  p_error text default null,
  p_resend_id text default null,
  p_refund_attempt boolean default false,
  p_max_attempts integer default 5
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inquiry_email_attempts (inquiry_id, outcome, http_status, error, resend_email_id)
  values (p_id, case when p_ok then 'sent' else 'failed' end, p_http_status, left(p_error, 500), p_resend_id);

  if p_ok then
    update public.inquiries
    set notify_status = 'sent', notified_at = now(), resend_email_id = p_resend_id, notify_last_error = null
    where id = p_id;
  else
    update public.inquiries
    set notify_attempts = case when p_refund_attempt then greatest(notify_attempts - 1, 0) else notify_attempts end,
        notify_status = case
          when not p_refund_attempt and notify_attempts >= p_max_attempts then 'dead'
          else 'failed'
        end,
        notify_last_error = left(p_error, 500)
    where id = p_id;
  end if;
end;
$$;

-- Function privileges: nothing is public; the website may only submit, the service role may notify.
revoke all on function public.submit_inquiry(text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.claim_inquiry_for_notify(uuid, integer) from public, anon, authenticated;
revoke all on function public.claim_next_inquiry_retry(integer) from public, anon, authenticated;
revoke all on function public.finish_inquiry_notify(uuid, boolean, integer, text, text, boolean, integer) from public, anon, authenticated;

grant execute on function public.submit_inquiry(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.claim_inquiry_for_notify(uuid, integer) to service_role;
grant execute on function public.claim_next_inquiry_retry(integer) to service_role;
grant execute on function public.finish_inquiry_notify(uuid, boolean, integer, text, text, boolean, integer) to service_role;
grant select on public.inquiries_needing_attention to service_role;
