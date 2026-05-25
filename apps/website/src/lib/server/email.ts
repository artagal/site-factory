import type { Listing } from "../../types/deals";

type BookingRequestEmailPayload = {
  businessName: string;
  email: string;
  listingId: string;
  listingTitle: string;
  message: string;
  name: string;
  partySize: number;
  phone: string | null;
  requestedDate: string;
  requestedTime: string;
};

export type EmailSendResult = {
  attempted: boolean;
  error?: string;
  id?: string;
  ok: boolean;
  provider: "disabled" | "resend";
  reason?: string;
  to: string[];
};

type TransactionalEmail = {
  html: string;
  idempotencyKey?: string;
  replyTo?: string | null;
  subject: string;
  text: string;
  to: string[];
};

function clean(value: unknown, max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function getEmailFrom() {
  return clean(process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || process.env.TRANSACTIONAL_EMAIL_FROM, 180);
}

function getReplyTo() {
  return clean(process.env.EMAIL_REPLY_TO || process.env.RESEND_REPLY_TO || process.env.NEXT_PUBLIC_SITE_URL || "", 180) || null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function money(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `$${value}` : "Flexible";
}

function detailsUrl(path: string) {
  const baseUrl = clean(process.env.NEXT_PUBLIC_SITE_URL || "https://gofunmotion.com", 220).replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isTransactionalEmailConfigured() {
  return Boolean(clean(process.env.RESEND_API_KEY, 260) && getEmailFrom());
}

export async function sendTransactionalEmail(email: TransactionalEmail): Promise<EmailSendResult> {
  const apiKey = clean(process.env.RESEND_API_KEY, 260);
  const from = getEmailFrom();
  const to = email.to.map((item) => item.trim().toLowerCase()).filter(isEmail);

  if (!to.length) {
    return { attempted: false, ok: false, provider: "disabled", reason: "No valid recipients.", to: [] };
  }

  if (!apiKey || !from) {
    return { attempted: false, ok: false, provider: "disabled", reason: "Transactional email is not configured.", to };
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: email.html,
      reply_to: email.replyTo ?? getReplyTo() ?? undefined,
      subject: email.subject,
      text: email.text,
      to
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(email.idempotencyKey ? { "Idempotency-Key": email.idempotencyKey } : {})
    },
    method: "POST"
  });

  const result = (await response.json().catch(() => null)) as { id?: string; message?: string; name?: string } | null;
  if (!response.ok) {
    return {
      attempted: true,
      error: result?.message ?? result?.name ?? `Email provider returned ${response.status}.`,
      ok: false,
      provider: "resend",
      to
    };
  }

  return { attempted: true, id: result?.id, ok: true, provider: "resend", to };
}

export function buildBusinessBookingRequestEmail({
  listing,
  request,
  requestId
}: {
  listing: Listing;
  request: BookingRequestEmailPayload;
  requestId: string;
}): TransactionalEmail | null {
  const businessEmail = clean(listing.email, 254).toLowerCase();
  const fallbackEmail = clean(process.env.BOOKING_REQUEST_FALLBACK_EMAIL || process.env.INTERNAL_NOTIFICATIONS_EMAIL, 254).toLowerCase();
  const recipient = isEmail(businessEmail) ? businessEmail : fallbackEmail;
  if (!recipient || !isEmail(recipient) || listing.isDemo) return null;

  const dealUrl = detailsUrl(`/deals/${listing.slug}`);
  const dashboardUrl = detailsUrl("/partner/dashboard");
  const subject = `New booking request: ${request.listingTitle}`;
  const text = [
    `New booking request for ${request.businessName}`,
    "",
    `Deal: ${request.listingTitle}`,
    `Customer: ${request.name}`,
    `Email: ${request.email}`,
    `Phone: ${request.phone ?? "Not provided"}`,
    `Requested: ${request.requestedDate} at ${request.requestedTime}`,
    `Party size: ${request.partySize}`,
    request.message ? `Message: ${request.message}` : "",
    "",
    `Open dashboard: ${dashboardUrl}`,
    `Deal page: ${dealUrl}`
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827">
      <h1 style="font-size:22px;margin:0 0 12px">New booking request</h1>
      <p><strong>${escapeHtml(request.name)}</strong> requested <strong>${escapeHtml(request.listingTitle)}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        <tr><td style="padding:6px 0;color:#6b7280">Requested</td><td style="padding:6px 0"><strong>${escapeHtml(request.requestedDate)} at ${escapeHtml(request.requestedTime)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Party size</td><td style="padding:6px 0">${escapeHtml(request.partySize)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Customer email</td><td style="padding:6px 0">${escapeHtml(request.email)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0">${escapeHtml(request.phone ?? "Not provided")}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Price</td><td style="padding:6px 0">Now ${escapeHtml(money(listing.price))} ${listing.originalPrice ? `(was ${escapeHtml(money(listing.originalPrice))})` : ""}</td></tr>
      </table>
      ${request.message ? `<p><strong>Message:</strong><br>${escapeHtml(request.message)}</p>` : ""}
      <p style="margin-top:20px"><a href="${dashboardUrl}" style="background:#bef264;color:#111827;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:700">Open partner dashboard</a></p>
      <p style="font-size:12px;color:#6b7280">Request ID: ${escapeHtml(requestId)}. Confirm availability before asking the customer to pay.</p>
    </div>
  `;

  return {
    html,
    idempotencyKey: `booking-request-business-${requestId}`,
    replyTo: request.email,
    subject,
    text,
    to: [recipient]
  };
}

export function buildCustomerBookingRequestEmail({
  listing,
  request,
  requestId
}: {
  listing: Listing;
  request: BookingRequestEmailPayload;
  requestId: string;
}): TransactionalEmail | null {
  if (!isEmail(request.email)) return null;

  const profileUrl = detailsUrl("/profile");
  const subject = `Request sent: ${request.listingTitle}`;
  const text = [
    `Your request was sent to ${request.businessName}.`,
    "",
    `Deal: ${request.listingTitle}`,
    `Requested: ${request.requestedDate} at ${request.requestedTime}`,
    `Party size: ${request.partySize}`,
    "",
    "Status: pending. The business will confirm availability before anything is charged.",
    `Track request: ${profileUrl}`,
    `Request ID: ${requestId}`
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827">
      <h1 style="font-size:22px;margin:0 0 12px">Your booking request was sent</h1>
      <p>We sent your request for <strong>${escapeHtml(request.listingTitle)}</strong> to <strong>${escapeHtml(request.businessName)}</strong>.</p>
      <p><strong>Status:</strong> pending. The business will confirm availability before anything is charged.</p>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        <tr><td style="padding:6px 0;color:#6b7280">Requested</td><td style="padding:6px 0"><strong>${escapeHtml(request.requestedDate)} at ${escapeHtml(request.requestedTime)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Party size</td><td style="padding:6px 0">${escapeHtml(request.partySize)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Price</td><td style="padding:6px 0">Now ${escapeHtml(money(listing.price))} ${listing.originalPrice ? `(was ${escapeHtml(money(listing.originalPrice))})` : ""}</td></tr>
      </table>
      <p style="margin-top:20px"><a href="${profileUrl}" style="background:#bef264;color:#111827;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:700">View request status</a></p>
      <p style="font-size:12px;color:#6b7280">Request ID: ${escapeHtml(requestId)}. Do not send payment information through messages.</p>
    </div>
  `;

  return {
    html,
    idempotencyKey: `booking-request-customer-${requestId}`,
    subject,
    text,
    to: [request.email]
  };
}

export async function sendBookingRequestNotifications({
  listing,
  request,
  requestId
}: {
  listing: Listing;
  request: BookingRequestEmailPayload;
  requestId: string;
}) {
  const emails = [
    buildBusinessBookingRequestEmail({ listing, request, requestId }),
    buildCustomerBookingRequestEmail({ listing, request, requestId })
  ].filter((email): email is TransactionalEmail => Boolean(email));

  const results = await Promise.all(emails.map((email) => sendTransactionalEmail(email)));
  return {
    configured: isTransactionalEmailConfigured(),
    results,
    status: results.length && results.every((result) => result.ok) ? "sent" : results.some((result) => result.attempted) ? "partial" : "skipped"
  };
}

export function buildCustomerStatusEmail({
  request,
  requestId,
  status
}: {
  request: BookingRequestEmailPayload;
  requestId: string;
  status: "cancelled" | "confirmed" | "contacted" | "rejected";
}): TransactionalEmail | null {
  if (!isEmail(request.email)) return null;

  const profileUrl = detailsUrl("/profile");
  const statusCopy: Record<typeof status, string> = {
    cancelled: "The business cancelled this request. Choose another deal or open slot.",
    confirmed: "The business confirmed availability. Follow their instructions before arriving.",
    contacted: "The business has reached out or is checking final availability.",
    rejected: "The business could not accept this request."
  };
  const subject = `Booking request ${status}: ${request.listingTitle}`;
  const text = [
    `Status update: ${status}`,
    "",
    `Deal: ${request.listingTitle}`,
    `Business: ${request.businessName}`,
    `Requested: ${request.requestedDate} at ${request.requestedTime}`,
    statusCopy[status],
    "",
    `Track request: ${profileUrl}`,
    `Request ID: ${requestId}`
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827">
      <h1 style="font-size:22px;margin:0 0 12px">Booking request ${escapeHtml(status)}</h1>
      <p>${escapeHtml(statusCopy[status])}</p>
      <p><strong>${escapeHtml(request.listingTitle)}</strong><br>${escapeHtml(request.requestedDate)} at ${escapeHtml(request.requestedTime)}</p>
      <p style="margin-top:20px"><a href="${profileUrl}" style="background:#bef264;color:#111827;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:700">View request status</a></p>
      <p style="font-size:12px;color:#6b7280">Request ID: ${escapeHtml(requestId)}.</p>
    </div>
  `;

  return {
    html,
    idempotencyKey: `booking-status-${status}-${requestId}`,
    subject,
    text,
    to: [request.email]
  };
}

export async function sendBookingStatusNotification({
  request,
  requestId,
  status
}: {
  request: BookingRequestEmailPayload;
  requestId: string;
  status: "cancelled" | "confirmed" | "contacted" | "rejected";
}) {
  const email = buildCustomerStatusEmail({ request, requestId, status });
  if (!email) {
    return {
      configured: isTransactionalEmailConfigured(),
      results: [] as EmailSendResult[],
      status: "skipped"
    };
  }

  const result = await sendTransactionalEmail(email);
  return {
    configured: isTransactionalEmailConfigured(),
    results: [result],
    status: result.ok ? "sent" : result.attempted ? "partial" : "skipped"
  };
}
