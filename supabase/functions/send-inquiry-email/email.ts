export type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string | null;
  notify_attempts: number;
};

export type EmailMessage = {
  from: string;
  to: string[];
  reply_to?: string;
  subject: string;
  html: string;
  text: string;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** One line, no control characters (so user input can never add a header or break the subject). */
const oneLine = (value: string) => value.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim();

const SAFE_ADDRESS = /^[^\s,;<>"()[\]\\]+@[^\s,;<>"()[\]\\]+\.[^\s,;<>"()[\]\\]+$/;

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const ist = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  return `${ist} IST`;
};

/** The notification sent to the business owner, with every field of the inquiry. */
export function buildEmail(inquiry: Inquiry, route: { from: string; to: string[] }): EmailMessage {
  const name = oneLine(inquiry.name);
  const rows: [string, string][] = [
    ["Name", name],
    ["Phone", oneLine(inquiry.phone)],
    ["Email", oneLine(inquiry.email)],
    ["Received", formatTime(inquiry.created_at)],
    ["Page", oneLine(inquiry.source ?? "—")],
    ["Inquiry ID", inquiry.id],
  ];

  const email = oneLine(inquiry.email);
  const replyable = SAFE_ADDRESS.test(email);
  const preview = oneLine(inquiry.message).slice(0, 110);

  const detail = ([label, value]: [string, string]) =>
    `<tr><td style="padding:10px 0;border-top:1px solid #dde0ea;width:110px;vertical-align:top;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#525873">${label}</td><td style="padding:10px 0;border-top:1px solid #dde0ea;vertical-align:top;font-size:15px;color:#161a2e;word-break:break-word">${escapeHtml(value)}</td></tr>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>New website inquiry</title></head>
<body style="margin:0;padding:0;background:#f3f4f8">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f3f4f8">${escapeHtml(name)}: ${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f8"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:Arial,Helvetica,sans-serif;color:#161a2e">
<tr><td style="background:#1f2440;border-radius:10px 10px 0 0;padding:22px 28px">
<div style="font-size:13px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#ffffff">Metacore Fasteners</div>
<div style="margin-top:4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#a9b0c9">New website inquiry</div>
</td></tr>
<tr><td style="background:#ffffff;padding:28px 28px 8px">
<div style="font-size:22px;line-height:1.3;font-weight:700;color:#161a2e">${escapeHtml(name)} sent you a message</div>
<div style="margin-top:6px;font-size:13px;color:#525873">${escapeHtml(formatTime(inquiry.created_at))}</div>
</td></tr>
<tr><td style="background:#ffffff;padding:8px 28px 4px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${rows.slice(0, 3).map(detail).join("\n")}
</table>
</td></tr>
<tr><td style="background:#ffffff;padding:20px 28px 28px">
<div style="margin-bottom:8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#525873">Message</div>
<div style="white-space:pre-wrap;word-break:break-word;background:#f3f4f8;border-left:3px solid #1f2440;border-radius:4px;padding:14px 16px;font-size:15px;line-height:1.6;color:#161a2e">${escapeHtml(inquiry.message)}</div>
${replyable ? `<div style="margin-top:16px;font-size:13px;color:#525873">Replying to this email answers ${escapeHtml(name)} directly.</div>` : ""}
</td></tr>
<tr><td style="background:#f3f4f8;border-top:1px solid #dde0ea;border-radius:0 0 10px 10px;padding:16px 28px;font-size:12px;line-height:1.6;color:#525873">
Sent from ${escapeHtml(oneLine(inquiry.source ?? "the website"))} &middot; Inquiry ID ${escapeHtml(inquiry.id)}
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    "New website inquiry",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    inquiry.message,
  ].join("\n");

  return {
    from: route.from,
    to: route.to,
    ...(SAFE_ADDRESS.test(email) ? { reply_to: email } : {}),
    subject: `New website inquiry — ${name.slice(0, 60)}`,
    html,
    text,
  };
}
