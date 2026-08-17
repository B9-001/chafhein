import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Who gets notified for donations and event registrations.
const NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "info@chafhein.ng";

// Resend's shared "onboarding@resend.dev" sender works without verifying a
// domain, but can only deliver to the email address the Resend account was
// signed up with. Once a domain is verified in the Resend dashboard, set
// RESEND_FROM_EMAIL to a real address on that domain (e.g.
// "CHAFHEIN <notifications@chafhein.ng>") to notify any recipient.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CHAFHEIN <onboarding@resend.dev>";

// CHAFHEIN brand palette (kept in sync with app/globals.css's :root block —
// email clients can't read CSS variables, so these are inlined hex values).
const BRAND = {
  purple: "#91008D",
  purpleDark: "#52004F",
  gold: "#FBBF24",
  ink: "#3F0F5C",
  cream: "#F5DFF4",
  white: "#FFFFFF",
  muted: "#6B5B7A",
};

// Email clients load images from a real, public URL — they can't reach
// localhost or bundled Next.js static assets directly. Hosted in Supabase
// Storage (the same "media" bucket already used for campaign/event images)
// so it resolves regardless of which domain the site itself is deployed to.
const LOGO_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/email-assets/chafhein-logo.png`
    : null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNaira(value: string): string {
  const num = Number(value);
  return Number.isNaN(num) ? value : `₦${num.toLocaleString()}`;
}

// Best-effort: a failed notification email should never break the caller's
// flow (the underlying record is already saved in Supabase by the time this
// runs), so every failure is caught and logged rather than thrown.
async function sendBrandedEmail(
  to: string,
  subject: string,
  html: string,
  context: string
): Promise<void> {
  if (!resend) {
    console.warn(`[Email] RESEND_API_KEY is not configured — skipping ${context} email`);
    return;
  }

  try {
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
      console.error(`[Email] Resend rejected the ${context} email:`, error);
    }
  } catch (error) {
    console.error(`[Email] Failed to send ${context} email:`, error);
  }
}

// Table-based layout with every style inlined, since email clients (Outlook
// especially) don't support modern CSS — this is the shared branded shell
// every notification/confirmation email is built on top of.
function emailShell(opts: { preheader: string; heading: string; bodyHtml: string; footerNote: string }): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(opts.heading)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.cream}; font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(opts.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.cream}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:${BRAND.white}; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(63,15,92,0.08);">
            <tr>
              <td style="background-color:${BRAND.purple}; padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    ${
                      LOGO_URL
                        ? `<td style="padding-right:12px; vertical-align:middle;">
                             <img src="${LOGO_URL}" alt="CHAFHEIN" width="36" height="36" style="display:block; width:36px; height:36px; object-fit:contain; border-radius:6px;" />
                           </td>`
                        : ""
                    }
                    <td style="vertical-align:middle;">
                      <span style="color:${BRAND.white}; font-size:20px; font-weight:700; letter-spacing:0.5px; font-family:Georgia,serif;">CHAFHEIN</span>
                      <div style="height:3px; width:40px; background-color:${BRAND.gold}; margin-top:8px; border-radius:2px;"></div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px; color:${BRAND.ink}; font-size:20px; font-weight:700;">${escapeHtml(opts.heading)}</h1>
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:${BRAND.cream};">
                <p style="margin:0; color:${BRAND.muted}; font-size:12px; line-height:1.5;">${opts.footerNote}</p>
                <p style="margin:8px 0 0; color:${BRAND.muted}; font-size:12px;">Connected Hands for Family Health and Empowerment Initiative &middot; Asokoro, Abuja, Nigeria</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0; color:${BRAND.muted}; font-size:13px; width:110px; vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 0; color:${BRAND.ink}; font-size:14px; font-weight:600;">${value}</td>
    </tr>
  `;
}

function ctaButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;">
      <tr>
        <td style="background-color:${BRAND.purple}; border-radius:8px;">
          <a href="${escapeHtml(href)}" style="display:inline-block; padding:12px 24px; color:${BRAND.white}; font-size:14px; font-weight:600; text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `;
}

// --- Donation notifications (admin-facing) ---

export type DonationNotification = {
  amount: string;
  donorName: string;
  donorEmail: string;
  message?: string;
};

