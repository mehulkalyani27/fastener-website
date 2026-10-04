import { buildEmail, type EmailMessage, type Inquiry } from "./email.ts";

type SendSuccess = { ok: true; id: string };
type SendFailure = { ok: false; status: number | null; error: string; rateLimited: boolean };
export type SendResult = SendSuccess | SendFailure;

const isSent = (result: SendResult): result is SendSuccess => result.ok;

/** Database side: atomic claims and the recording of outcomes (see the claim_/finish_ SQL functions). */
export interface Store {
  claimOne(id: string): Promise<Inquiry | null>;
  claimNextRetry(): Promise<Inquiry | null>;
  finish(result: {
    id: string;
    ok: boolean;
    httpStatus: number | null;
    error: string | null;
    resendId: string | null;
    refundAttempt: boolean;
  }): Promise<void>;
}

export interface Mailer {
  send(message: EmailMessage, idempotencyKey: string): Promise<SendResult>;
}

export type Route = { from: string; to: string[] };

export type NotifyOutcome = "sent" | "failed" | "rate_limited" | "skipped";

/**
 * Sends the notification for one claimed inquiry and records the outcome. The idempotency key is
 * per inquiry, so a retry after an attempt whose result was lost (a timeout) cannot create a second
 * email within Resend's 24-hour window.
 */
export async function sendClaimed(store: Store, mailer: Mailer, route: Route, inquiry: Inquiry): Promise<NotifyOutcome> {
  let result: SendResult;
  try {
    result = await mailer.send(buildEmail(inquiry, route), `inquiry-${inquiry.id}`);
  } catch (error) {
    result = { ok: false, status: null, error: error instanceof Error ? error.message : "send failed", rateLimited: false };
  }

  if (isSent(result)) {
    await store.finish({ id: inquiry.id, ok: true, httpStatus: 200, error: null, resendId: result.id, refundAttempt: false });
    return "sent";
  }
  await store.finish({
    id: inquiry.id,
    ok: false,
    httpStatus: result.status,
    error: result.error,
    resendId: null,
    refundAttempt: result.rateLimited,
  });
  return result.rateLimited ? "rate_limited" : "failed";
}

/** The database trigger's call: notify one inquiry, unless another run already claimed it. */
export async function notifyOne(store: Store, mailer: Mailer, route: Route, id: string): Promise<NotifyOutcome> {
  const inquiry = await store.claimOne(id);
  return inquiry ? sendClaimed(store, mailer, route, inquiry) : "skipped";
}

export type BatchOptions = {
  limit: number;
  /** Stop starting new sends after this many milliseconds (the function has a wall-clock limit). */
  budgetMs: number;
  /** Pause between sends, to stay under Resend's request rate limit. */
  gapMs: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};

export type BatchSummary = { processed: number; sent: number; failed: number; stopped: "done" | "limit" | "time" | "rate_limited" };

/** The daily retry: work through the inquiries that need it, one at a time, oldest first. */
export async function retryBatch(store: Store, mailer: Mailer, route: Route, options: BatchOptions): Promise<BatchSummary> {
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const started = now();
  const summary: BatchSummary = { processed: 0, sent: 0, failed: 0, stopped: "done" };

  while (true) {
    if (summary.processed >= options.limit) return { ...summary, stopped: "limit" };
    if (now() - started >= options.budgetMs) return { ...summary, stopped: "time" };

    const inquiry = await store.claimNextRetry();
    if (!inquiry) return summary;

    const outcome = await sendClaimed(store, mailer, route, inquiry);
    summary.processed++;
    if (outcome === "sent") summary.sent++;
    else summary.failed++;
    // Out of quota or rate limited: everything after this would fail the same way.
    if (outcome === "rate_limited") return { ...summary, stopped: "rate_limited" };

    await sleep(options.gapMs);
  }
}

/** Constant-time comparison, so the shared secret cannot be guessed from response timing. */
export function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export type HandlerDeps = {
  secret: string;
  store: Store;
  mailer: Mailer;
  route: Route;
  batch: Omit<BatchOptions, "now" | "sleep"> & Pick<BatchOptions, "now" | "sleep">;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** POST {"id": "<uuid>"} notifies one inquiry; POST {"mode": "retry"} runs the retry batch. */
export async function handleRequest(request: Request, deps: HandlerDeps): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!secretsMatch(request.headers.get("x-webhook-secret"), deps.secret)) return json({ error: "unauthorized" }, 401);

  let body: { id?: unknown; mode?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }

  try {
    if (body.mode === "retry") return json(await retryBatch(deps.store, deps.mailer, deps.route, deps.batch));
    if (typeof body.id === "string" && UUID.test(body.id)) {
      return json({ result: await notifyOne(deps.store, deps.mailer, deps.route, body.id), id: body.id });
    }
    return json({ error: "expected { id } or { mode: 'retry' }" }, 400);
  } catch (error) {
    // Unexpected failure (e.g. the database is unreachable). Claimed rows stay "sending" and are
    // reclaimed after 10 minutes, so nothing is lost.
    console.error("send-inquiry-email failed:", error instanceof Error ? error.message : "unknown error");
    return json({ error: "internal error" }, 500);
  }
}
