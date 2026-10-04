-- An inquiry needs a phone number or an email address, not necessarily both.
-- Empty values are stored as null; each one given is still checked for length and shape.

alter table public.inquiries
  alter column phone drop not null,
  alter column email drop not null;

alter table public.inquiries
  drop constraint if exists inquiries_phone_check,
  drop constraint if exists inquiries_email_check;

alter table public.inquiries
  add constraint inquiries_phone_check check (phone is null or char_length(phone) between 7 and 20),
  add constraint inquiries_email_check
    check (email is null or (char_length(email) between 5 and 254 and email like '%_@_%._%')),
  add constraint inquiries_contact_check check (phone is not null or email is not null);

-- Same rules as before. An empty phone or email is stored as null, and the repeat check compares
-- the email when there is one, otherwise the phone number.
create or replace function public.submit_inquiry(
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
  v_phone text := nullif(btrim(p_phone), '');
  v_email text := nullif(btrim(p_email), '');
  new_id uuid;
begin
  if v_phone is null and v_email is null then
    return jsonb_build_object('status', 'invalid');
  end if;

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
    where message = p_message
      and created_at > now() - interval '10 minutes'
      and case
        when v_email is not null then lower(email) = lower(v_email)
        else email is null and phone = v_phone
      end
  ) then
    return jsonb_build_object('status', 'duplicate');
  end if;

  insert into public.inquiries (name, phone, email, message, source, ip_hash)
  values (p_name, v_phone, v_email, p_message, p_source, p_ip_hash)
  returning id into new_id;

  return jsonb_build_object('status', 'ok', 'id', new_id);
end;
$$;

-- Show the phone number too, since an inquiry may have no email.
create or replace view public.inquiries_needing_attention with (security_invoker = true) as
  select id, created_at, name, email, notify_status, notify_attempts, notify_last_attempt_at, notify_last_error, phone
  from public.inquiries
  where notify_status in ('failed', 'dead')
     or (notify_status = 'pending' and created_at < now() - interval '15 minutes')
     or (notify_status = 'sending' and notify_last_attempt_at < now() - interval '10 minutes')
  order by created_at desc;
