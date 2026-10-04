// Supabase Edge Function (Deno). Called by the inquiries INSERT trigger for each new inquiry and by
// the daily pg_cron job for retries. Deploy with:  supabase functions deploy send-inquiry-email --no-verify-jwt
// (it authenticates callers with the x-webhook-secret header instead of a Supabase JWT).
import { handleRequest } from "./logic.ts";
import { createResendMailer } from "./resend.ts";
import { createSupabaseStore } from "./store.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const REQUIRED = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "WEBHOOK_SECRET",
  "INQUIRY_TO_EMAIL",
  "INQUIRY_FROM_EMAIL",
] as const;

Deno.serve((request) => {
  const missing = REQUIRED.filter((name) => !Deno.env.get(name));
  if (missing.length > 0) {
    // Names only, never values. Nothing is claimed, so inquiries stay "pending" until this is fixed.
    console.error("send-inquiry-email is not configured, missing:", missing.join(", "));
    return new Response(JSON.stringify({ error: "function not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env = (name: (typeof REQUIRED)[number]) => Deno.env.get(name)!;

  return handleRequest(request, {
    secret: env("WEBHOOK_SECRET"),
    store: createSupabaseStore(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY")),
    mailer: createResendMailer(env("RESEND_API_KEY")),
    route: {
      from: env("INQUIRY_FROM_EMAIL"),
      to: env("INQUIRY_TO_EMAIL").split(",").map((address) => address.trim()).filter(Boolean),
    },
    batch: { limit: 40, budgetMs: 100_000, gapMs: 600 },
  });
});
