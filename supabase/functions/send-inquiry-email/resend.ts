import type { EmailMessage } from "./email.ts";
import type { Mailer, SendResult } from "./logic.ts";

const TIMEOUT_MS = 15_000;

/**
 * Resend's REST API. Any failure is returned as a result (never thrown, and never including the
 * API key): network errors and timeouts have no status; 429 is "rate limited" (quota or request rate).
 */
export function createResendMailer(apiKey: string, fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send(message: EmailMessage, idempotencyKey: string): Promise<SendResult> {
      try {
        const response = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(message),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        const payload = (await response.json().catch(() => ({}))) as { id?: string; name?: string; message?: string };
        if (response.ok && payload.id) return { ok: true, id: payload.id };
        return {
          ok: false,
          status: response.status,
          error: `${response.status} ${payload.name ?? "error"}: ${payload.message ?? "no details"}`.slice(0, 500),
          rateLimited: response.status === 429,
        };
      } catch (error) {
        const reason = error instanceof Error ? `${error.name}: ${error.message}` : "network error";
        return { ok: false, status: null, error: `request failed (${reason})`.slice(0, 500), rateLimited: false };
      }
    },
  };
}