export async function sendDonationNotification(donation: DonationNotification): Promise<void> {
  const html = emailShell({
    preheader: `New donation of ${formatNaira(donation.amount)} from ${donation.donorName}`,
    heading: "New Donation Received",
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Amount", formatNaira(donation.amount))}
        ${infoRow("Donor", `${escapeHtml(donation.donorName)} (${escapeHtml(donation.donorEmail)})`)}
        ${donation.message ? infoRow("Message", escapeHtml(donation.message)) : ""}
      </table>
    `,
    footerNote: "Sent automatically when a donation is submitted on the CHAFHEIN website.",
  });

  await sendBrandedEmail(NOTIFY_EMAIL, `New donation received — ${formatNaira(donation.amount)}`, html, "donation notification");
}

// --- Event registration notifications (admin-facing) ---

export type EventRegistrationNotification = {
  eventTitle: string;
  name: string;
  email: string;
  phone?: string;
  webinarLink?: string | null;
};

export async function sendEventRegistrationNotification(
  registration: EventRegistrationNotification
): Promise<void> {
  // Admin-facing: a plain "someone registered" notification. The "Join
  // Webinar" call-to-action belongs only in the registrant's own
  // confirmation email (sendEventRegistrationConfirmation, below) — the
  // admin doesn't need a join button, just the fact of the registration
  // (a plain-text link is included for reference, not as a CTA).
  const html = emailShell({
    preheader: `${registration.name} just registered for ${registration.eventTitle}`,
    heading: "New Event Registration",
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Event", escapeHtml(registration.eventTitle))}
        ${infoRow("Name", escapeHtml(registration.name))}
        ${infoRow("Email", escapeHtml(registration.email))}
        ${registration.phone ? infoRow("Phone", escapeHtml(registration.phone)) : ""}
        ${registration.webinarLink ? infoRow("Type", "Webinar") : ""}
        ${
          registration.webinarLink
            ? infoRow("Webinar Link", `<a href="${escapeHtml(registration.webinarLink)}" style="color:${BRAND.purple}; word-break:break-all;">${escapeHtml(registration.webinarLink)}</a>`)
            : ""
        }
      </table>
    `,
    footerNote: "Sent automatically when someone registers for an event on the CHAFHEIN website.",
  });

  await sendBrandedEmail(
    NOTIFY_EMAIL,
    `New event registration — ${registration.eventTitle}`,
    html,
    "event registration notification"
  );
}

// --- Event registration confirmation (registrant-facing) ---

export type EventRegistrationConfirmation = {
  eventTitle: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  name: string;
  recipientEmail: string;
  webinarLink?: string | null;
};

export async function sendEventRegistrationConfirmation(
  confirmation: EventRegistrationConfirmation
): Promise<void> {
  const isWebinar = Boolean(confirmation.webinarLink);

  const html = emailShell({
    preheader: isWebinar
      ? `You're registered for ${confirmation.eventTitle} — join link inside`
      : `You're registered for ${confirmation.eventTitle}`,
    heading: `You're Registered${isWebinar ? " for the Webinar" : ""}!`,
    bodyHtml: `
      <p style="margin:0 0 16px; color:${BRAND.ink}; font-size:14px; line-height:1.6;">
        Hi ${escapeHtml(confirmation.name)}, thanks for registering for
        <strong>${escapeHtml(confirmation.eventTitle)}</strong>. We're glad to have you join us.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${confirmation.eventDate ? infoRow("Date", escapeHtml(confirmation.eventDate)) : ""}
        ${confirmation.eventLocation ? infoRow("Location", escapeHtml(confirmation.eventLocation)) : ""}
      </table>
      ${
        isWebinar
          ? `
            <p style="margin:20px 0 0; color:${BRAND.ink}; font-size:14px; line-height:1.6;">
              This is a virtual event. Use the button below to join when it starts:
            </p>
            ${ctaButton(confirmation.webinarLink!, "Join the Webinar")}
            <p style="margin:12px 0 0; color:${BRAND.muted}; font-size:12px; word-break:break-all;">
              Or copy this link: ${escapeHtml(confirmation.webinarLink!)}
            </p>
          `
          : `
            <p style="margin:20px 0 0; color:${BRAND.ink}; font-size:14px; line-height:1.6;">
              We'll be in touch with any further details ahead of the event.
            </p>
          `
      }
    `,
    footerNote: "You're receiving this because you registered for an event on the CHAFHEIN website.",
  });

  await sendBrandedEmail(
    confirmation.recipientEmail,
    isWebinar
      ? `You're in! Webinar link for ${confirmation.eventTitle}`
      : `You're registered for ${confirmation.eventTitle}`,
    html,
    "event registration confirmation"
  );
}
