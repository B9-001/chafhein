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
async function sendAdminNotification(subject: string, html: string, context: string): Promise<void> {
  if (!resend) {
    console.warn(`[Email] RESEND_API_KEY is not configured — skipping ${context} notification email`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error(`[Email] Resend rejected the ${context} notification:`, error);
    }
  } catch (error) {
    console.error(`[Email] Failed to send ${context} notification:`, error);
  }
}

function emailShell(title: string, bodyHtml: string, footer: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color: #91008D;">${title}</h2>
      ${bodyHtml}
      <p style="color: #888; font-size: 12px; margin-top: 24px;">${footer}</p>
    </div>
  `;
}

export type DonationNotification = {
  amount: string;
  donorName: string;
  donorEmail: string;
  message?: string;
};

export async function sendDonationNotification(donation: DonationNotification): Promise<void> {
  const html = emailShell(
    "New Donation Received",
    `
      <p><strong>Amount:</strong> ${formatNaira(donation.amount)}</p>
      <p><strong>Donor:</strong> ${escapeHtml(donation.donorName)} (${escapeHtml(donation.donorEmail)})</p>
      ${donation.message ? `<p><strong>Message:</strong> ${escapeHtml(donation.message)}</p>` : ""}
    `,
    "Sent automatically by the CHAFHEIN website when a donation is submitted."
  );

  await sendAdminNotification(`New donation received — ${formatNaira(donation.amount)}`, html, "donation");
}

export type EventRegistrationNotification = {
  eventTitle: string;
  name: string;
  email: string;
  phone?: string;
};

export async function sendEventRegistrationNotification(
  registration: EventRegistrationNotification
): Promise<void> {
  const html = emailShell(
    "New Event Registration",
    `
      <p><strong>Event:</strong> ${escapeHtml(registration.eventTitle)}</p>
      <p><strong>Name:</strong> ${escapeHtml(registration.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(registration.email)}</p>
      ${registration.phone ? `<p><strong>Phone:</strong> ${escapeHtml(registration.phone)}</p>` : ""}
    `,
    "Sent automatically by the CHAFHEIN website when someone registers for an event."
  );

  await sendAdminNotification(
    `New event registration — ${registration.eventTitle}`,
    html,
    "event registration"
  );
}
