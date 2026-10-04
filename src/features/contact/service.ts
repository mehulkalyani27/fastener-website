import { contactContent } from "@/data/home";
import type { InquiryFormState, InquiryValues } from "@/features/contact/types";
import { validateInquiry } from "@/features/contact/validation";

export type SupabaseConfig = { url: string; anonKey: string; ipSalt: string };

export type SubmissionContext = {
  /** Page path the form was sent from. */
  source: string | null;
  ip: string | null;
};

const REQUEST_TIMEOUT_MS = 10_000;

/** Salted SHA-256 of the sender's IP, so rate limits work without ever storing the address. */
export async function hashIp(ip: string, salt: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

type SubmitStatus = "ok" | "duplicate" | "rate_limited" | "error";

/** Calls the submit_inquiry database function with the public key: all that key is allowed to do. */
async function submitToSupabase(
  value: InquiryValues,
  context: SubmissionContext,
  config: SupabaseConfig,
  fetchImpl: typeof fetch,
): Promise<SubmitStatus> {
  try {
    const response = await fetchImpl(`${config.url.replace(/\/$/, "")}/rest/v1/rpc/submit_inquiry`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_name: value.name,
        p_phone: value.phone,
        p_email: value.email,
        p_message: value.message,
        p_source: context.source,
        p_ip_hash: context.ip ? await hashIp(context.ip, config.ipSalt) : null,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      // Status only: the body can echo submitted personal data.
      console.error(`contact form: submit_inquiry failed with HTTP ${response.status}`);
      return "error";
    }
    const result = (await response.json()) as { status?: string };
    return result.status === "ok" || result.status === "duplicate" || result.status === "rate_limited" ? result.status : "error";
  } catch (error) {
    console.error("contact form: submit_inquiry request failed:", error instanceof Error ? error.name : "unknown error");
    return "error";
  }
}

/**
 * The whole submission, independent of Next.js so it can be tested: honeypot, validation, storage.
 * The visitor only ever sees whether the inquiry was received; what happens to the notification
 * email afterwards is tracked in the database and never shown here.
 */
export async function processSubmission(
  form: { get(name: string): FormDataEntryValue | null },
  context: SubmissionContext,
  config: SupabaseConfig | null,
  fetchImpl: typeof fetch = fetch,
): Promise<InquiryFormState> {
  // A hidden field real visitors never see: a filled one is a bot. Pretend it worked, store nothing.
  if (typeof form.get("website") === "string" && (form.get("website") as string).trim() !== "") {
    return { status: "success", message: contactContent.successMessage };
  }

  const result = validateInquiry({
    name: form.get("name"),
    phone: form.get("phone"),
    email: form.get("email"),
    message: form.get("message"),
  });
  if (!result.ok) {
    return { status: "error", message: contactContent.invalidMessage, fieldErrors: result.fieldErrors, values: result.values };
  }

  if (!config) {
    console.error("contact form: SUPABASE_URL, SUPABASE_ANON_KEY and INQUIRY_IP_SALT must be set on the server");
    return { status: "error", message: contactContent.errorMessage, values: result.value };
  }

  const status = await submitToSupabase(result.value, context, config, fetchImpl);
  if (status === "ok" || status === "duplicate") return { status: "success", message: contactContent.successMessage };
  return {
    status: "error",
    message: status === "rate_limited" ? contactContent.rateLimitedMessage : contactContent.errorMessage,
    values: result.value,
  };
}
