# Contact form: Supabase + Resend

```text
Form → Server Action → submit_inquiry() → `inquiries` row (notify_status = pending)
                              │
              AFTER INSERT trigger → pg_net → Edge Function `send-inquiry-email` → Resend
                              ▲
   pg_cron, daily 03:00 UTC ──┘ (retry mode: failed / stuck rows)
```

`notify_status`: `pending → sending → sent | failed → dead` (after 5 failed attempts). Every attempt is
logged in `inquiry_email_attempts`. "sent" means Resend accepted the email. The visitor never sees
email failures; the inquiry is already safely stored.

## One-time setup

1. **Supabase project.** Create one, then from the repo root:
   ```bash
   supabase init            # once; creates supabase/config.toml
   supabase link --project-ref <ref>
   supabase db push         # applies supabase/migrations
   ```
2. **Resend.** Create an account, verify the sending domain (SPF/DKIM DNS records) and create an API key.
   Until the domain is verified Resend only sends from `onboarding@resend.dev` to your own account email.
3. **Function secrets** (use one random string for `WEBHOOK_SECRET`, e.g. `openssl rand -hex 32`):
   ```bash
   supabase secrets set RESEND_API_KEY=re_... WEBHOOK_SECRET=<random> \
     INQUIRY_TO_EMAIL=info@sds-metacore.com \
     INQUIRY_FROM_EMAIL="Metacore Fasteners <inquiries@sds-metacore.com>"
   supabase functions deploy send-inquiry-email --no-verify-jwt
   ```
   `INQUIRY_TO_EMAIL` may list several addresses separated by commas.
4. **Tell the database where the function is** (SQL editor; the same random string as above):
   ```sql
   select vault.create_secret('https://<ref>.supabase.co/functions/v1/send-inquiry-email', 'inquiry_notify_url');
   select vault.create_secret('<random>', 'inquiry_notify_secret');
   ```
   If calls fail with "No API key found in request", also store the project's public key (migration
   `0003` sends it with every call):
   ```sql
   select vault.create_secret('<anon or publishable key>', 'inquiry_notify_apikey');
   ```
5. **Website env** (`.env.local`, and on the host): `SUPABASE_URL`, `SUPABASE_ANON_KEY` (the public key) and
   `INQUIRY_IP_SALT`. See `.env.example`. The service-role key is never needed by the website.

## Checking it works

- Submit the form, then in the dashboard: `select * from inquiries order by created_at desc;`
  A good run ends as `notify_status = 'sent'` with a `resend_email_id` within seconds.
- Attempt history: `select * from inquiry_email_attempts order by attempted_at desc;`
- Needs attention (failed, dead, or stuck): `select * from inquiries_needing_attention;`
- Run the retry now instead of waiting for 03:00 UTC: `select public.trigger_inquiry_retry();`
- Did the cron run? `select * from cron.job_run_details order by start_time desc limit 5;`
- Retry a `dead` inquiry after fixing the cause:
  ```sql
  update inquiries set notify_status = 'failed', notify_attempts = 0 where id = '<id>';
  select public.trigger_inquiry_retry();
  ```

## Things to know

- **Limits:** 5 inquiries per visitor per hour and 60 per hour in total, so spam cannot use up
  Resend's free quota (100 emails/day). A rate-limited retry does not count as an attempt.
- **Free Supabase projects can pause after about a week without activity** (verify the current policy).
  A paused project accepts no inquiries and runs no cron; upgrade or add a keep-alive if the form is quiet.
- **Visitor IP:** the website reads `x-forwarded-for` / `x-real-ip`, which is only trustworthy behind
  your host's proxy. The IP is only ever stored as a salted hash.
- **Rotating the shared secret:** set the new `WEBHOOK_SECRET` with `supabase secrets set`, then update
  the Vault secret `inquiry_notify_secret` to the same value.
