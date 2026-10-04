import type { Inquiry } from "./email.ts";
import type { Store } from "./logic.ts";

/** PostgREST calls to the claim_/finish_ SQL functions, with the service-role key. */
export function createSupabaseStore(supabaseUrl: string, serviceRoleKey: string, fetchImpl: typeof fetch = fetch): Store {
  const rpc = async (name: string, args: Record<string, unknown>) => {
    const response = await fetchImpl(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!response.ok) throw new Error(`rpc ${name} failed with ${response.status}`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };
  const first = (rows: unknown): Inquiry | null => (Array.isArray(rows) && rows.length > 0 ? (rows[0] as Inquiry) : null);

  return {
    claimOne: async (id) => first(await rpc("claim_inquiry_for_notify", { p_id: id })),
    claimNextRetry: async () => first(await rpc("claim_next_inquiry_retry", {})),
    finish: async (result) => {
      await rpc("finish_inquiry_notify", {
        p_id: result.id,
        p_ok: result.ok,
        p_http_status: result.httpStatus,
        p_error: result.error,
        p_resend_id: result.resendId,
        p_refund_attempt: result.refundAttempt,
      });
    },
  };
}
